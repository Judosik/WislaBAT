# WislaBAT - 3D Terrain and Water Level Visualization

> 🇬🇧 English version | [🇵🇱 Wersja polska](README_PL.md)

> Interactive 3D visualization of flood scenarios using photogrammetric and geospatial data in EPSG:2178 coordinate system (Polish CS92)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-r170-blue.svg)](https://threejs.org/)

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
- ✅ Full EPSG:2178 (Polish CS92) support with 1:1 metric coordinates
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

<img width="2508" height="1303" alt="image" src="https://github.com/user-attachments/assets/4b7221ef-e24e-4d28-9d0c-7c1288198a6b" />


🔗 **[View live demo](https://judosik.github.io/WislaBAT/)**

## Installation

### Requirements

- **Modern web browser** with WebGL 2.0 support (Chrome 90+, Firefox 88+, Safari 15+, Edge 90+)
- **Local web server** (Python, Node.js http-server, VS Code Live Server, or any HTTP server)
- **GDAL** (optional, for GeoTIFF metadata extraction)

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/Judosik/WislaBAT.git
cd WislaBAT

# 2. Start a local web server (choose one method):

# Option A: Python 3
python -m http.server 8000

# Option B: Python 2
python -m SimpleHTTPServer 8000

# Option C: Node.js http-server (install first: npm install -g http-server)
http-server -p 8000

# Option D: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"

# 3. Open browser
# http://localhost:8000
```

### Installation Verification

After opening in browser, check the console (F12):

```
Inicjowanie sceny...
Przetwarzanie terenu...
Loading GLTF terrain model...
✓ Geospatial metadata loaded
✓ GLTF terrain loaded (zeroed model)
✓ Camera positioned automatically
✓ Initialization complete
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
- **Preset**: Select predefined flood scenario
  - Mean level of water (76.40m)
  - Risk: 1 to 10 years (82.60m)
  - Risk: 1 to 100 years (83.80m)
  - Risk: 1 to 500 years (84.39m)
- **Water Level (m)**: Custom height (76-110m above sea level)

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
├── main.css                   # Styling
├── LICENSE                    # MIT License
│
├── src/                       # Source modules
│   ├── config.js              # Central configuration
│   ├── geoUtils.js            # EPSG:2178 geospatial utilities
│   ├── loadTerrain.js         # GLTF + DEM loading
│   ├── setupScene.js          # Three.js initialization
│   └── setupUI.js             # GUI, water, sky, controls
│
├── terrain_data/              # Geospatial data
│   ├── dem.tif                # GeoTIFF heightmap (source data)
│   ├── dem_viz.png            # Visualization texture
│   └── metadata.json          # EPSG:2178 metadata ← CONFIGURE THIS
│
├── models/                    # 3D models
│   ├── model_zeroed.glb       # Primary terrain (origin-centered, Draco compressed)
│   └── model.glb              # Alternative (EPSG:2178 coordinates)
│
├── textures/                  # Water and PBR textures
│   ├── waternormals.jpg       # Water normal map
│   └── [other textures]
│
├── images/                    # Favicons and UI assets
│   └── favicon.ico
│
└── docs/                      # Documentation
    ├── screenshot.png         # Project screenshot
    ├── GEOSPATIAL_SETUP.md    # Geospatial configuration guide
    └── GEOSPATIAL_SETUP_PL.md # Polish version
```

## Configuration

### Basic Settings - [src/config.js](src/config.js)

```javascript
export const CONFIG = {
  // Rendering
  renderer: {
    toneMappingExposure: 0.5,    // Scene brightness (0.1-2.0)
    shadowMapSize: 2048,          // Shadow quality (512/1024/2048/4096)
  },

  // Camera
  camera: {
    fov: 45,                      // Field of view (degrees)
    position: { x: 500, y: 500, z: 300 },
    controls: {
      maxPolarAngle: Math.PI * 0.495,  // Prevent camera going below ground
      minDistance: 10.0,
      maxDistance: 5000.0,
    },
  },

  // Geospatial
  geospatial: {
    enabled: true,                // Enable EPSG:2178 coordinate system
    verticalExaggeration: 1.5,    // Vertical exaggeration only (1.0 = true scale)
    centerAtOrigin: true,         // Center terrain at (0,0,0)
    // Note: Horizontal coordinates use 1:1 mapping in meters
  },

  // Water
  water: {
    distortionScale: 3.7,         // Wave intensity
    size: 50000,                  // Water plane size
    levelPresets: {
      "Mean level of water": 76.40,
      "Risk : 1 to 10 years": 82.60,
      "Risk : 1 to 100 years": 83.80,
      "Risk : 1 to 500 years": 84.39,
    },
    defaultLevel: 76.40,          // Default level (m above sea level)
  },

  // Lighting
  lighting: {
    sun: {
      elevation: 4,               // Sun height (0-90°, 4° = sunrise/sunset)
      azimuth: -152,              // Sun direction (-180° to 180°)
    },
  },

  // Terrain
  terrain: {
    useGLTF: true,                // Use GLTF model (primary)
    useDEMFallback: false,        // Skip DEM fallback
    isModelZeroed: true,          // Model centered at origin
    autoCameraPosition: true,     // Auto-position camera based on model
  },

  // Asset paths
  assets: {
    terrain: "models/model_zeroed.glb",
    heightmap: "terrain_data/dem.tif",
    terrainTexture: "terrain_data/dem_viz.png",
    waterNormals: "textures/waternormals.jpg",
    terrainMetadata: "terrain_data/metadata.json",
  },
};
```

### Advanced - Vertical Exaggeration

Adjust vertical exaggeration for better visualization:

| Terrain Type | verticalExaggeration | Effect |
|--------------|---------------------|--------|
| Flat terrain | 2.0 - 5.0           | Emphasize subtle elevation changes |
| Moderate relief | 1.5 - 2.0        | Balanced visualization (default: 1.5) |
| Mountainous | 1.0 - 1.5            | Preserve natural proportions |

Note: All horizontal coordinates use 1:1 metric mapping (no scaling).

## Data Preparation

### 1. Heightmap (DEM)

**From GeoTIFF:**
```bash
# Create visualization texture from DEM
gdal_translate -of PNG -scale dem.tif dem_viz.png

# Or with color ramp for better visualization
gdaldem color-relief dem.tif color_ramp.txt dem_viz.png
```

**From point cloud:**
```bash
# LAS/LAZ → GeoTIFF (using PDAL)
pdal pipeline pipeline.json
```

**Requirements:**
- Format: GeoTIFF for source data, PNG for visualization
- Resolution: 512x512 to 2048x2048 recommended
- Must include geospatial metadata (CRS, bounds)

### 2. Visualization Texture

The project uses `dem_viz.png` for terrain texture visualization.

```bash
# Generate from DEM with color relief
gdal_translate -of PNG -scale dem.tif dem_viz.png

# Or use orthophoto if available
gdal_translate -outsize 2048 2048 orthophoto.tif dem_viz.png
```

**Requirements:**
- Format: PNG/JPG
- Size: 1024x1024 to 4096x4096 (recommended: 2048x2048)
- Should match DEM extent

### 3. GLTF Model (Primary)

The project uses `model_zeroed.glb` as the primary terrain source.

**Blender workflow:**

1. Import photogrammetry (OBJ/PLY/FBX)
2. Mesh cleanup:
   - Decimate modifier (target: 40-100k tris)
   - Remove doubles
   - Recalculate normals
3. **Center at origin**: Set origin to geometry center, then move to (0, 0, 0)
4. Apply all transforms (Ctrl+A → All Transforms)
5. Export → glTF 2.0:
   - Format: GLB (Binary)
   - ✅ Draco compression (level 7)
   - ✅ +Y up
   - ✅ Include normals
   - ❌ Cameras/lights

**Command line compression (gltf-transform):**
```bash
npm install -g @gltf-transform/cli

gltf-transform draco model.glb model_zeroed.glb \
  --compression 7 \
  --quantize-position 14 \
  --quantize-normal 10
```

**Target size:** < 50MB (model_zeroed.glb is ~40MB)

## Deployment

### GitHub Pages

The project is a static website - no build process needed!

```bash
# 1. Push to GitHub repository
git add .
git commit -m "Update project"
git push origin main

# 2. Enable GitHub Pages in repository settings
# Settings → Pages → Source: Deploy from branch
# Branch: main → / (root)

# 3. Your site will be available at:
# https://yourusername.github.io/WislaBAT/
```

**Alternative: Deploy from gh-pages branch**
```bash
# Create orphan gh-pages branch with project files
git checkout --orphan gh-pages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Then enable in Settings → Pages → Branch: gh-pages
```

### Custom Server

Simply upload all project files to any web server:

```bash
# The entire project directory is ready to deploy
# No build process required
# Apache/Nginx/Cloudflare Pages/Netlify/Vercel
```

**Requirements:**
- Server must serve files over HTTP/HTTPS
- No special server configuration needed
- CORS enabled if loading external resources

## Development

### Project Architecture

- **No build process**: Pure ES6 modules loaded via browser
- **CDN dependencies**: Three.js r170 loaded from jsdelivr
- **Modular structure**: Each file has one clear responsibility
- **Configuration-driven**: All settings in [src/config.js](src/config.js)

### Adding Features

```javascript
// 1. Create new module in src/
// src/myFeature.js
export function myFeature(scene, camera) {
  // implementation
}

// 2. Import in main.js
import { myFeature } from './src/myFeature.js';

// 3. Use in init()
async function init() {
  // ... existing code
  myFeature(app.scene, app.camera);
}
```

### Code Structure

- **Modular**: Each file = one responsibility
- **ES6+**: Native modules, async/await, arrow functions
- **No transpilation**: Modern browser features only
- **Configuration**: Central config in [src/config.js](src/config.js)
- **Comments**: JSDoc for public APIs

### Naming Conventions

```javascript
// Files: camelCase
setupScene.js
geoUtils.js

// Functions/variables: camelCase
function loadTerrain() {}
const terrainMesh = ...

// Classes: PascalCase
class GeoTransform {}

// Constants: UPPER_SNAKE_CASE
const TERRAIN_SEGMENTS = 256;
```

## Troubleshooting

### Terrain not loading

**Problem:** Black screen, no terrain visible

**Solution:**
1. Check browser console (F12) for errors
2. Ensure you're running from a local web server (not file://)
3. Verify paths in [src/config.js](src/config.js:76):
   ```javascript
   assets: {
     terrain: "models/model_zeroed.glb",
     heightmap: "terrain_data/dem.tif",
   }
   ```
4. Check if model file exists: `models/model_zeroed.glb` (~40MB)
5. Verify Draco decoder is accessible (check Network tab)

### Coordinates show wrong values

**Problem:** EPSG:2178 coordinates out of range for Poland (should be 600000-800000 for X, 400000-800000 for Y)

**Solution:**
1. Check [terrain_data/metadata.json](terrain_data/metadata.json) - bounds must be in EPSG:2178 (meters)
2. Use `gdalinfo dem.tif` to verify source GeoTIFF CRS
3. If data is in different system, convert:
   ```bash
   gdalwarp -s_srs EPSG:4326 -t_srs EPSG:2178 input.tif output.tif
   ```
4. Extract metadata from converted file:
   ```bash
   gdalinfo dem.tif
   # Update bounds in metadata.json
   ```

### Poor performance (low FPS)

**Solution:**
1. Reduce `shadowMapSize` in [src/config.js](src/config.js:9) (2048 → 1024 or 512)
2. Disable shadows in [src/setupScene.js](src/setupScene.js):
   ```javascript
   renderer.shadowMap.enabled = false;
   ```
3. Reduce water plane size in [src/config.js](src/config.js:33):
   ```javascript
   water: { size: 10000 }  // reduce from 50000
   ```
4. Optimize model: reduce triangle count in Blender (Decimate modifier)
5. Reduce texture resolution: compress `dem_viz.png` to 1024x1024

### Water is invisible

**Solution:**
1. Check water level in GUI - must be above terrain elevation
   - Current terrain: 76-107m above sea level
   - Default water level: 76.40m (adjust in GUI)
2. Verify `waternormals.jpg` loaded:
   - Open console (F12) → Network tab → check for 404 errors
   - File should be at `textures/waternormals.jpg`
3. Increase `water.size` if terrain is very large:
   ```javascript
   water: { size: 100000 }  // in src/config.js
   ```

### GLTF model won't load

**Problem:** "Failed to load GLTF" in console

**Solution:**
1. Verify file exists: `models/model_zeroed.glb` (should be ~40MB)
2. Check config in [src/config.js](src/config.js:84):
   ```javascript
   terrain: { useGLTF: true }
   ```
3. Ensure running from web server (not `file://`)
4. Check Draco decoder accessibility:
   - URL: `https://www.gstatic.com/draco/versioned/decoders/1.5.6/`
   - Test in browser Network tab
5. Verify browser console for specific error messages

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

- **[Three.js r170](https://threejs.org/)** - WebGL rendering engine (via CDN)
- **[lil-gui](https://lil-gui.georgealgo.com/)** - Lightweight GUI (bundled with Three.js)
- **[Draco](https://github.com/google/draco)** - Mesh compression (Google CDN)
- **[GDAL](https://gdal.org/)** - Geospatial data processing (for data preparation)
- **ES6 Modules** - Native browser module system (no bundler needed)

## Browser Support

| Browser | Minimum Version | Status | Notes |
|---------|-----------------|--------|-------|
| Chrome  | 90+ (2021)      | ✅ Tested | Recommended |
| Firefox | 88+ (2021)      | ✅ Tested | Full support |
| Safari  | 15+ (2021)      | ✅ Compatible | iOS 15+ |
| Edge    | 90+ (2021)      | ✅ Tested | Chromium-based |

**Requirements:**
- WebGL 2.0 support
- ES6 modules (import/export)
- Modern JavaScript features (async/await, arrow functions)

**Not supported:**
- Internet Explorer (any version)
- Legacy Edge (EdgeHTML)
- Old mobile browsers (< 2021)

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

**WislaBAT** - Interactive flood visualization tool from UAV photogrammetry

The project was created as part of research on the application of drone photogrammetry in flood hazard analysis and geospatial data visualization.

**Repository:** [https://github.com/Judosik/WislaBAT](https://github.com/Judosik/WislaBAT)

## Citation

If you use this project in scientific research, please cite:

```bibtex
@software{wislabat2025,
  title={WislaBAT: 3D Terrain and Water Level Visualization},
  author={Judosik},
  year={2025},
  url={https://github.com/Judosik/WislaBAT},
  note={Interactive WebGL visualization tool for flood scenarios using photogrammetric data}
}
```

## Support

- 📫 Issues: [GitHub Issues](https://github.com/Judosik/WislaBAT/issues)
- 📖 Wiki: [GitHub Wiki](https://github.com/Judosik/WislaBAT/wiki)
- 💬 Discussions: [GitHub Discussions](https://github.com/Judosik/WislaBAT/discussions)

---

**Built with ❤️ for the geoinformatics community**
