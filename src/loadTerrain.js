import * as THREE from "three";
import { CONFIG } from "./config.js";
import { loadTerrainMetadata, GeoTransform } from "./geoUtils.js";

const TERRAIN_SEGMENTS = 256;

// Global geospatial transform (initialized during load)
let geoTransform = null;

export async function loadTerrain(scene) {
  // 1. Load metadata if geospatial mode is enabled
  if (CONFIG.geospatial.enabled) {
    try {
      const metadata = await loadTerrainMetadata();
      geoTransform = new GeoTransform(metadata);
      console.log("✓ Geospatial metadata loaded");
    } catch (error) {
      console.warn("Failed to load geospatial metadata, using defaults:", error);
      geoTransform = null;
    }
  }

  // 2. Choose loading strategy based on config
  let terrain;

  if (CONFIG.terrain?.useGLTF) {
    // Load GLTF as primary source
    console.log("Loading GLTF terrain model...");
    terrain = await loadGLTFTerrain();
    scene.add(terrain);
  } else {
    // Legacy approach: Load DEM first
    terrain = await loadHeightmapTerrain();
    scene.add(terrain);

    // Background upgrade to GLTF if enabled
    if (CONFIG.terrain?.useDEMFallback) {
      upgradeToGLTF(scene, terrain);
    }
  }

  return terrain;
}

/**
 * Get the geospatial transform instance
 * @returns {GeoTransform|null}
 */
export function getGeoTransform() {
  return geoTransform;
}

/**
 * Load GLTF terrain model as primary source
 * Handles coordinate transformation from EPSG:2178 to Three.js space
 */
async function loadGLTFTerrain() {
  // Dynamic imports
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { DRACOLoader } = await import("three/addons/loaders/DRACOLoader.js");

  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
  loader.setDRACOLoader(draco);

  return new Promise((resolve, reject) => {
    loader.load(
      CONFIG.assets.terrain,
      (gltf) => {
        const model = gltf.scene;
        const isModelZeroed = CONFIG.terrain?.isModelZeroed ?? true;

        // Apply geospatial coordinate transformation
        if (geoTransform && !isModelZeroed) {
          // Original model with real EPSG:2178 coordinates
          console.log("Applying geospatial transformations to GLTF model (real coordinates)...");

          model.traverse((child) => {
            if (child.isMesh) {
              // Transform from EPSG:2178 world coordinates to Three.js scene coordinates
              // The GLTF nodes have translation values in EPSG:2178 (e.g., [7500640, 42.2, -5792232])

              // Get the node's world position (EPSG:2178 coordinates)
              const worldPos = child.position.clone();

              // If there's a parent translation, add it
              if (child.parent && child.parent.position) {
                worldPos.add(child.parent.position);
              }

              // Convert from EPSG:2178 to scene coordinates
              // GLTF uses: +X = East, +Y = Up, +Z = South (negated North)
              // EPSG:2178: X = Northing, Y = Easting, Z = Up
              // Map: GLTF X (east) → EPSG Y, GLTF -Z (north) → EPSG X, GLTF Y → elevation
              const sceneCoords = geoTransform.toSceneCoords(-worldPos.z, worldPos.x);
              const sceneElevation = geoTransform.toSceneElevation(worldPos.y);

              // Update position
              child.position.set(sceneCoords.x, sceneElevation, sceneCoords.z);

              // Apply vertical exaggeration to scale
              child.scale.y *= CONFIG.geospatial.verticalExaggeration;

              // Setup shadows
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          console.log("✓ GLTF terrain loaded with geospatial coordinates");
        } else {
          // Zeroed model (origin-centered)
          console.log("Loading zeroed GLTF model (origin-centered)...");

          // First, check if model actually has EPSG coordinates that need zeroing
          let needsZeroing = false;
          model.traverse((child) => {
            if (child.isMesh && !needsZeroing) {
              // Check if any position values are in EPSG range (> 100,000)
              const pos = child.position;
              if (Math.abs(pos.x) > 100000 || Math.abs(pos.z) > 100000) {
                needsZeroing = true;
              }
            }
          });

          if (needsZeroing && geoTransform) {
            console.log("⚠ Model contains EPSG coordinates - applying transformation to center at origin");

            // Transform each mesh from EPSG:2178 to centered Three.js coordinates
            model.traverse((child) => {
              if (child.isMesh) {
                // Get world position in EPSG:2178
                const worldPos = child.position.clone();

                // Transform to scene coordinates (centered at origin)
                // GLTF X (east) → EPSG Y, GLTF -Z (north) → EPSG X
                const sceneCoords = geoTransform.toSceneCoords(-worldPos.z, worldPos.x);

                // Set position: X,Z transformed, Y (elevation) kept as-is
                child.position.set(sceneCoords.x, worldPos.y, sceneCoords.z);

                // Apply vertical exaggeration
                child.scale.y *= CONFIG.geospatial.verticalExaggeration;
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
          } else {
            // Model is already properly zeroed
            console.log("Model is already centered at origin");

            model.traverse((child) => {
              if (child.isMesh) {
                child.scale.y *= CONFIG.geospatial.verticalExaggeration;
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
          }

          console.log("✓ GLTF terrain loaded (zeroed model)");
        }

        // Store model type info for camera positioning
        model.userData.isZeroed = isModelZeroed;
        model.userData.geoTransform = geoTransform;

        resolve(model);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Loading GLTF: ${percent.toFixed(1)}%`);
      },
      (error) => {
        console.error("Failed to load GLTF terrain:", error);
        reject(error);
      }
    );
  });
}

/**
 * Calculate and set optimal camera position based on model bounds
 * @param {THREE.Camera} camera - The camera to position
 * @param {THREE.Object3D} model - The loaded terrain model
 */
export function setCameraForModel(camera, model) {
  if (!CONFIG.terrain?.autoCameraPosition) {
    console.log("Auto camera positioning disabled");
    return;
  }

  // Calculate bounding box of the entire model
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  console.log("Model bounding box:", {
    center: center.toArray().map(v => v.toFixed(1)),
    size: size.toArray().map(v => v.toFixed(1)),
    min: box.min.toArray().map(v => v.toFixed(1)),
    max: box.max.toArray().map(v => v.toFixed(1)),
  });

  // Calculate optimal camera distance
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.3; // Reduced from 0.6 to 0.3 for closer view

  // Position camera at an angle for better view
  const cameraHeight = cameraDistance * 0.5;
  const cameraOffset = cameraDistance * 0.7;

  camera.position.set(
    center.x + cameraOffset,
    center.y + cameraHeight,
    center.z + cameraOffset
  );

  console.log(`✓ Camera positioned automatically:`, {
    position: camera.position.toArray().map(v => v.toFixed(1)),
    lookAt: center.toArray().map(v => v.toFixed(1)),
    modelSize: size.toArray().map(v => v.toFixed(1)),
    cameraDistance: cameraDistance.toFixed(1),
  });

  // Store the target for orbit controls
  camera.userData.target = center;

  return center;
}

async function upgradeToGLTF(scene, oldTerrain) {
  // Dynamic imports keep the initial bundle small
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { DRACOLoader } = await import("three/addons/loaders/DRACOLoader.js");

  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
  loader.setDRACOLoader(draco);

  loader.load(CONFIG.assets.terrain, (gltf) => {
    const newModel = gltf.scene;

    // Apply geospatial transforms if available
    if (geoTransform) {
      const dims = geoTransform.getTerrainDimensions();

      // Calculate scale to match geospatial dimensions
      // Assumes GLTF is exported in a normalized or specific scale
      newModel.traverse((child) => {
        if (child.isMesh && child.geometry) {
          child.geometry.computeBoundingBox();
          const bbox = child.geometry.boundingBox;
          const modelWidth = bbox.max.x - bbox.min.x;
          const modelHeight = bbox.max.z - bbox.min.z;

          if (modelWidth > 0 && modelHeight > 0) {
            // Scale to match geospatial dimensions
            const scaleX = dims.width / modelWidth;
            const scaleZ = dims.height / modelHeight;

            child.scale.set(
              scaleX,
              CONFIG.geospatial.verticalExaggeration,
              scaleZ
            );

            console.log(`Applied geospatial scale: ${scaleX.toFixed(3)}, ${scaleZ.toFixed(3)}`);
          }
        }
      });
    }

    // Setup shadows
    newModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Swap and cleanup
    scene.remove(oldTerrain);
    scene.add(newModel);

    // Free memory
    oldTerrain.geometry.dispose();
    oldTerrain.material.dispose();
    console.log("✓ Terrain upgraded to GLTF");
  });
}

async function loadHeightmapTerrain() {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = CONFIG.assets.heightmap;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height).data;

      // Determine terrain dimensions
      let terrainWidth, terrainHeight, heightScale, elevationOffset;

      if (geoTransform) {
        // Use geospatial dimensions
        const dims = geoTransform.getTerrainDimensions();
        terrainWidth = dims.width;
        terrainHeight = dims.height;
        heightScale = geoTransform.getHeightScale();
        elevationOffset = geoTransform.getElevationOffset();
      } else {
        // Fallback to legacy behavior
        terrainWidth = 200;
        terrainHeight = 200;
        heightScale = CONFIG.heightmap?.scale || 30;
        elevationOffset = 0;
      }

      const geo = new THREE.PlaneGeometry(
        terrainWidth,
        terrainHeight,
        TERRAIN_SEGMENTS,
        TERRAIN_SEGMENTS
      );
      geo.rotateX(-Math.PI / 2);

      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = Math.floor(
          ((i % (TERRAIN_SEGMENTS + 1)) / TERRAIN_SEGMENTS) * (img.width - 1)
        );
        const y = Math.floor(
          (Math.floor(i / (TERRAIN_SEGMENTS + 1)) / TERRAIN_SEGMENTS) *
            (img.height - 1)
        );
        const bright = data[(y * img.width + x) * 4] / 255;

        // Apply geospatial scaling: normalized value (0-1) → elevation range
        const elevation = elevationOffset + bright * heightScale;
        pos.setY(i, elevation);
      }
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load(CONFIG.assets.terrainTexture),
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.receiveShadow = true;
      mesh.castShadow = true;

      // Add metadata for debugging
      mesh.userData.geospatial = geoTransform ? true : false;
      mesh.userData.dimensions = { terrainWidth, terrainHeight, heightScale };

      resolve(mesh);
    };
  });
}