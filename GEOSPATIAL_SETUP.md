# Geospatial Setup Guide

> 🇬🇧 English version | [🇵🇱 Wersja polska](GEOSPATIAL_SETUP_PL.md)

This guide explains how to configure your terrain data with proper geospatial metadata for EPSG:2180 (Polish CS92) coordinate system.

## Quick Start

1. **Extract metadata from your GeoTIFF** (one-time setup)
2. **Update `terrain_data/metadata.json`** with the extracted values
3. **Run the application** - terrain will automatically scale correctly

---

## Step 1: Extract GeoTIFF Metadata

### Option A: Using GDAL (Recommended)

Install GDAL if you don't have it:
```bash
# Windows (using OSGeo4W or Conda)
conda install -c conda-forge gdal

# Linux/Mac
sudo apt install gdal-bin  # Debian/Ubuntu
brew install gdal          # macOS
```

Extract metadata:
```bash
gdalinfo terrain_data/dem.tif
```

Look for these key values in the output:

```
Upper Left  (  650000.000,  510000.000)  # minX, maxY
Lower Right (  680000.000,  480000.000)  # maxX, minY
Pixel Size = (30.0, -30.0)               # resolution X, Y
```

### Option B: Using QGIS (GUI method)

1. Open QGIS
2. Load your GeoTIFF: **Layer → Add Layer → Add Raster Layer**
3. Right-click layer → **Properties → Information**
4. Find:
   - **Extent**: minX, maxX, minY, maxY
   - **Pixel Size**: resolution
   - **CRS**: Should be EPSG:2180

---

## Step 2: Update metadata.json

Edit `terrain_data/metadata.json` with your actual values:

```json
{
  "crs": "EPSG:2180",
  "bounds": {
    "minX": 650000,    // ← Replace with your values
    "maxX": 680000,
    "minY": 480000,
    "maxY": 510000
  },
  "elevation": {
    "min": -5.0,       // ← Minimum elevation in meters
    "max": 120.0,      // ← Maximum elevation in meters
    "unit": "meters"
  },
  "resolution": {
    "x": 30.0,         // ← Pixel size in meters (from gdalinfo)
    "y": 30.0,
    "unit": "meters"
  }
}
```

### How to find elevation range:

```bash
# Using GDAL
gdalinfo -stats terrain_data/dem.tif

# Look for:
# Minimum=0.000, Maximum=120.450
```

---

## Step 3: Configuration Options

### Adjust Visual Settings

Edit `src/config.js`:

```javascript
geospatial: {
  enabled: true,  // Set to false to disable geospatial mode

  // Vertical exaggeration for better visualization
  verticalExaggeration: 1.5,  // 1.0 = true scale, 2.0 = 2x height

  // Center terrain at origin (recommended for Three.js)
  centerAtOrigin: true,

  // Scale factor: 1 Three.js unit = X meters
  // 0.001 = 1 Three.js unit = 1km (good for large areas)
  // 0.01  = 1 Three.js unit = 100m (medium areas)
  scaleToThreeJS: 0.001,
}
```

### Scaling Recommendations

| Terrain Size | scaleToThreeJS | Camera Distance |
|--------------|----------------|-----------------|
| < 5km        | 0.01 - 0.05    | 50-200          |
| 5-50km       | 0.001 - 0.01   | 100-300         |
| > 50km       | 0.0001 - 0.001 | 200-500         |

---

## Step 4: Verify Setup

When you run the application, check the browser console:

```
✓ Geospatial metadata loaded
GeoTransform initialized: {
  crs: "EPSG:2180",
  realWorldSize: "30000m × 30000m",
  threeJSSize: "30.0 × 30.0",
  center: "(665000, 495000)"
}
```

Move your mouse over the terrain - you should see:
```
EPSG:2180 Coordinates
X: 665432.12m E, Y: 495123.45m N
Elevation: 45.23 m
```

---

## Coordinate Systems Reference

### EPSG:2180 (Polish CS92)
- **Units**: Meters
- **Coverage**: Poland
- **Type**: Projected (Transverse Mercator)
- **False Easting**: 500,000m
- **False Northing**: -5,300,000m

Typical coordinate ranges for Poland:
- **X (Easting)**: 470,000 - 860,000
- **Y (Northing)**: 180,000 - 810,000

---

## Troubleshooting

### Terrain appears too flat or too tall
Adjust `verticalExaggeration` in [config.js](src/config.js#L86):
```javascript
verticalExaggeration: 2.0,  // Try different values
```

### Terrain appears too small/large
Adjust `scaleToThreeJS` in [config.js](src/config.js#L91):
```javascript
scaleToThreeJS: 0.001,  // Larger = smaller terrain
```

### Coordinates show wrong values
1. Verify `bounds` in [metadata.json](terrain_data/metadata.json) match `gdalinfo` output
2. Check that CRS is EPSG:2180
3. Ensure `centerAtOrigin: true` matches your expectations

### No coordinate display appears
1. Check that `geospatial.enabled: true` in [config.js](src/config.js#L84)
2. Verify [metadata.json](terrain_data/metadata.json) loads without errors (check console)
3. Ensure you're hovering over the terrain mesh

---

## Advanced: Converting Other Formats

### Convert PNG heightmap to GeoTIFF with metadata

If you only have PNG + world file (.pgw):

```bash
gdal_translate -a_srs EPSG:2180 \
  -a_ullr 650000 510000 680000 480000 \
  dem.png dem.tif
```

Where `-a_ullr` = Upper Left X, Upper Left Y, Lower Right X, Lower Right Y

---

## File Structure

```
WislaBAT/
├── terrain_data/
│   ├── dem.png              # Your heightmap (current)
│   ├── dem.tif              # Optional: GeoTIFF source
│   ├── metadata.json        # ← YOU CONFIGURE THIS
│   └── orto_phot.png        # Texture
├── src/
│   ├── config.js            # Adjust visual settings here
│   ├── geoUtils.js          # Coordinate conversion logic
│   └── loadTerrain.js       # Applies geospatial transforms
└── GEOSPATIAL_SETUP.md      # This file
```

---

## Example: Warsaw Region

If your data covers Warsaw city center:

```json
{
  "crs": "EPSG:2180",
  "bounds": {
    "minX": 638000,  // West of Warsaw
    "maxX": 658000,  // East of Warsaw
    "minY": 474000,  // South
    "maxY": 494000   // North
  },
  "elevation": {
    "min": 75.0,     // Vistula river level
    "max": 120.0,    // Higher areas
    "unit": "meters"
  },
  "resolution": {
    "x": 10.0,       // 10m DEM
    "y": 10.0,
    "unit": "meters"
  }
}
```

---

## Need Help?

1. Run `gdalinfo terrain_data/your_file.tif` and paste output
2. Check browser console for error messages
3. Verify coordinates are in EPSG:2180 (not lat/lon!)
