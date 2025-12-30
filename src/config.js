// src/config.js

export const CONFIG = {
  // Renderer settings
  renderer: {
    pixelRatio: window.devicePixelRatio,
    toneMapping: "ACESFilmic",
    toneMappingExposure: 0.5,
    shadowMapSize: 2048,
  },

  // Camera settings
  camera: {
    fov: 45,
    near: 1,
    far: 2000,
    position: { x: 30, y: 120, z: 130 },
    controls: {
      maxPolarAngle: Math.PI * 0.495,
      target: { x: 0, y: 10, z: 0 },
      minDistance: 10.0,
      maxDistance: 180.0,
    },
  },

  // Water settings
  water: {
    textureWidth: 512,
    textureHeight: 512,
    distortionScale: 3.7,
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    size: 10000,
    // Presets: preset name → elevation (meters)
    levelPresets: {
      Low: 0.2,
      Mid: 0.54,
      High: 1.2,
      Mean: 2.0,
    },
    defaultLevel: 0.54,
  },

  // Sky settings
  sky: {
    scale: 10000,
    turbidity: 10,
    rayleigh: 2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
  },

  // Lighting settings
  lighting: {
    ambient: {
      color: 0xffffff,
      intensity: 0.5,
    },
    directional: {
      color: 0xffffff,
      intensity: 1.0,
      shadowCameraNear: 0.5,
      shadowCameraFar: 5000,
      shadowCameraSize: 500,
    },
    sun: {
      elevation: 4, // degrees
      azimuth: -152, // degrees
    },
  },

  // Asset paths
  assets: {
    terrain: "models/terrain.glb",
    waterNormals: "textures/waternormals.jpg",
    environmentHDR: "hdri/environment.hdr",
  },
};

// Water level presets as object for easy access
export const WATER_PRESETS = CONFIG.water.levelPresets;

// Shorthand for parameters that GUI will control
export const parameters = {
  elevation: CONFIG.lighting.sun.elevation,
  azimuth: CONFIG.lighting.sun.azimuth,
  waterLevel: CONFIG.water.defaultLevel,
  waterPreset: "Mean",
};
