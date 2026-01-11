# Model Switching Guide

This guide explains how to switch between the two GLTF terrain models in WislaBAT.

## Available Models

### 1. `model_zeroed.glb` (Default)
- **Location**: `models/model_zeroed.glb`
- **Type**: Origin-centered model
- **Coordinates**: X and Y positions zeroed in Blender (origin at 0,0,0)
- **Use case**: Faster loading, simpler rendering, better for development

### 2. `model.gltf` (Original)
- **Location**: `models/gltf/model.gltf`
- **Type**: Real-world coordinates
- **Coordinates**: Original EPSG:2178 coordinates (e.g., X: 7,500,640, Y: 5,792,140)
- **Use case**: Precise geospatial alignment, production deployments

## How to Switch Models

Edit `src/config.js`:

### To use model_zeroed.glb (Default):

```javascript
// Asset paths
assets: {
  terrain: "models/model_zeroed.glb", // ← Zeroed model
  // ...
},

// Terrain loading strategy
terrain: {
  useGLTF: true,
  useDEMFallback: false,
  isModelZeroed: true, // ← Important: set to true
  autoCameraPosition: true,
},
```

### To use model.gltf (Original coordinates):

```javascript
// Asset paths
assets: {
  terrain: "models/gltf/model.gltf", // ← Original model
  // ...
},

// Terrain loading strategy
terrain: {
  useGLTF: true,
  useDEMFallback: false,
  isModelZeroed: false, // ← Important: set to false
  autoCameraPosition: true,
},
```

## Configuration Details

### `isModelZeroed` Flag

This flag controls how the GLTF loader handles coordinates:

- **`true`**: Model is already centered at origin
  - No coordinate transformation applied
  - Uses model positions as-is
  - Faster loading

- **`false`**: Model has real EPSG:2178 coordinates
  - Applies geospatial coordinate transformation
  - Converts from EPSG:2178 to Three.js space
  - Uses `GeoTransform` class for accurate conversion

### `autoCameraPosition` Flag

When enabled:
- Automatically calculates optimal camera position based on model bounding box
- Centers view on terrain
- Adjusts camera distance based on model size
- Works for both model types

## Coordinate System Reference

### EPSG:2178 (Poland CS2000 Zone 6)
- **Coverage**: Eastern Poland (zone 6: 16.5° - 19.5° E)
- **Units**: Meters
- **Type**: Projected (Transverse Mercator)
- **False Easting**: 500,000m
- **False Northing**: 0m

Your model coordinates:
- **Center**: X: 7,500,640m E, Y: 5,792,140m N
- **Approximate area**: 1.6km × 1.7km

## Camera Positioning

### Automatic (Recommended)

With `autoCameraPosition: true`, the camera is positioned automatically:

```javascript
// Calculated based on model bounds
camera.position: [center.x + offset, center.y + height, center.z + offset]
controls.target: [center.x, center.y, center.z]
```

### Manual

To disable auto-positioning and use fixed camera:

```javascript
terrain: {
  autoCameraPosition: false, // Disable auto
},

camera: {
  position: { x: 30, y: 120, z: 130 }, // Your fixed position
},
```

## Troubleshooting

### Model appears far from origin
- Check `isModelZeroed` flag matches your actual model
- If using `model.gltf`, ensure `isModelZeroed: false`
- Verify `metadata.json` has correct EPSG:2178 bounds

### Camera starts in wrong position
- Enable `autoCameraPosition: true`
- Check console for "Camera positioned automatically" message
- Verify model bounding box is calculated correctly

### Coordinates display wrong values
- Ensure `metadata.json` CRS is `"EPSG:2178"`
- Verify bounds match your model's real-world coordinates
- Check `GeoTransform` initialization in console

## Example Console Output

### Zeroed Model:
```
Loading GLTF terrain model...
Loading GLTF: 100.0%
Loading zeroed GLTF model (origin-centered)...
✓ GLTF terrain loaded (zeroed model)
✓ Camera positioned automatically:
  position: [442.3, 221.1, 442.3]
  lookAt: [0.0, 45.2, 0.0]
  modelSize: [1278.6, 122.0, 1772.0]
```

### Original Model:
```
Loading GLTF terrain model...
✓ Geospatial metadata loaded
Loading GLTF: 100.0%
Applying geospatial transformations to GLTF model (real coordinates)...
✓ GLTF terrain loaded with geospatial coordinates
✓ Camera positioned automatically:
  position: [0.8, 0.2, 0.9]
  lookAt: [0.0, 0.1, 0.0]
  modelSize: [1.3, 0.1, 1.7]
```

## Performance Comparison

| Feature | model_zeroed.glb | model.gltf |
|---------|------------------|------------|
| File size | ~43MB | ~43MB |
| Load time | Fast | +5-10% (coordinate transform) |
| Runtime performance | Same | Same |
| Coordinate accuracy | Relative | Absolute (real-world) |

## Best Practices

1. **Development**: Use `model_zeroed.glb` for faster iteration
2. **Production**: Use `model.gltf` for precise geospatial accuracy
3. **Always** verify `isModelZeroed` matches your chosen model
4. **Enable** `autoCameraPosition` unless you have specific camera requirements
5. **Check** console output to verify correct loading mode

---

**Need Help?** Check the main [README.md](../README.md) or [GEOSPATIAL_SETUP.md](../GEOSPATIAL_SETUP.md) for more details.
