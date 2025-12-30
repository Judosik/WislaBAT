// src/loadTerrain.js

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { CONFIG } from "./config.js";

/**
 * Load glTF terrain model with Draco compression support
 * Falls back to simple plane if loading fails
 */
export function loadTerrain(scene) {
  return new Promise((resolve) => {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    gltfLoader.setDRACOLoader(dracoLoader);

    let terrainLoaded = false;

    // Timeout: Fallback po 10 sekundach
    setTimeout(() => {
      if (!terrainLoaded) {
        console.warn("⚠ Switching to fallback (timeout)");
        const fallback = createFallbackTerrain();
        scene.add(fallback);
        resolve(fallback);
      }
    }, 10000);

    gltfLoader.load(
      CONFIG.assets.terrain,
      (gltf) => {
        if (terrainLoaded) return; // Ignore if fallback already used
        terrainLoaded = true;

        const terrain = gltf.scene;
        terrain.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(terrain);
        console.log("✓ Terrain loaded");
        resolve(terrain);
      },
      null, // progress - optional
      (error) => {
        if (terrainLoaded) return;
        terrainLoaded = true;

        console.warn("⚠ Load error, using fallback:", error.message);
        const fallback = createFallbackTerrain();
        scene.add(fallback);
        resolve(fallback);
      }
    );
  });
}


/**
 * Create simple plane as fallback if glTF fails to load
 */
function createFallbackTerrain() {
  const geometry = new THREE.PlaneGeometry(200, 200, 32, 32);
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.8,
    metalness: 0.2,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = "FallbackTerrain"; // Debug identifier

  return mesh;
}
