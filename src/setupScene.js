// src/setupScene.js

import * as THREE from "three";
import { CONFIG } from "./config.js";

/**
 * Initialize and return scene, camera, renderer
 * Also sets up lighting and basic environment
 */
export function setupScene(container) {
  // Create scene
  const scene = new THREE.Scene();

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    window.innerWidth / window.innerHeight,
    CONFIG.camera.near,
    CONFIG.camera.far
  );
  camera.position.set(
    CONFIG.camera.position.x,
    CONFIG.camera.position.y,
    CONFIG.camera.position.z
  );

  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(CONFIG.renderer.pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = CONFIG.renderer.toneMappingExposure;
  container.appendChild(renderer.domElement);

  // Add lights
  const { ambientLight, directionalLight, sun } = setupLights(scene);

  return {
    scene,
    camera,
    renderer,
    ambientLight,
    directionalLight,
    sun,
  };
}

/**
 * Setup ambient and directional lighting
 */
function setupLights(scene) {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(
    CONFIG.lighting.ambient.color,
    CONFIG.lighting.ambient.intensity
  );
  scene.add(ambientLight);

  // Directional light (sun)
  const directionalLight = new THREE.DirectionalLight(
    CONFIG.lighting.directional.color,
    CONFIG.lighting.directional.intensity
  );
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = CONFIG.renderer.shadowMapSize;
  directionalLight.shadow.mapSize.height = CONFIG.renderer.shadowMapSize;
  directionalLight.shadow.camera.near =
    CONFIG.lighting.directional.shadowCameraNear;
  directionalLight.shadow.camera.far =
    CONFIG.lighting.directional.shadowCameraFar;

  const size = CONFIG.lighting.directional.shadowCameraSize;
  directionalLight.shadow.camera.left = -size;
  directionalLight.shadow.camera.right = size;
  directionalLight.shadow.camera.top = size;
  directionalLight.shadow.camera.bottom = -size;

  scene.add(directionalLight);

  // Sun vector for sky/water updates
  const sun = new THREE.Vector3();

  return { ambientLight, directionalLight, sun };
}

/**
 * Handle window resize
 */
export function setupWindowResize(camera, renderer) {
  let resizeTimeout;

  function onWindowResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 100); // Throttle to 100ms
  }

  window.addEventListener("resize", onWindowResize);

  return onWindowResize;
}
