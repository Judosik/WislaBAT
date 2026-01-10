// src/geoUtils.js

import { CONFIG } from "./config.js";

/**
 * Geospatial coordinate transformation utilities
 * Handles conversion between EPSG:2180 (Polish CS92) and Three.js scene coordinates
 */

export class GeoTransform {
  constructor(metadata) {
    this.metadata = metadata;
    this.bounds = metadata.bounds;

    // Calculate terrain dimensions in real-world units (meters for EPSG:2180)
    this.width = this.bounds.maxX - this.bounds.minX;
    this.height = this.bounds.maxY - this.bounds.minY;

    // Center point in real-world coordinates
    this.centerX = (this.bounds.minX + this.bounds.maxX) / 2;
    this.centerY = (this.bounds.minY + this.bounds.maxY) / 2;

    // Scale factors
    this.scaleToThreeJS = CONFIG.geospatial.scaleToThreeJS;
    this.verticalExaggeration = CONFIG.geospatial.verticalExaggeration;

    // Three.js terrain dimensions
    this.terrainWidthThreeJS = this.width * this.scaleToThreeJS;
    this.terrainHeightThreeJS = this.height * this.scaleToThreeJS;

    console.log("GeoTransform initialized:", {
      crs: metadata.crs,
      realWorldSize: `${this.width}m × ${this.height}m`,
      threeJSSize: `${this.terrainWidthThreeJS.toFixed(1)} × ${this.terrainHeightThreeJS.toFixed(1)}`,
      center: `(${this.centerX}, ${this.centerY})`,
    });
  }

  /**
   * Convert EPSG:2180 coordinates to Three.js scene coordinates
   * @param {number} x - EPSG:2180 X coordinate (easting)
   * @param {number} y - EPSG:2180 Y coordinate (northing)
   * @returns {{x: number, z: number}} Three.js position (y is elevation)
   */
  toSceneCoords(x, y) {
    if (CONFIG.geospatial.centerAtOrigin) {
      return {
        x: (x - this.centerX) * this.scaleToThreeJS,
        z: -(y - this.centerY) * this.scaleToThreeJS, // Negative Z for north = -Z
      };
    } else {
      return {
        x: (x - this.bounds.minX) * this.scaleToThreeJS,
        z: -(y - this.bounds.minY) * this.scaleToThreeJS,
      };
    }
  }

  /**
   * Convert Three.js scene coordinates back to EPSG:2180
   * @param {number} sceneX - Three.js X coordinate
   * @param {number} sceneZ - Three.js Z coordinate
   * @returns {{x: number, y: number}} EPSG:2180 coordinates
   */
  toGeoCoords(sceneX, sceneZ) {
    if (CONFIG.geospatial.centerAtOrigin) {
      return {
        x: sceneX / this.scaleToThreeJS + this.centerX,
        y: -sceneZ / this.scaleToThreeJS + this.centerY,
      };
    } else {
      return {
        x: sceneX / this.scaleToThreeJS + this.bounds.minX,
        y: -sceneZ / this.scaleToThreeJS + this.bounds.minY,
      };
    }
  }

  /**
   * Convert elevation from real-world meters to Three.js units
   * @param {number} elevation - Elevation in meters
   * @returns {number} Three.js Y coordinate
   */
  toSceneElevation(elevation) {
    return elevation * this.scaleToThreeJS * this.verticalExaggeration;
  }

  /**
   * Convert Three.js Y coordinate back to real-world elevation
   * @param {number} sceneY - Three.js Y coordinate
   * @returns {number} Elevation in meters
   */
  toGeoElevation(sceneY) {
    return sceneY / (this.scaleToThreeJS * this.verticalExaggeration);
  }

  /**
   * Get terrain dimensions for Three.js geometry
   * @returns {{width: number, height: number}} Dimensions in Three.js units
   */
  getTerrainDimensions() {
    return {
      width: this.terrainWidthThreeJS,
      height: this.terrainHeightThreeJS,
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
 * Format EPSG:2180 coordinates for display
 * @param {number} x - Easting
 * @param {number} y - Northing
 * @returns {string} Formatted coordinate string
 */
export function formatEPSG2180(x, y) {
  return `${x.toFixed(2)}E, ${y.toFixed(2)}N`;
}

/**
 * Format elevation for display
 * @param {number} elevation - Elevation in meters
 * @returns {string} Formatted elevation string
 */
export function formatElevation(elevation) {
  return `${elevation.toFixed(2)} m`;
}
