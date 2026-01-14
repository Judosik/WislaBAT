// src/setupUI.js

import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";
import { Water } from "three/addons/objects/Water.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from "three/addons/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CONFIG, WATER_PRESETS, parameters } from "./config.js";
import { getGeoTransform } from "./loadTerrain.js";
import { formatEPSG2180, formatElevation } from "./geoUtils.js";

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
    .add(parameters, "waterLevel", 76, 135, 0.01)
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

/**
 * Setup coordinate display panel
 * Shows EPSG:2180 coordinates and elevation when geospatial mode is enabled
 */
export function setupCoordinateDisplay(camera, terrain, container) {
  if (!CONFIG.geospatial.enabled) return null;

  const geoTransform = getGeoTransform();
  if (!geoTransform) return null;

  // Create coordinate display panel
  const coordPanel = document.createElement("div");
  coordPanel.id = "coord-display";
  coordPanel.style.cssText = `
    position: absolute;
    bottom: 50px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 10px 15px;
    font-family: monospace;
    font-size: 12px;
    border-radius: 4px;
    pointer-events: none;
    line-height: 1.6;
  `;
  coordPanel.innerHTML = `
    <div><strong>EPSG:2178 Coordinates</strong></div>
    <div id="coord-xy">X: -, Y: -</div>
    <div id="coord-elev">Elevation: -</div>
  `;
  container.appendChild(coordPanel);

  // Setup raycaster for terrain intersection
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycast to terrain
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(terrain, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;

      // Convert scene coordinates to EPSG:2178
      const geoCoords = geoTransform.toGeoCoords(point.x, point.z);

      // For zeroed model, Y is already in meters (with vertical exaggeration applied)
      // Just divide by vertical exaggeration to get real elevation
      const elevation = point.y / CONFIG.geospatial.verticalExaggeration;

      // Update display
      // geoCoords: x = northing, y = easting
      document.getElementById("coord-xy").textContent =
        `X: ${geoCoords.x.toFixed(2)}m N, Y: ${geoCoords.y.toFixed(2)}m E`;
      document.getElementById("coord-elev").textContent =
        `Elevation: ${elevation.toFixed(2)} m`;
    }
  }

  window.addEventListener("mousemove", onMouseMove);

  return coordPanel;
}

/**
 * Create water mesh asynchronously (non-blocking)
 * Yields control to allow progress bar updates
 */
export async function createWaterAsync() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const water = createWater();
      resolve(water);
    });
  });
}

/**
 * Create sky mesh asynchronously (non-blocking)
 * Yields control to allow progress bar updates
 */
export async function createSkyAsync() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const sky = createSky();
      resolve(sky);
    });
  });
}
