// main.js

import * as THREE from "three";
import { CONFIG, parameters } from "./src/config.js";
import { setupScene, setupWindowResize } from "./src/setupScene.js";
import { loadTerrain } from "./src/loadTerrain.js";
import {
  createWater,
  createSky,
  setupControls,
  setupGUI,
  updateWater,
  updateSun,
} from "./src/setupUI.js";

// Global objects
let app = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  water: null,
  sky: null,
  directionalLight: null,
  sun: null,
  terrain: null,
  stats: null,
  clock: new THREE.Clock(),
};

/**
 * Main initialization
 */
async function init() {
  const container = document.getElementById("container");

  // Step 1: Setup core Three.js
  console.log("Inicjowanie sceny...");
  const sceneSetup = setupScene(container);
  app.scene = sceneSetup.scene;
  app.camera = sceneSetup.camera;
  app.renderer = sceneSetup.renderer;
  app.directionalLight = sceneSetup.directionalLight;
  app.sun = sceneSetup.sun;

  // Step 2: Load terrain
  console.log("Przetwarzanie terenu...");
  try {
    app.terrain = await loadTerrain(app.scene);
  } catch (error) {
    console.error("Terrain loading failed:", error);
  }

  // Step 3: Create water and sky
  console.log("Creating water and sky...");
  app.water = createWater();
  app.scene.add(app.water);

  app.sky = createSky();
  app.scene.add(app.sky);

  // Step 4: Setup controls
  console.log("Setting up controls...");
  app.controls = setupControls(app.camera, app.renderer);
  setupWindowResize(app.camera, app.renderer);

  // Step 5: Setup GUI and stats
  console.log("Setting up UI...");
  const { gui, stats } = setupGUI(
    parameters,
    app.water,
    app.sky,
    app.directionalLight,
    app.sun,
    container
  );
  app.stats = stats;

  // Initial sun position
  updateSun(app.sun, app.sky, app.water, app.directionalLight, parameters);

  console.log("✓ Initialization complete");

  // Start animation loop
  app.renderer.setAnimationLoop(animate);
}

/**
 * Animation loop
 */
function animate() {
  const delta = app.clock.getDelta();

  // Update animations
  updateWater(app.water, delta);
  app.controls.update();

  // Render
  app.renderer.render(app.scene, app.camera);
  app.stats.update();
}

// Start when DOM is ready
init().catch(console.error);
