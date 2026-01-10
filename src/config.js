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
      "Risk : 1 to 10 years": 0.2,
      "Risk : 1 to 100 years": 0.54,
      "Risk : 1 to 500 years": 1.2,
      "Mean level of water": 2.0,
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
    terrainTexture: "terrain_data/orto_phot.png",
    heightmap: "terrain_data/dem.png",
    terrain: "models/terrain.glb",
    waterNormals: "textures/waternormals.jpg",
    environmentHDR: "hdri/environment.hdr",
    terrainMetadata: "terrain_data/metadata.json",
  },

  // Geospatial settings
  geospatial: {
    enabled: true,
    // Vertical exaggeration for better visualization (1.0 = true scale)
    verticalExaggeration: 1.5,
    // Center the terrain at origin for better Three.js handling
    centerAtOrigin: true,
    // Scale factor to convert from CRS units to Three.js units
    // For EPSG:2180 (meters), using 1:1000 scale (1 Three.js unit = 1km)
    scaleToThreeJS: 0.001,
  },

  // Heightmap-specific settings (fallback if GLTF not used)
  heightmap: {
    scale: 30.0, // Will be overridden by metadata if available
  },
};

// Water level presets as object for easy access
export const WATER_PRESETS = CONFIG.water.levelPresets;

// Shorthand for parameters that GUI will control
export const parameters = {
  elevation: CONFIG.lighting.sun.elevation,
  azimuth: CONFIG.lighting.sun.azimuth,
  waterLevel: CONFIG.water.defaultLevel,
  waterPreset: "Mean level of water",
};
