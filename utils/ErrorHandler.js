/**
 * Error Handler Utility
 * Provides centralized error handling with user-friendly messages
 */

// Error types for categorization
export const ErrorTypes = {
  LOCATION_PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',
  LOCATION_UNAVAILABLE: 'LOCATION_UNAVAILABLE',
  LOCATION_TIMEOUT: 'LOCATION_TIMEOUT',
  FIREBASE_CONNECTIVITY: 'FIREBASE_CONNECTIVITY',
  FIREBASE_OPERATION: 'FIREBASE_OPERATION',
  IMAGE_CONVERSION: 'IMAGE_CONVERSION',
  IMAGE_PICKER: 'IMAGE_PICKER',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// User-friendly error messages
const errorMessages = {
  [ErrorTypes.LOCATION_PERMISSION_DENIED]: {
    title: 'Location Access Denied',
    message: 'Please enable location services in your device settings to see flyers near you.',
    recoverable: true,
  },
  [ErrorTypes.LOCATION_UNAVAILABLE]: {
    title: 'Location Unavailable',
    message: 'Unable to determine your location. Please check your GPS settings and try again.',
    recoverable: true,
  },
  [ErrorTypes.LOCATION_TIMEOUT]: {
    title: 'Location Timeout',
    message: 'Getting your location took too long. Please try again in an area with better GPS signal.',
    recoverable: true,
  },
  [ErrorTypes.FIREBASE_CONNECTIVITY]: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    recoverable: true,
  },
  [ErrorTypes.FIREBASE_OPERATION]: {
    title: 'Server Error',
    message: 'Something went wrong while processing your request. Please try again later.',
    recoverable: true,
  },
  [ErrorTypes.IMAGE_CONVERSION]: {
    title: 'Image Processing Error',
    message: 'Failed to process the selected image. Please try selecting a different image.',
    recoverable: true,
  },
  [ErrorTypes.IMAGE_PICKER]: {
    title: 'Image Selection Error',
    message: 'Unable to access your photo library. Please check app permissions.',
    recoverable: true,
  },
  [ErrorTypes.NETWORK_ERROR]: {
    title: 'Network Error',
    message: 'No internet connection. Please check your network settings and try again.',
    recoverable: true,
  },
  [ErrorTypes.VALIDATION_ERROR]: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    recoverable: true,
  },
  [ErrorTypes.UNKNOWN_ERROR]: {
    title: 'Unexpected Error',
    message: 'Something unexpected happened. Please try again.',
    recoverable: true,
  },
};

/**
 * Custom error class with type and user-friendly message
 */
export class AppError extends Error {
  constructor(type, originalError = null, customMessage = null) {
    const errorInfo = errorMessages[type] || errorMessages[ErrorTypes.UNKNOWN_ERROR];
    super(customMessage || errorInfo.message);
    
    this.name = 'AppError';
    this.type = type;
    this.title = errorInfo.title;
    this.userMessage = customMessage || errorInfo.message;
    this.recoverable = errorInfo.recoverable;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Classify error based on error message or type
 * @param {Error} error - Original error
 * @returns {string} Error type
 */
export function classifyError(error) {
  if (!error) return ErrorTypes.UNKNOWN_ERROR;
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';
  
  // Location errors
  if (message.includes('permission denied') || message.includes('permission')) {
    return ErrorTypes.LOCATION_PERMISSION_DENIED;
  }
  if (message.includes('location') && message.includes('unavailable')) {
    return ErrorTypes.LOCATION_UNAVAILABLE;
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return ErrorTypes.LOCATION_TIMEOUT;
  }
  
  // Firebase/Network errors
  if (code.includes('unavailable') || message.includes('network') || 
      message.includes('failed to fetch') || message.includes('network request failed')) {
    return ErrorTypes.FIREBASE_CONNECTIVITY;
  }
  if (code.includes('firebase') || message.includes('firestore')) {
    return ErrorTypes.FIREBASE_OPERATION;
  }
  
  // Image errors
  if (message.includes('base64') || message.includes('image') && message.includes('convert')) {
    return ErrorTypes.IMAGE_CONVERSION;
  }
  if (message.includes('picker') || message.includes('gallery')) {
    return ErrorTypes.IMAGE_PICKER;
  }
  
  // Network errors
  if (message.includes('network') || message.includes('internet') || 
      message.includes('offline') || message.includes('connection')) {
    return ErrorTypes.NETWORK_ERROR;
  }
  
  return ErrorTypes.UNKNOWN_ERROR;
}

/**
 * Create an AppError from any error
 * @param {Error} error - Original error
 * @param {string} fallbackType - Fallback error type if classification fails
 * @returns {AppError} Wrapped error
 */
export function wrapError(error, fallbackType = ErrorTypes.UNKNOWN_ERROR) {
  if (error instanceof AppError) {
    return error;
  }
  
  const type = classifyError(error) || fallbackType;
  return new AppError(type, error);
}

/**
 * Get user-friendly error info
 * @param {Error|AppError} error - Error to get info for
 * @returns {Object} Error info with title and message
 */
export function getErrorInfo(error) {
  if (error instanceof AppError) {
    return {
      title: error.title,
      message: error.userMessage,
      recoverable: error.recoverable,
      type: error.type,
    };
  }
  
  const type = classifyError(error);
  const info = errorMessages[type] || errorMessages[ErrorTypes.UNKNOWN_ERROR];
  return {
    title: info.title,
    message: info.message,
    recoverable: info.recoverable,
    type,
  };
}

/**
 * Log error for debugging (can be extended for remote logging)
 * @param {Error} error - Error to log
 * @param {string} context - Context where error occurred
 */
export function logError(error, context = '') {
  const timestamp = new Date().toISOString();
  const errorInfo = error instanceof AppError ? {
    type: error.type,
    message: error.message,
    originalError: error.originalError?.message,
  } : {
    type: classifyError(error),
    message: error.message,
  };
  
  console.error(`[${timestamp}] Error in ${context}:`, errorInfo);
}

export default {
  ErrorTypes,
  AppError,
  classifyError,
  wrapError,
  getErrorInfo,
  logError,
};
