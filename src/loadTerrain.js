import * as THREE from "three";
import { CONFIG } from "./config.js";
import { loadTerrainMetadata, GeoTransform } from "./geoUtils.js";

const TERRAIN_SEGMENTS = 256;
const SHOULD_LOAD_GLTF = CONFIG.useGLTF || false;

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

  // 2. Load DEM immediately
  let terrain = await loadHeightmapTerrain();
  scene.add(terrain);

  // 3. Background upgrade (only if flag is true)
  if (SHOULD_LOAD_GLTF) {
    upgradeToGLTF(scene, terrain);
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