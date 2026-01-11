# WislaBAT - 3D Terrain and Water Level Visualization

> 🇬🇧 English version | [🇵🇱 Wersja polska](README_PL.md)

> Interactive 3D visualization of flood scenarios using photogrammetric and geospatial data in EPSG:2178 coordinate system (Polish CS92)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-r170-blue.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)

![WislaBAT Screenshot](docs/screenshot.png)

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Geospatial Data Configuration](#geospatial-data-configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Data Preparation](#data-preparation)
- [Deployment](#deployment)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Technical Documentation](#technical-documentation)
- [License](#license)
- [Authors](#authors)

## Project Description

**WislaBAT** is a 3D visualization tool for flood hazard scenarios based on UAV photogrammetry data and Digital Elevation Models (DEM). The project uses WebGL (Three.js) to render interactive terrain models with full support for the EPSG:2178 (Polish CS92) coordinate system, enabling precise spatial analysis and simulation of various water levels.

### Who is it for?

- **Geoinformatics specialists** - spatial data analysis with precise coordinates
- **Hydrologists** - flood scenario simulation
- **Urban planners** - risk assessment and spatial planning
- **Researchers** - UAV terrain data visualization

## Features

### 🌍 Geospatial Support
- ✅ Full EPSG:2178 (Polish CS92) support with metric scaling
- ✅ Automatic GeoTIFF metadata loading
- ✅ Real-time interactive coordinate display
- ✅ Scene ↔ reference system coordinate conversion

### 🗺️ Terrain Loading and Rendering
- ✅ **Primary GLTF model**: High-fidelity photogrammetric terrain with Draco compression
- ✅ Automatic coordinate transformation from EPSG:2178 to Three.js space
- ✅ DEM heightmap fallback support for rapid prototyping
- ✅ Automatic scaling based on real-world dimensions
- ✅ Configurable vertical exaggeration

### 💧 Water Simulation
- ✅ Interactive water level control (presets + custom)
- ✅ Realistic water surface animation
- ✅ Dynamic reflections and distortions

### ☀️ Lighting and Rendering
- ✅ Sky shader with sun position control (elevation/azimuth)
- ✅ Real-time dynamic shadows
- ✅ Tone mapping (ACES Filmic)
- ✅ Responsive rendering with adaptive resolution

### 🎮 User Interface
- ✅ Orbit controls (rotate, zoom, pan)
- ✅ GUI with water level presets
- ✅ Geospatial coordinates panel
- ✅ Performance statistics (FPS, memory)

## Demo

🔗 **[View live demo](https://judosik.github.io/WislaBAT/)**

## Installation

### Requirements

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **GDAL** (optional, for GeoTIFF metadata extraction)

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/Judosik/WislaBAT.git
cd WislaBAT

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:5173
```

### Installation Verification

After starting, you should see in the console:

```
✓ Initialization complete
✓ Geospatial metadata loaded (if configured)
```

## Geospatial Data Configuration

### Quick Start (5 minutes)

1. **Extract metadata from your GeoTIFF:**

```bash
# Install GDAL (if you don't have it)
# Windows: https://gdal.org/download.html
# Linux: sudo apt install gdal-bin
# macOS: brew install gdal

# Check metadata
gdalinfo terrain_data/dem.tif
```

2. **Update `terrain_data/metadata.json`:**

Copy values from `gdalinfo`:

```json
{
  "crs": "EPSG:2178",
  "bounds": {
    "minX": 650000,  // Upper Left X
    "maxX": 680000,  // Lower Right X
    "minY": 480000,  // Lower Right Y
    "maxY": 510000   // Upper Left Y
  },
  "elevation": {
    "min": -5.0,     // from gdalinfo -stats
    "max": 120.0,
    "unit": "meters"
  },
  "resolution": {
    "x": 30.0,       // Pixel Size
    "y": 30.0,
    "unit": "meters"
  }
}
```

3. **Done!** Refresh the browser and hover over the terrain - you'll see EPSG:2178 coordinates.

### Detailed Documentation

Complete geospatial configuration guide: **[GEOSPATIAL_SETUP.md](GEOSPATIAL_SETUP.md)** | **[Polish version](GEOSPATIAL_SETUP_PL.md)**

Includes:
- Data format conversion
- Scaling adjustments
- Coordinate troubleshooting
- Examples for different Polish regions

## Usage

### Basic Controls

| Action | Control |
|--------|----------|
| **Camera rotation** | Left mouse button + drag |
| **Pan** | Right mouse button + drag |
| **Zoom** | Mouse wheel |
| **Water level** | GUI → Water Level → Preset/Custom |
| **Sun position** | GUI → Sky → Elevation/Azimuth |
| **Coordinates** | Hover mouse over terrain |

### GUI Interface

**Water Level**
- **Preset**: Select predefined scenario
  - Risk: 1 to 10 years (0.2m)
  - Risk: 1 to 100 years (0.54m)
  - Risk: 1 to 500 years (1.2m)
  - Mean level of water (2.0m)
- **Water Level (m)**: Custom height -3 to 3m

**Sky**
- **Elevation**: Sun height 0-90° (4° = sunrise/sunset)
- **Azimuth**: Sun direction -180° to 180° (-152° = default)

**Water**
- **Distortion Scale**: Wave intensity 0-8 (3.7 = default)

## Project Structure

```
WislaBAT/
├── index.html                 # HTML entry point
├── main.js                    # Main application file
├── package.json               # npm dependencies
├── vite.config.js             # Vite configuration
│
├── src/
│   ├── config.js              # Central configuration
│   ├── geoUtils.js            # EPSG:2178 geospatial utilities
│   ├── loadTerrain.js         # DEM + GLTF loading
│   ├── setupScene.js          # Three.js initialization
│   └── setupUI.js             # GUI, water, sky, controls
│
├── terrain_data/
│   ├── dem.png                # Heightmap (fallback/prototyping)
│   ├── orto_phot.png          # Orthophoto texture
│   └── metadata.json          # Geospatial metadata ← CONFIGURE THIS
│
├── models/
│   └── model_zeroed.glb       # Primary GLTF terrain model (Draco compressed)
│
├── textures/
│   └── waternormals.jpg       # Water normal map
│
├── docs/
│   └── screenshot.png         # Project screenshot
│
└── dist/                      # Production build (generated)
```

## Configuration

### Basic Settings - `src/config.js`

```javascript
export const CONFIG = {
  // Rendering
  renderer: {
    toneMappingExposure: 0.5,    // Scene brightness
    shadowMapSize: 2048,          // Shadow quality (512/1024/2048/4096)
  },

  // Camera
  camera: {
    fov: 45,                      // Field of view
    position: { x: 30, y: 120, z: 130 },
  },

  // Geospatial
  geospatial: {
    enabled: true,                // Enable/disable geospatial mode
    verticalExaggeration: 1.5,    // Height scaling (1.0 = true scale)
    scaleToThreeJS: 0.001,        // 1 Three.js unit = 1km
  },

  // Water
  water: {
    distortionScale: 3.7,         // Wave intensity
    defaultLevel: 0.54,           // Default level (m)
  },

  // Lighting
  lighting: {
    sun: {
      elevation: 4,               // Sun height (degrees)
      azimuth: -152,              // Sun direction (degrees)
    },
  },
};
```

### Advanced - Terrain Scaling

Adjust `scaleToThreeJS` based on terrain size:

| Terrain Size | scaleToThreeJS | 1 unit = |
|--------------|----------------|----------|
| < 5 km       | 0.01 - 0.05    | 20-100m  |
| 5-50 km      | 0.001 - 0.01   | 100m-1km |
| > 50 km      | 0.0001 - 0.001 | 1-10km   |

## Data Preparation

### 1. Heightmap (DEM)

**From GeoTIFF:**
```bash
# Convert GeoTIFF → PNG (8-bit)
gdal_translate -of PNG -scale dem.tif dem.png
```

**From point cloud:**
```bash
# LAS/LAZ → GeoTIFF (GDAL/PDAL)
pdal pipeline pipeline.json
```

**Requirements:**
- Format: PNG (8-bit grayscale) or TIFF
- Resolution: 512x512 to 2048x2048
- Height range: normalized 0-255

### 2. Orthophoto (texture)

```bash
# Reduce orthophoto size to optimal dimensions
gdal_translate -outsize 2048 2048 orthophoto.tif orthophoto.png
```

**Requirements:**
- Format: PNG/JPG
- Size: 1024x1024 to 4096x4096 (recommended: 2048x2048)
- Compression: JPG quality 85-95

### 3. GLTF Model (optional)

**Blender workflow:**

1. Import → photogrammetry (OBJ/PLY/FBX)
2. Mesh cleanup:
   - Decimate modifier (target: 40-100k tris)
   - Remove doubles
   - Recalculate normals
3. Origin → Set to lowest point
4. Apply all transforms (Ctrl+A)
5. Export → glTF 2.0:
   - ✅ Draco compression (level 7)
   - ✅ +Y up
   - ✅ Include normals
   - ❌ Cameras/lights

**Command line (gltf-transform):**
```bash
npm install -g @gltf-transform/cli

gltf-transform draco input.glb output.glb \
  --compression 7 \
  --quantize-position 14 \
  --quantize-normal 10
```

**Target:** < 20MB for GitHub Pages

## Deployment

### GitHub Pages

```bash
# 1. Build project
npm run build

# 2. Deploy to gh-pages branch
npm run deploy   # if configured

# OR manually:
git add dist -f
git commit -m "Build"
git subtree push --prefix dist origin gh-pages
```

### Custom Server

```bash
# Build
npm run build

# Output in /dist is ready to copy to HTTP server
# Apache/Nginx/Cloudflare Pages/Netlify/Vercel
```

## Development

### Running Dev Server

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
```

### Adding Features

```javascript
// 1. Create new module
// src/myFeature.js
export function myFeature() {
  // implementation
}

// 2. Import in main.js
import { myFeature } from './src/myFeature.js';

// 3. Use in init()
async function init() {
  // ...
  myFeature();
}
```

### Code Structure

- **Modular**: Each file = one responsibility
- **ES6+**: Import/export, async/await, arrow functions
- **Configuration**: All constants in `src/config.js`
- **Comments**: JSDoc for public APIs

### Naming Conventions

```javascript
// Files
setupScene.js       // camelCase
geoUtils.js

// Functions/variables
function loadTerrain() {}
const terrainMesh = ...

// Classes (if used)
class GeoTransform {}

// Constants
const TERRAIN_SEGMENTS = 256;
```

## Troubleshooting

### Terrain not loading

**Problem:** Black screen, no terrain in console

**Solution:**
1. Check browser console (F12)
2. Verify paths in `src/config.js`:
   ```javascript
   assets: {
     heightmap: "terrain_data/dem.png",  // path relative to public/
   }
   ```
3. Ensure files are in correct folders

### Coordinates show wrong values

**Problem:** EPSG:2178 coordinates out of range for Poland

**Solution:**
1. Check `terrain_data/metadata.json` - bounds must be in EPSG:2178 (meters)
2. Use `gdalinfo` to verify source GeoTIFF CRS
3. If data is in different system, convert:
   ```bash
   gdalwarp -s_srs EPSG:4326 -t_srs EPSG:2178 input.tif output.tif
   ```

### Poor performance (low FPS)

**Solution:**
1. Reduce `shadowMapSize` in config.js (2048 → 1024)
2. Limit `TERRAIN_SEGMENTS` in loadTerrain.js (256 → 128)
3. Disable shadows:
   ```javascript
   renderer.shadowMap.enabled = false;
   ```
4. Reduce texture resolution (4096 → 2048px)

### Water is invisible

**Solution:**
1. Check if `waterLevel > terrain_elevation`
2. Verify `waternormals.jpg` loading:
   - Open console → Network → check for 404 errors
3. Increase `water.size` if terrain is large:
   ```javascript
   water: { size: 10000 }  // in src/config.js
   ```

### GLTF model won't load

**Problem:** "Failed to load GLTF" in console

**Solution:**
1. Check if `CONFIG.useGLTF = true` in config.js
2. Verify path: `models/terrain.glb`
3. Ensure Draco decoder is available:
   ```
   https://www.gstatic.com/draco/versioned/decoders/1.5.6/
   ```
4. Test connection: open URL in browser

## Technical Documentation

### Architecture

```
┌─────────────────────────────────────────────────┐
│                   main.js                        │
│              (Application Entry)                 │
└─────────────────────────────────────────────────┘
         │
         ├─► setupScene.js ────► THREE.Scene/Camera/Renderer
         │
         ├─► loadTerrain.js ───► geoUtils.js ─┬─► GeoTransform
         │                                     └─► Coordinate conversion
         │
         ├─► setupUI.js ───────► Water/Sky/Controls/GUI
         │
         └─► config.js ────────► Central configuration
```

### Classes and Modules

**GeoTransform** (`src/geoUtils.js`)
- EPSG:2178 ↔ Three.js coordinate conversion
- Height scaling with vertical exaggeration
- Terrain dimension calculation

**loadTerrain()** (`src/loadTerrain.js`)
- Geospatial metadata loading
- Mesh generation from heightmap
- Optional GLTF upgrade

**setupUI()** (`src/setupUI.js`)
- Water mesh + animation
- Sky shader system
- OrbitControls
- lil-gui panel

### API Reference

**Core functions:**

```javascript
// Terrain loading
loadTerrain(scene) → Promise<THREE.Mesh>

// Get geospatial transform
getGeoTransform() → GeoTransform | null

// Update loop
updateWater(water, deltaTime)
updateSun(sun, sky, water, light, parameters)
```

**GeoTransform API:**

```javascript
const geo = new GeoTransform(metadata);

// Scene → Geo
geo.toGeoCoords(sceneX, sceneZ) → {x, y}
geo.toGeoElevation(sceneY) → elevation_meters

// Geo → Scene
geo.toSceneCoords(x, y) → {x, z}
geo.toSceneElevation(elevation) → sceneY
```

## Technologies

- **[Three.js r170](https://threejs.org/)** - WebGL rendering engine
- **[Vite 5.x](https://vitejs.dev/)** - Build tool and dev server
- **[lil-gui](https://lil-gui.georgealgo.com/)** - Lightweight GUI
- **[Draco](https://github.com/google/draco)** - Mesh compression
- **[GDAL](https://gdal.org/)** - Geospatial data processing

## Browser Support

| Browser | Minimum Version | Status |
|---------|-----------------|--------|
| Chrome  | 90+             | ✅ Tested |
| Firefox | 88+             | ✅ Tested |
| Safari  | 15+             | ✅ Compatible |
| Edge    | 90+             | ✅ Tested |

**Requirements:** WebGL 2.0, ES6 modules

## Roadmap

- [ ] Screenshot export (PNG)
- [ ] Distance/area measurement
- [ ] Multiple terrain layer import
- [ ] Water level animation timeline
- [ ] VR mode (WebXR)
- [ ] Support for other coordinate systems

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss proposed changes.

1. Fork the project
2. Create a branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Authors

**WislaBAT** - Flood visualization tool from UAV photogrammetry

The project was created as part of research on the application of drone photogrammetry in flood hazard analysis.

## Citation

If you use this project in scientific research, please cite:

```bibtex
@software{wislabat2024,
  title={WislaBAT: 3D Flood Visualization Tool},
  author={[Your Name]},
  year={2024},
  url={https://github.com/Judosik/WislaBAT}
}
```

## Support

- 📫 Issues: [GitHub Issues](https://github.com/Judosik/WislaBAT/issues)
- 📖 Wiki: [GitHub Wiki](https://github.com/Judosik/WislaBAT/wiki)
- 💬 Discussions: [GitHub Discussions](https://github.com/Judosik/WislaBAT/discussions)

---

**Built with ❤️ for the geoinformatics community**
