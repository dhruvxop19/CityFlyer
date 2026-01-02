/**
 * Property-based tests for flyer creation functionality
 * Feature: city-flyers-mvp
 */

const fc = require('fast-check');

// Mock Firebase Firestore
const mockAddDoc = jest.fn();
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: mockAddDoc,
  getDocs: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
}));

// Mock Firebase config
jest.mock('../../firebase.config', () => ({
  db: {},
}));

// Mock LocationService
jest.mock('../LocationService', () => ({
  __esModule: true,
  default: {
    getCurrentLocation: jest.fn(),
    requestPermissions: jest.fn(),
    calculateDistance: jest.fn(),
    isValidCoordinate: jest.fn((lat, lng) => {
      return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180 &&
        !isNaN(lat) &&
        !isNaN(lng)
      );
    }),
  },
}));

describe('Flyer Creation Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 5: Flyer Creation Location Capture
   * Feature: city-flyers-mvp, Property 5: Flyer Creation Location Capture
   * Validates: Requirements 3.4
   * 
   * For any flyer creation event, the app should capture and store the poster's 
   * current GPS coordinates as part of the flyer record.
   */
  test('Property 5: Flyer creation should capture and store GPS coordinates', async () => {
    const FlyerService = require('../FlyerService').default;
    
    mockAddDoc.mockResolvedValue({ id: 'test-id' });

    await fc.assert(fc.asyncProperty(
      // Generate valid GPS coordinates
      fc.record({
        latitude: fc.double({ min: -90, max: 90, noNaN: true }),
        longitude: fc.double({ min: -180, max: 180, noNaN: true }),
      }),
      // Generate flyer data
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        category: fc.oneof(
          fc.constant('event'),
          fc.constant('service'),
          fc.constant('sale'),
          fc.constant('announcement')
        ),
        radius: fc.oneof(
          fc.constant(1000),
          fc.constant(3000),
          fc.constant(5000)
        ),
      }),
      async (location, flyerData) => {
        // Create flyer data with location
        const flyerWithLocation = {
          ...flyerData,
          lat: location.latitude,
          lng: location.longitude,
        };

        // Mock Base64 conversion
        const mockBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
        jest.spyOn(FlyerService, 'convertImageToBase64').mockResolvedValue({ data: mockBase64, error: null });

        const result = await FlyerService.createFlyer(flyerWithLocation, 'file://test.jpg');

        // Verify result has no error
        expect(result.error).toBeNull();
        
        // Verify addDoc was called
        expect(mockAddDoc).toHaveBeenCalled();
        const savedDocument = mockAddDoc.mock.calls[mockAddDoc.mock.calls.length - 1][1];

        // Verify GPS coordinates are captured and stored
        expect(savedDocument).toHaveProperty('lat');
        expect(savedDocument).toHaveProperty('lng');
        expect(typeof savedDocument.lat).toBe('number');
        expect(typeof savedDocument.lng).toBe('number');
        
        // Verify coordinates match the input location
        expect(savedDocument.lat).toBe(location.latitude);
        expect(savedDocument.lng).toBe(location.longitude);
        
        // Verify coordinates are within valid Earth bounds
        expect(savedDocument.lat).toBeGreaterThanOrEqual(-90);
        expect(savedDocument.lat).toBeLessThanOrEqual(90);
        expect(savedDocument.lng).toBeGreaterThanOrEqual(-180);
        expect(savedDocument.lng).toBeLessThanOrEqual(180);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property 6: Image Base64 Conversion
   * Feature: city-flyers-mvp, Property 6: Image Base64 Conversion
   * Validates: Requirements 3.5
   * 
   * For any valid image selected during flyer creation, the app should successfully 
   * convert it to Base64 format and include it in the flyer document.
   */
  test('Property 6: Image should be converted to Base64 and included in flyer document', async () => {
    const FlyerService = require('../FlyerService').default;
    
    mockAddDoc.mockResolvedValue({ id: 'test-id' });

    await fc.assert(fc.asyncProperty(
      // Generate flyer data
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        category: fc.oneof(
          fc.constant('event'),
          fc.constant('service'),
          fc.constant('sale'),
          fc.constant('announcement')
        ),
        lat: fc.double({ min: -90, max: 90, noNaN: true }),
        lng: fc.double({ min: -180, max: 180, noNaN: true }),
        radius: fc.oneof(
          fc.constant(1000),
          fc.constant(3000),
          fc.constant(5000)
        ),
      }),
      // Generate mock Base64 data (simulating different image sizes)
      fc.string({ minLength: 100, maxLength: 1000 }).map(s => 
        `data:image/jpeg;base64,${Buffer.from(s).toString('base64')}`
      ),
      async (flyerData, mockBase64) => {
        // Mock Base64 conversion to return our generated Base64
        jest.spyOn(FlyerService, 'convertImageToBase64').mockResolvedValue({ data: mockBase64, error: null });

        const result = await FlyerService.createFlyer(flyerData, 'file://test.jpg');

        // Verify result has no error
        expect(result.error).toBeNull();
        
        // Verify addDoc was called
        expect(mockAddDoc).toHaveBeenCalled();
        const savedDocument = mockAddDoc.mock.calls[mockAddDoc.mock.calls.length - 1][1];

        // Verify imageBase64 field exists and contains Base64 data
        expect(savedDocument).toHaveProperty('imageBase64');
        expect(typeof savedDocument.imageBase64).toBe('string');
        expect(savedDocument.imageBase64.length).toBeGreaterThan(0);
        
        // Verify Base64 format (should start with data:image prefix)
        expect(savedDocument.imageBase64).toMatch(/^data:image\/[a-z]+;base64,/);
        
        // Verify the Base64 data matches what was converted
        expect(savedDocument.imageBase64).toBe(mockBase64);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property 9: Image Base64 Round-Trip Consistency
   * Feature: city-flyers-mvp, Property 9: Image Base64 Round-Trip Consistency
   * Validates: Requirements 4.4
   * 
   * For any flyer with Base64 image data, the imageBase64 field should contain 
   * valid Base64 encoded image data that can be displayed correctly.
   */
  test('Property 9: Base64 image data should be valid and displayable', async () => {
    const FlyerService = require('../FlyerService').default;
    
    mockAddDoc.mockResolvedValue({ id: 'test-id' });

    await fc.assert(fc.asyncProperty(
      // Generate flyer data
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        category: fc.oneof(
          fc.constant('event'),
          fc.constant('service'),
          fc.constant('sale'),
          fc.constant('announcement')
        ),
        lat: fc.double({ min: -90, max: 90, noNaN: true }),
        lng: fc.double({ min: -180, max: 180, noNaN: true }),
        radius: fc.oneof(
          fc.constant(1000),
          fc.constant(3000),
          fc.constant(5000)
        ),
      }),
      // Generate valid Base64 image data with proper format
      fc.oneof(
        fc.constant('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='),
        fc.constant('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
        fc.constant('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')
      ),
      async (flyerData, validBase64) => {
        // Mock Base64 conversion
        jest.spyOn(FlyerService, 'convertImageToBase64').mockResolvedValue({ data: validBase64, error: null });

        const result = await FlyerService.createFlyer(flyerData, 'file://test.jpg');

        // Verify result has no error
        expect(result.error).toBeNull();
        
        // Verify addDoc was called
        expect(mockAddDoc).toHaveBeenCalled();
        const savedDocument = mockAddDoc.mock.calls[mockAddDoc.mock.calls.length - 1][1];

        // Verify imageBase64 field exists
        expect(savedDocument).toHaveProperty('imageBase64');
        const imageBase64 = savedDocument.imageBase64;

        // Verify Base64 format is valid
        expect(typeof imageBase64).toBe('string');
        expect(imageBase64.length).toBeGreaterThan(0);

        // Verify it has proper data URI format
        const dataUriRegex = /^data:image\/(jpeg|png|gif|webp);base64,([A-Za-z0-9+/=]+)$/;
        expect(imageBase64).toMatch(dataUriRegex);

        // Extract and validate the Base64 portion
        const match = imageBase64.match(dataUriRegex);
        expect(match).not.toBeNull();
        
        const base64Data = match[2];
        
        // Verify Base64 data can be decoded (valid Base64 string)
        expect(() => {
          // Check if it's valid Base64 by attempting to decode
          const decoded = Buffer.from(base64Data, 'base64');
          expect(decoded.length).toBeGreaterThan(0);
        }).not.toThrow();

        // Verify round-trip: the stored data matches what was converted
        expect(imageBase64).toBe(validBase64);
      }
    ), { numRuns: 100 });
  });
});
