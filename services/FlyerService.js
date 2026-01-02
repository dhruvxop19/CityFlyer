import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.config';
import LocationService from './LocationService';
import { AppError, ErrorTypes, logError, wrapError } from '../utils/ErrorHandler';

class FlyerService {
  constructor() {
    this.flyersCollection = collection(db, 'flyers');
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  /**
   * Create a new flyer with Base64 image
   * @param {Object} flyerData - Flyer data (title, description, category, lat, lng, radius)
   * @param {string} imageUri - Local image URI
   * @returns {Promise<{id: string|null, error: AppError|null}>} Result with document ID or error
   */
  async createFlyer(flyerData, imageUri) {
    try {
      // Validate input data
      const validationError = this.validateFlyerData(flyerData);
      if (validationError) {
        return { id: null, error: validationError };
      }

      // Convert image to Base64 with error handling
      const imageResult = await this.convertImageToBase64(imageUri);
      if (imageResult.error) {
        return { id: null, error: imageResult.error };
      }
      
      // Create flyer document with timestamps
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      const flyerDoc = {
        ...flyerData,
        imageBase64: imageResult.data,
        createdAt: now,
        expiresAt,
      };

      // Attempt to save with retry logic
      const saveResult = await this.saveWithRetry(flyerDoc);
      return saveResult;
    } catch (error) {
      logError(error, 'FlyerService.createFlyer');
      return {
        id: null,
        error: wrapError(error, ErrorTypes.FIREBASE_OPERATION),
      };
    }
  }

  /**
   * Validate flyer data before saving
   * @param {Object} flyerData - Flyer data to validate
   * @returns {AppError|null} Validation error or null if valid
   */
  validateFlyerData(flyerData) {
    if (!flyerData) {
      return new AppError(ErrorTypes.VALIDATION_ERROR, null, 'Flyer data is required');
    }
    if (!flyerData.title?.trim()) {
      return new AppError(ErrorTypes.VALIDATION_ERROR, null, 'Title is required');
    }
    if (!flyerData.description?.trim()) {
      return new AppError(ErrorTypes.VALIDATION_ERROR, null, 'Description is required');
    }
    if (!flyerData.category) {
      return new AppError(ErrorTypes.VALIDATION_ERROR, null, 'Category is required');
    }
    if (typeof flyerData.lat !== 'number' || typeof flyerData.lng !== 'number') {
      return new AppError(ErrorTypes.VALIDATION_ERROR, null, 'Valid location coordinates are required');
    }
    if (!flyerData.radius || flyerData.radius <= 0) {
      return new AppError(ErrorTypes.VALIDATION_ERROR, null, 'Valid radius is required');
    }
    return null;
  }

  /**
   * Save flyer document with retry logic
   * @param {Object} flyerDoc - Flyer document to save
   * @returns {Promise<{id: string|null, error: AppError|null}>}
   */
  async saveWithRetry(flyerDoc) {
    let lastError = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const docRef = await addDoc(this.flyersCollection, flyerDoc);
        return { id: docRef.id, error: null };
      } catch (error) {
        lastError = error;
        logError(error, `FlyerService.saveWithRetry (attempt ${attempt + 1})`);
        
        // Check if error is recoverable
        if (!this.isRetryableError(error)) {
          break;
        }
        
        // Wait before retrying
        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }
    
    return {
      id: null,
      error: wrapError(lastError, ErrorTypes.FIREBASE_OPERATION),
    };
  }

  /**
   * Check if error is retryable (network/connectivity issues)
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is retryable
   */
  isRetryableError(error) {
    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';
    
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('unavailable') ||
      code.includes('unavailable') ||
      code.includes('network')
    );
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
   * Convert image URI to Base64 string with error handling
   * @param {string} imageUri - Local image URI
   * @returns {Promise<{data: string|null, error: AppError|null}>} Base64 result or error
   */
  async convertImageToBase64(imageUri) {
    try {
      if (!imageUri) {
        return {
          data: null,
          error: new AppError(ErrorTypes.IMAGE_CONVERSION, null, 'No image URI provided'),
        };
      }

      const response = await fetch(imageUri);
      
      if (!response.ok) {
        return {
          data: null,
          error: new AppError(ErrorTypes.IMAGE_CONVERSION, null, 'Failed to fetch image'),
        };
      }
      
      const blob = await response.blob();
      
      // Validate blob
      if (!blob || blob.size === 0) {
        return {
          data: null,
          error: new AppError(ErrorTypes.IMAGE_CONVERSION, null, 'Invalid image data'),
        };
      }
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          // Validate Base64 result
          if (!result || !result.startsWith('data:')) {
            resolve({
              data: null,
              error: new AppError(ErrorTypes.IMAGE_CONVERSION, null, 'Failed to convert image to Base64'),
            });
          } else {
            resolve({ data: result, error: null });
          }
        };
        reader.onerror = (error) => {
          logError(error, 'FlyerService.convertImageToBase64');
          resolve({
            data: null,
            error: new AppError(ErrorTypes.IMAGE_CONVERSION, error, 'Failed to read image data'),
          });
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      logError(error, 'FlyerService.convertImageToBase64');
      return {
        data: null,
        error: wrapError(error, ErrorTypes.IMAGE_CONVERSION),
      };
    }
  }

  /**
   * Get flyers near a specific location with error handling
   * @param {number} userLat - User's latitude
   * @param {number} userLng - User's longitude
   * @returns {Promise<{flyers: Array, error: AppError|null}>} Result with flyers or error
   */
  async getFlyersNearLocation(userLat, userLng) {
    try {
      // Validate coordinates
      if (!LocationService.isValidCoordinate(userLat, userLng)) {
        return {
          flyers: [],
          error: new AppError(ErrorTypes.VALIDATION_ERROR, null, 'Invalid location coordinates'),
        };
      }

      const querySnapshot = await getDocs(
        query(this.flyersCollection, orderBy('createdAt', 'desc'))
      );
      
      const allFlyers = [];
      querySnapshot.forEach((doc) => {
        allFlyers.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Filter by expiry and distance
      const validFlyers = this.filterByExpiry(allFlyers);
      const nearbyFlyers = this.filterByDistance(validFlyers, userLat, userLng);
      
      return { flyers: nearbyFlyers, error: null };
    } catch (error) {
      logError(error, 'FlyerService.getFlyersNearLocation');
      return {
        flyers: [],
        error: wrapError(error, ErrorTypes.FIREBASE_CONNECTIVITY),
      };
    }
  }

  /**
   * Filter flyers by distance from user location
   * @param {Array} flyers - Array of flyers
   * @param {number} userLat - User's latitude
   * @param {number} userLng - User's longitude
   * @returns {Array} Filtered flyers within their radius
   */
  filterByDistance(flyers, userLat, userLng) {
    return flyers.filter((flyer) => {
      const distance = LocationService.calculateDistance(
        userLat,
        userLng,
        flyer.lat,
        flyer.lng
      );
      return distance <= flyer.radius;
    }).map((flyer) => ({
      ...flyer,
      distance: LocationService.calculateDistance(userLat, userLng, flyer.lat, flyer.lng),
    }));
  }

  /**
   * Filter out expired flyers
   * @param {Array} flyers - Array of flyers
   * @returns {Array} Non-expired flyers
   */
  filterByExpiry(flyers) {
    const now = new Date();
    return flyers.filter((flyer) => {
      const expiresAt = flyer.expiresAt.toDate ? flyer.expiresAt.toDate() : new Date(flyer.expiresAt);
      return expiresAt > now;
    });
  }
}

export default new FlyerService();