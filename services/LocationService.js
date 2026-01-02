import * as Location from 'expo-location';
import { AppError, ErrorTypes, logError, wrapError } from '../utils/ErrorHandler';

class LocationService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second base delay
  }

  /**
   * Request location permissions from the device
   * @returns {Promise<{granted: boolean, error: AppError|null}>} Permission result
   */
  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      
      if (!granted) {
        return {
          granted: false,
          error: new AppError(ErrorTypes.LOCATION_PERMISSION_DENIED),
        };
      }
      
      return { granted: true, error: null };
    } catch (error) {
      logError(error, 'LocationService.requestPermissions');
      return {
        granted: false,
        error: wrapError(error, ErrorTypes.LOCATION_PERMISSION_DENIED),
      };
    }
  }

  /**
   * Get the current location coordinates with retry logic
   * @param {Object} options - Options for location request
   * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
   * @returns {Promise<{location: Object|null, error: AppError|null}>}
   */
  async getCurrentLocation(options = {}) {
    const maxRetries = options.maxRetries ?? this.retryAttempts;
    
    try {
      const permissionResult = await this.requestPermissions();
      if (!permissionResult.granted) {
        return { location: null, error: permissionResult.error };
      }

      let lastError = null;
      
      // Retry logic with exponential backoff
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 15000, // 15 second timeout
          });

          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          // Validate coordinates are within valid Earth bounds
          if (!this.isValidCoordinate(coords.latitude, coords.longitude)) {
            throw new Error('Invalid coordinates received');
          }

          return { location: coords, error: null };
        } catch (error) {
          lastError = error;
          logError(error, `LocationService.getCurrentLocation (attempt ${attempt + 1})`);
          
          // Don't retry on permission errors
          if (error.message?.includes('permission')) {
            break;
          }
          
          // Wait before retrying (exponential backoff)
          if (attempt < maxRetries - 1) {
            await this.delay(this.retryDelay * Math.pow(2, attempt));
          }
        }
      }

      // Classify and return the error
      const errorType = this.classifyLocationError(lastError);
      return {
        location: null,
        error: new AppError(errorType, lastError),
      };
    } catch (error) {
      logError(error, 'LocationService.getCurrentLocation');
      return {
        location: null,
        error: wrapError(error, ErrorTypes.LOCATION_UNAVAILABLE),
      };
    }
  }

  /**
   * Classify location-specific errors
   * @param {Error} error - Error to classify
   * @returns {string} Error type
   */
  classifyLocationError(error) {
    if (!error) return ErrorTypes.LOCATION_UNAVAILABLE;
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('permission')) {
      return ErrorTypes.LOCATION_PERMISSION_DENIED;
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return ErrorTypes.LOCATION_TIMEOUT;
    }
    
    return ErrorTypes.LOCATION_UNAVAILABLE;
  }

  /**
   * Helper function to delay execution
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate that coordinates are within valid Earth bounds
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {boolean} Whether coordinates are valid
   */
  isValidCoordinate(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * @param {number} lat1 - First latitude
   * @param {number} lng1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lng2 - Second longitude
   * @returns {number} Distance in meters
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    // Validate input coordinates
    if (!this.isValidCoordinate(lat1, lng1) || !this.isValidCoordinate(lat2, lng2)) {
      throw new Error('Invalid coordinates provided to calculateDistance');
    }

    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Format distance for display (meters to kilometers)
   * @param {number} distanceInMeters - Distance in meters
   * @returns {string} Formatted distance string
   */
  formatDistance(distanceInMeters) {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
  }
}

export default new LocationService();