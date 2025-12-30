import * as THREE from "three";
import { CONFIG } from "./config.js";

const TERRAIN_SIZE = 200;
const TERRAIN_SEGMENTS = 256;
const HEIGHT_SCALE = CONFIG.heightmap?.scale || 2;
const SHOULD_LOAD_GLTF = CONFIG.useGLTF || false;

export async function loadTerrain(scene) {
  // 1. Load DEM immediately
  let terrain = await loadHeightmapTerrain();
  scene.add(terrain);

  // 2. Background upgrade (only if flag is true)
  if (SHOULD_LOAD_GLTF) {
    upgradeToGLTF(scene, terrain);
  }

  return terrain;
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
    
    // Setup shadows
    newModel.traverse(child => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
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
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height).data;

      const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
      geo.rotateX(-Math.PI / 2);

      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = Math.floor((i % (TERRAIN_SEGMENTS + 1)) / TERRAIN_SEGMENTS * (img.width - 1));
        const y = Math.floor(Math.floor(i / (TERRAIN_SEGMENTS + 1)) / TERRAIN_SEGMENTS * (img.height - 1));
        const bright = data[(y * img.width + x) * 4] / 255;
        pos.setY(i, bright * HEIGHT_SCALE);
      }
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({ 
        map: new THREE.TextureLoader().load(CONFIG.assets.terrainTexture) 
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.receiveShadow = true;
      resolve(mesh);
    };
  });
}