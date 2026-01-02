/**
 * Integration tests for error handling scenarios
 * Feature: city-flyers-mvp
 * Validates: Requirements 1.3
 */

const fc = require('fast-check');

// Mock Firebase Firestore
const mockAddDoc = jest.fn();
const mockGetDocs = jest.fn();
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: mockAddDoc,
  getDocs: mockGetDocs,
  query: jest.fn((collection) => collection),
  orderBy: jest.fn(() => ({})),
}));

// Mock Firebase config
jest.mock('../../firebase.config', () => ({
  db: {},
}));

// Mock expo-location
const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: mockRequestForegroundPermissionsAsync,
  getCurrentPositionAsync: mockGetCurrentPositionAsync,
  Accuracy: {
    Balanced: 3,
  },
}));

describe('Error Handling Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('Location Permission Denied Scenarios', () => {
    test('should return appropriate error when location permission is denied', async () => {
      // Mock permission denied
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const LocationService = require('../LocationService').default;
      const result = await LocationService.getCurrentLocation();

      expect(result.location).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('LOCATION_PERMISSION_DENIED');
      expect(result.error.title).toBe('Location Access Denied');
      expect(result.error.userMessage).toContain('location services');
    });

    test('should return appropriate error when permission request throws', async () => {
      // Mock permission request throwing an error
      mockRequestForegroundPermissionsAsync.mockRejectedValue(new Error('Permission request failed'));

      const LocationService = require('../LocationService').default;
      const result = await LocationService.getCurrentLocation();

      expect(result.location).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.recoverable).toBe(true);
    });

    test('requestPermissions should return error object when denied', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const LocationService = require('../LocationService').default;
      const result = await LocationService.requestPermissions();

      expect(result.granted).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('LOCATION_PERMISSION_DENIED');
    });
  });

  describe('Location Unavailable Scenarios', () => {
    test('should return appropriate error when location times out', async () => {
      // Mock permission granted but location times out
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockGetCurrentPositionAsync.mockRejectedValue(new Error('Location request timed out'));

      const LocationService = require('../LocationService').default;
      const result = await LocationService.getCurrentLocation({ maxRetries: 1 });

      expect(result.location).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('LOCATION_TIMEOUT');
    });

    test('should return appropriate error when location is unavailable', async () => {
      // Mock permission granted but location unavailable
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockGetCurrentPositionAsync.mockRejectedValue(new Error('Location unavailable'));

      const LocationService = require('../LocationService').default;
      const result = await LocationService.getCurrentLocation({ maxRetries: 1 });

      expect(result.location).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('LOCATION_UNAVAILABLE');
    });

    test('should retry on location failure before returning error', async () => {
      // Mock permission granted but location fails twice then succeeds
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockGetCurrentPositionAsync
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          coords: { latitude: 40.7128, longitude: -74.006 }
        });

      const LocationService = require('../LocationService').default;
      const result = await LocationService.getCurrentLocation({ maxRetries: 2 });

      expect(result.location).not.toBeNull();
      expect(result.error).toBeNull();
      expect(result.location.latitude).toBe(40.7128);
      expect(result.location.longitude).toBe(-74.006);
    });
  });

  describe('Firebase Connectivity Failure Scenarios', () => {
    test('should return appropriate error when Firebase is unavailable', async () => {
      // Mock Firebase network error
      mockAddDoc.mockRejectedValue(new Error('Network request failed'));

      // Mock LocationService for FlyerService
      jest.doMock('../LocationService', () => ({
        __esModule: true,
        default: {
          isValidCoordinate: jest.fn(() => true),
          calculateDistance: jest.fn(() => 100),
        },
      }));

      const FlyerService = require('../FlyerService').default;
      
      // Mock convertImageToBase64
      jest.spyOn(FlyerService, 'convertImageToBase64').mockResolvedValue({ 
        data: 'data:image/jpeg;base64,test', 
        error: null 
      });

      const flyerData = {
        title: 'Test Flyer',
        description: 'Test Description',
        category: 'event',
        lat: 40.7128,
        lng: -74.006,
        radius: 1000,
      };

      const result = await FlyerService.createFlyer(flyerData, 'file://test.jpg');

      expect(result.id).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('FIREBASE_CONNECTIVITY');
    });

    test('should return appropriate error when Firestore query fails', async () => {
      // Mock Firestore query error
      mockGetDocs.mockRejectedValue(new Error('Firestore unavailable'));

      // Mock LocationService
      jest.doMock('../LocationService', () => ({
        __esModule: true,
        default: {
          isValidCoordinate: jest.fn(() => true),
          calculateDistance: jest.fn(() => 100),
        },
      }));

      const FlyerService = require('../FlyerService').default;
      const result = await FlyerService.getFlyersNearLocation(40.7128, -74.006);

      expect(result.flyers).toEqual([]);
      expect(result.error).toBeDefined();
      // Error could be FIREBASE_CONNECTIVITY or FIREBASE_OPERATION depending on error type
      expect(['FIREBASE_CONNECTIVITY', 'FIREBASE_OPERATION']).toContain(result.error.type);
    });

    test('should retry Firebase operations on transient failures', async () => {
      // Mock Firebase failing once then succeeding
      mockAddDoc
        .mockRejectedValueOnce(new Error('Network unavailable'))
        .mockResolvedValueOnce({ id: 'test-id' });

      jest.doMock('../LocationService', () => ({
        __esModule: true,
        default: {
          isValidCoordinate: jest.fn(() => true),
          calculateDistance: jest.fn(() => 100),
        },
      }));

      const FlyerService = require('../FlyerService').default;
      
      jest.spyOn(FlyerService, 'convertImageToBase64').mockResolvedValue({ 
        data: 'data:image/jpeg;base64,test', 
        error: null 
      });

      const flyerData = {
        title: 'Test Flyer',
        description: 'Test Description',
        category: 'event',
        lat: 40.7128,
        lng: -74.006,
        radius: 1000,
      };

      const result = await FlyerService.createFlyer(flyerData, 'file://test.jpg');

      expect(result.id).toBe('test-id');
      expect(result.error).toBeNull();
    });
  });

  describe('Image Base64 Conversion Failure Scenarios', () => {
    test('should return appropriate error when image URI is invalid', async () => {
      jest.doMock('../LocationService', () => ({
        __esModule: true,
        default: {
          isValidCoordinate: jest.fn(() => true),
          calculateDistance: jest.fn(() => 100),
        },
      }));

      const FlyerService = require('../FlyerService').default;
      
      // Test with null image URI
      const result = await FlyerService.convertImageToBase64(null);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('IMAGE_CONVERSION');
    });

    test('should return appropriate error when image fetch fails', async () => {
      // Mock fetch to fail
      global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch image'));

      jest.doMock('../LocationService', () => ({
        __esModule: true,
        default: {
          isValidCoordinate: jest.fn(() => true),
          calculateDistance: jest.fn(() => 100),
        },
      }));

      const FlyerService = require('../FlyerService').default;
      const result = await FlyerService.convertImageToBase64('file://invalid.jpg');

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      // Error could be IMAGE_CONVERSION or FIREBASE_CONNECTIVITY depending on how fetch error is classified
      expect(['IMAGE_CONVERSION', 'FIREBASE_CONNECTIVITY', 'NETWORK_ERROR']).toContain(result.error.type);
    });

    test('should return appropriate error when image response is not ok', async () => {
      // Mock fetch to return non-ok response
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      jest.doMock('../LocationService', () => ({
        __esModule: true,
        default: {
          isValidCoordinate: jest.fn(() => true),
          calculateDistance: jest.fn(() => 100),
        },
      }));

      const FlyerService = require('../FlyerService').default;
      const result = await FlyerService.convertImageToBase64('file://notfound.jpg');

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('IMAGE_CONVERSION');
      expect(result.error.userMessage).toContain('Failed to fetch image');
    });

    test('should propagate image conversion error to createFlyer', async () => {
      mockAddDoc.mockResolvedValue({ id: 'test-id' });

      jest.doMock('../LocationService', () => ({
        __esModule: true,
        default: {
          isValidCoordinate: jest.fn(() => true),
          calculateDistance: jest.fn(() => 100),
        },
      }));

      const FlyerService = require('../FlyerService').default;
      
      // Mock convertImageToBase64 to return an error
      jest.spyOn(FlyerService, 'convertImageToBase64').mockResolvedValue({ 
        data: null, 
        error: { type: 'IMAGE_CONVERSION', userMessage: 'Failed to convert image' }
      });

      const flyerData = {
        title: 'Test Flyer',
        description: 'Test Description',
        category: 'event',
        lat: 40.7128,
        lng: -74.006,
        radius: 1000,
      };

      const result = await FlyerService.createFlyer(flyerData, 'file://test.jpg');

      expect(result.id).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('IMAGE_CONVERSION');
    });
  });

  describe('Data Validation Error Scenarios', () => {
    test('should return validation error for missing title', async () => {
      jest.doMock('../LocationService', () => ({
        __esModule: true,
        default: {
          isValidCoordinate: jest.fn(() => true),
          calculateDistance: jest.fn(() => 100),
        },
      }));

      const FlyerService = require('../FlyerService').default;
      
      const flyerData = {
        title: '',
        description: 'Test Description',
        category: 'event',
        lat: 40.7128,
        lng: -74.006,
        radius: 1000,
      };

      const result = await FlyerService.createFlyer(flyerData, 'file://test.jpg');

      expect(result.id).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('VALIDATION_ERROR');
      expect(result.error.userMessage).toContain('Title');
    });

    test('should return validation error for invalid coordinates', async () => {
      jest.doMock('../LocationService', () => ({
        __esModule: true,
        default: {
          isValidCoordinate: jest.fn(() => false),
          calculateDistance: jest.fn(() => 100),
        },
      }));

      const FlyerService = require('../FlyerService').default;
      
      const result = await FlyerService.getFlyersNearLocation(999, 999);

      expect(result.flyers).toEqual([]);
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('VALIDATION_ERROR');
    });

    test('should return validation error for missing radius', async () => {
      jest.doMock('../LocationService', () => ({
        __esModule: true,
        default: {
          isValidCoordinate: jest.fn(() => true),
          calculateDistance: jest.fn(() => 100),
        },
      }));

      const FlyerService = require('../FlyerService').default;
      
      const flyerData = {
        title: 'Test Flyer',
        description: 'Test Description',
        category: 'event',
        lat: 40.7128,
        lng: -74.006,
        radius: 0, // Invalid radius
      };

      const result = await FlyerService.createFlyer(flyerData, 'file://test.jpg');

      expect(result.id).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('VALIDATION_ERROR');
    });
  });
});
