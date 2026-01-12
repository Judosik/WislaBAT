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
    far: 100000, // Far plane to see water extending to horizon
    position: { x: 500, y: 500, z: 300 },
    controls: {
      maxPolarAngle: Math.PI * 0.495,
      target: { x: 0, y: 10, z: 0 },
      minDistance: 10.0,
      maxDistance: 5000.0, // Allow zooming out to see full terrain
    },
  },

  // Water settings
  water: {
    textureWidth: 512,
    textureHeight: 512,
    distortionScale: 3.7,
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    size: 50000, // Large plane to extend to horizon
    // Presets: preset name → elevation (meters)
    levelPresets: {
      "Risk : 1 to 10 years": 82.60,
      "Risk : 1 to 100 years": 83.80,
      "Risk : 1 to 500 years": 84.39,
      "Mean level of water": 76.40,
    },
    defaultLevel: 76.40,
  },

  // Sky settings
  sky: {
    scale: 50000, // Match water plane size
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
    terrainTexture: "terrain_data/dem_viz.png",
    heightmap: "terrain_data/dem.tif",
    terrain: "models/model_zeroed.glb", // Primary GLTF model
    waterNormals: "textures/waternormals.jpg",
    environmentHDR: "hdri/environment.hdr",
    terrainMetadata: "terrain_data/metadata.json",
  },

  // Terrain loading strategy
  terrain: {
    useGLTF: true, // Use GLTF as primary source (not DEM)
    useDEMFallback: false, // Don't show DEM first, load GLTF directly
    isModelZeroed: true, // true = model_zeroed.glb (origin centered), false = model.gltf (real coords)
    autoCameraPosition: true, // Automatically position camera based on model bounds
  },

  // Geospatial settings
  geospatial: {
    enabled: true,
    // Vertical exaggeration for better visualization (1.0 = true scale)
    verticalExaggeration: 1.5,
    // Center the terrain at origin for better Three.js handling
    centerAtOrigin: true,
    // Note: All horizontal coordinates use 1:1 mapping in meters
    // Only vertical axis uses exaggeration for better visualization
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
  waterLevel: CONFIG.water.defaultLevel, // 76.00m
  waterPreset: "Mean level of water",
};
