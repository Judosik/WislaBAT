// src/setupUI.js

import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";
import { Water } from "three/addons/objects/Water.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from "three/addons/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CONFIG, WATER_PRESETS, parameters } from "./config.js";

/**
 * Create water mesh
 */
export function createWater() {
  const textureLoader = new THREE.TextureLoader();
  const waterGeometry = new THREE.PlaneGeometry(
    CONFIG.water.size,
    CONFIG.water.size
  );

  const water = new Water(waterGeometry, {
    textureWidth: CONFIG.water.textureWidth,
    textureHeight: CONFIG.water.textureHeight,
    waterNormals: textureLoader.load(CONFIG.assets.waterNormals, (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    sunDirection: new THREE.Vector3(),
    sunColor: CONFIG.water.sunColor,
    waterColor: CONFIG.water.waterColor,
    distortionScale: CONFIG.water.distortionScale,
    fog: false,
  });

  water.rotation.x = -Math.PI / 2;
  water.position.y = parameters.waterLevel;

  return water;
}

/**
 * Create sky mesh
 */
export function createSky() {
  const sky = new Sky();
  sky.scale.setScalar(CONFIG.sky.scale);

  const skyUniforms = sky.material.uniforms;
  skyUniforms["turbidity"].value = CONFIG.sky.turbidity;
  skyUniforms["rayleigh"].value = CONFIG.sky.rayleigh;
  skyUniforms["mieCoefficient"].value = CONFIG.sky.mieCoefficient;
  skyUniforms["mieDirectionalG"].value = CONFIG.sky.mieDirectionalG;

  return sky;
}

/**
 * Setup OrbitControls
 */
export function setupControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = CONFIG.camera.controls.maxPolarAngle;
  controls.target.set(
    CONFIG.camera.controls.target.x,
    CONFIG.camera.controls.target.y,
    CONFIG.camera.controls.target.z
  );
  controls.minDistance = CONFIG.camera.controls.minDistance;
  controls.maxDistance = CONFIG.camera.controls.maxDistance;
  controls.update();

  return controls;
}

/**
 * Update sun position based on elevation/azimuth
 */
export function updateSun(sun, sky, water, directionalLight, parameters) {
  const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
  const theta = THREE.MathUtils.degToRad(parameters.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  // Update sky
  sky.material.uniforms["sunPosition"].value.copy(sun);

  // Update water
  water.material.uniforms["sunDirection"].value.copy(sun).normalize();

  // Update directional light
  directionalLight.position.copy(sun).multiplyScalar(1000);
}

/**
 * Setup GUI with water presets and controls
 */
export function setupGUI(
  parameters,
  water,
  sky,
  directionalLight,
  sun,
  container
) {
  const gui = new GUI();

  // Sky controls
  const folderSky = gui.addFolder("Sky");
  folderSky
    .add(parameters, "elevation", 0, 90, 0.1)
    .onChange(() => updateSun(sun, sky, water, directionalLight, parameters));
  folderSky
    .add(parameters, "azimuth", -180, 180, 0.1)
    .onChange(() => updateSun(sun, sky, water, directionalLight, parameters));
  folderSky.open();

  // Water level controls with presets
  const folderWaterLvl = gui.addFolder("Water Level");

  let customController;

  const presetController = folderWaterLvl
    .add(parameters, "waterPreset", Object.keys(WATER_PRESETS))
    .name("Preset")
    .onChange((presetName) => {
      const level = WATER_PRESETS[presetName];

      parameters.waterLevel = level;
      water.position.y = level;

      if (customController) customController.updateDisplay();
    });

  customController = folderWaterLvl
    .add(parameters, "waterLevel", -3, 3, 0.01)
    .name("Water Level (m)")
    .onChange((value) => {
      parameters.waterLevel = value;
      water.position.y = value;
    });

  folderWaterLvl.open();


  // Water distortion controls
  const waterUniforms = water.material.uniforms;
  const folderWater = gui.addFolder("Water");
  folderWater
    .add(waterUniforms.distortionScale, "value", 0, 8, 0.1)
    .name("Distortion Scale");
  folderWater.open();

  // Stats panel
  const stats = new Stats();
  container.appendChild(stats.dom);

  return { gui, stats };
}

/**
 * Update water animation (call in render loop)
 */
export function updateWater(water, delta) {
  water.material.uniforms["time"].value += delta;
}
