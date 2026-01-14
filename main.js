// main.js

import * as THREE from "three";
import { CONFIG, parameters } from "./src/config.js";
import { setupScene, setupWindowResize } from "./src/setupScene.js";
import { loadTerrain, setCameraForModel } from "./src/loadTerrain.js";
import {
  createWater,
  createSky,
  createWaterAsync,
  createSkyAsync,
  setupControls,
  setupGUI,
  updateWater,
  updateSun,
  setupCoordinateDisplay,
} from "./src/setupUI.js";
import { LoadingScreen } from "./src/loadingScreen.js";

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
 * Main initialization with loading progress
 */
async function init() {
  const container = document.getElementById("container");

  // Create loading screen
  const loader = new LoadingScreen();

  try {
    // Step 1: Setup scene (0% → 5%)
    loader.update(0, 'Initializing scene...');
    const sceneSetup = setupScene(container);
    app.scene = sceneSetup.scene;
    app.camera = sceneSetup.camera;
    app.renderer = sceneSetup.renderer;
    app.directionalLight = sceneSetup.directionalLight;
    app.sun = sceneSetup.sun;
    loader.update(5, 'Scene initialized');

    // Step 2: Load terrain (5% → 75%)
    loader.update(5, 'Loading terrain model...');
    app.terrain = await loadTerrain(app.scene, (progress) => {
      // Map GLTF progress (0-100) to our range (5-75)
      const percent = 5 + (progress * 0.70);
      loader.update(percent, `Loading terrain model... ${Math.round(progress)}%`);
    });

    const cameraTarget = setCameraForModel(app.camera, app.terrain);
    if (cameraTarget) {
      app.cameraTarget = cameraTarget;
    }
    loader.update(75, 'Terrain loaded');

    // Step 3: Setup geospatial (75% → 80%)
    loader.update(75, 'Applying coordinate transforms...');
    // (already done in loadTerrain)
    loader.update(80, 'Geospatial setup complete');

    // Step 4: Create water (80% → 90%)
    loader.update(80, 'Creating water surface...');
    app.water = await createWaterAsync();
    app.scene.add(app.water);
    loader.update(90, 'Water created');

    // Step 5: Create sky (90% → 95%)
    loader.update(90, 'Creating sky...');
    app.sky = await createSkyAsync();
    app.scene.add(app.sky);
    loader.update(95, 'Sky created');

    // Step 6: Setup controls (95% → 97%)
    loader.update(95, 'Setting up controls...');
    app.controls = setupControls(app.camera, app.renderer);
    if (app.cameraTarget) {
      app.controls.target.copy(app.cameraTarget);
      app.controls.update();
    }
    setupWindowResize(app.camera, app.renderer);
    loader.update(97, 'Controls ready');

    // Step 7: Setup UI (97% → 100%)
    loader.update(97, 'Setting up UI...');
    const { gui, stats } = setupGUI(
      parameters,
      app.water,
      app.sky,
      app.directionalLight,
      app.sun,
      container
    );
    app.stats = stats;

    if (CONFIG.geospatial?.enabled) {
      setupCoordinateDisplay(app.camera, app.terrain, container);
    }

    // Initial sun position
    updateSun(app.sun, app.sky, app.water, app.directionalLight, parameters);

    loader.update(100, 'Complete!');

    // Hide loading screen after brief delay
    setTimeout(() => {
      loader.hide();
    }, 500);

    console.log("✓ Initialization complete");

    // Start animation loop
    app.renderer.setAnimationLoop(animate);

  } catch (error) {
    console.error('Initialization failed:', error);
    loader.update(0, 'Error: ' + error.message);
  }
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
