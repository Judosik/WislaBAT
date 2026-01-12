// src/geoUtils.js

import { CONFIG } from "./config.js";

/**
 * Geospatial coordinate transformation utilities
 * Handles conversion between EPSG:2178 (Polish CS2000 zone 6) and Three.js scene coordinates
 */

export class GeoTransform {
  constructor(metadata) {
    this.metadata = metadata;
    this.bounds = metadata.bounds;

    // Calculate terrain dimensions in real-world units (meters for EPSG:2178)
    // In EPSG:2178: X = northing (north-south), Y = easting (east-west)
    this.width = this.bounds.maxX - this.bounds.minX;  // North-south extent
    this.height = this.bounds.maxY - this.bounds.minY; // East-west extent

    // Center point in real-world coordinates
    this.centerX = (this.bounds.minX + this.bounds.maxX) / 2; // Center northing
    this.centerY = (this.bounds.minY + this.bounds.maxY) / 2; // Center easting

    // Vertical exaggeration only (no horizontal scaling)
    this.verticalExaggeration = CONFIG.geospatial.verticalExaggeration;

    console.log("GeoTransform initialized:", {
      crs: metadata.crs,
      size: `${this.width}m × ${this.height}m`,
      center: `(${this.centerX.toFixed(1)}, ${this.centerY.toFixed(1)})`,
      verticalExaggeration: this.verticalExaggeration,
    });
  }

  /**
   * Convert EPSG:2178 coordinates to Three.js scene coordinates
   * @param {number} x - EPSG:2178 X coordinate (northing - increases northward)
   * @param {number} y - EPSG:2178 Y coordinate (easting - increases eastward)
   * @returns {{x: number, z: number}} Three.js position (y is elevation)
   *
   * Mapping: EPSG:2178 X (north) → Three.js -Z, EPSG:2178 Y (east) → Three.js +X
   * All coordinates are in meters, 1:1 mapping, NO SCALING
   */
  toSceneCoords(x, y) {
    if (CONFIG.geospatial.centerAtOrigin) {
      return {
        x: y - this.centerY,   // East → Three.js +X (meters)
        z: -(x - this.centerX), // North → Three.js -Z (meters)
      };
    } else {
      return {
        x: y - this.bounds.minY,   // East → Three.js +X (meters)
        z: -(x - this.bounds.minX), // North → Three.js -Z (meters)
      };
    }
  }

  /**
   * Convert Three.js scene coordinates back to EPSG:2178
   * @param {number} sceneX - Three.js X coordinate (meters)
   * @param {number} sceneZ - Three.js Z coordinate (meters)
   * @returns {{x: number, y: number}} EPSG:2178 coordinates (x=northing, y=easting)
   *
   * Mapping: Three.js +X → EPSG:2178 Y (east), Three.js -Z → EPSG:2178 X (north)
   * All coordinates are in meters, 1:1 mapping, NO SCALING
   */
  toGeoCoords(sceneX, sceneZ) {
    if (CONFIG.geospatial.centerAtOrigin) {
      return {
        x: -sceneZ + this.centerX, // Three.js -Z → North (meters)
        y: sceneX + this.centerY,  // Three.js +X → East (meters)
      };
    } else {
      return {
        x: -sceneZ + this.bounds.minX, // Three.js -Z → North (meters)
        y: sceneX + this.bounds.minY,  // Three.js +X → East (meters)
      };
    }
  }

  /**
   * Convert elevation from real-world meters to Three.js units
   * @param {number} elevation - Elevation in meters
   * @returns {number} Three.js Y coordinate (meters, with vertical exaggeration applied)
   */
  toSceneElevation(elevation) {
    return elevation * this.verticalExaggeration;
  }

  /**
   * Convert Three.js Y coordinate back to real-world elevation
   * @param {number} sceneY - Three.js Y coordinate
   * @returns {number} Elevation in meters
   */
  toGeoElevation(sceneY) {
    return sceneY / this.verticalExaggeration;
  }

  /**
   * Get terrain dimensions in meters
   * @returns {{width: number, height: number}} Dimensions in meters
   */
  getTerrainDimensions() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Calculate height scale for heightmap terrain
   * @returns {number} Scale factor to apply to normalized heightmap values (0-1)
   */
  getHeightScale() {
    const elevationRange = this.metadata.elevation.max - this.metadata.elevation.min;
    return this.toSceneElevation(elevationRange);
  }

  /**
   * Get elevation offset (minimum elevation in scene coordinates)
   * @returns {number} Y offset to apply to terrain
   */
  getElevationOffset() {
    return this.toSceneElevation(this.metadata.elevation.min);
  }
}

/**
 * Load and parse terrain metadata
 * @returns {Promise<Object>} Metadata object
 */
export async function loadTerrainMetadata() {
  const response = await fetch(CONFIG.assets.terrainMetadata);
  if (!response.ok) {
    throw new Error(`Failed to load terrain metadata: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Format EPSG:2178 coordinates for display
 * @param {number} x - Northing (north-south coordinate)
 * @param {number} y - Easting (east-west coordinate)
 * @returns {string} Formatted coordinate string
 */
export function formatEPSG2178(x, y) {
  return `${x.toFixed(2)}N, ${y.toFixed(2)}E`;
}

// Legacy export for backwards compatibility
export const formatEPSG2180 = formatEPSG2178;

/**
 * Format elevation for display
 * @param {number} elevation - Elevation in meters
 * @returns {string} Formatted elevation string
 */
export function formatElevation(elevation) {
  return `${elevation.toFixed(2)} m`;
}
