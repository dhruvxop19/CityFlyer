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

// Haversine formula implementation for testing
const haversineDistance = (lat1, lng1, lat2, lng2) => {
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
};

// Mock LocationService with a working calculateDistance implementation
jest.mock('../LocationService', () => ({
  __esModule: true,
  default: {
    calculateDistance: jest.fn((lat1, lng1, lat2, lng2) => {
      const R = 6371000;
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }),
    isValidCoordinate: jest.fn(() => true),
    formatDistance: jest.fn((d) => d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(1)}km`),
  },
}));

describe('FlyerService Property Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 7: Complete Flyer Record Creation
   * Feature: city-flyers-mvp, Property 7: Complete Flyer Record Creation
   * Validates: Requirements 3.6, 4.1
   */
  test('Property 7: Complete flyer record should contain all required schema fields', async () => {
    // Import after mocks are set up
    const FlyerService = require('../FlyerService').default;
    
    // Mock addDoc to capture the document being saved
    mockAddDoc.mockResolvedValue({ id: 'test-id' });

    await fc.assert(fc.asyncProperty(
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
          fc.constant(1000),  // 1km
          fc.constant(3000),  // 3km
          fc.constant(5000)   // 5km
        )
      }),
      fc.string({ minLength: 10 }), // Mock image URI
      async (flyerData, imageUri) => {
        // Mock the Base64 conversion
        const mockBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
        
        // Mock convertImageToBase64 to return the expected format
        jest.spyOn(FlyerService, 'convertImageToBase64').mockResolvedValue({ data: mockBase64, error: null });
        
        const result = await FlyerService.createFlyer(flyerData, imageUri);
        
        // Verify result has no error
        expect(result.error).toBeNull();
        
        // Verify addDoc was called with complete document
        expect(mockAddDoc).toHaveBeenCalled();
        const savedDocument = mockAddDoc.mock.calls[mockAddDoc.mock.calls.length - 1][1];
        
        // Verify all required schema fields are present
        expect(savedDocument).toHaveProperty('title');
        expect(savedDocument).toHaveProperty('description');
        expect(savedDocument).toHaveProperty('category');
        expect(savedDocument).toHaveProperty('imageBase64', mockBase64);
        expect(savedDocument).toHaveProperty('lat');
        expect(savedDocument).toHaveProperty('lng');
        expect(savedDocument).toHaveProperty('radius');
        expect(savedDocument).toHaveProperty('createdAt');
        expect(savedDocument).toHaveProperty('expiresAt');
        
        // Verify data types
        expect(typeof savedDocument.title).toBe('string');
        expect(typeof savedDocument.description).toBe('string');
        expect(typeof savedDocument.category).toBe('string');
        expect(typeof savedDocument.imageBase64).toBe('string');
        expect(typeof savedDocument.lat).toBe('number');
        expect(typeof savedDocument.lng).toBe('number');
        expect(typeof savedDocument.radius).toBe('number');
        expect(savedDocument.createdAt).toBeInstanceOf(Date);
        expect(savedDocument.expiresAt).toBeInstanceOf(Date);
        
        // Verify the values are reasonable
        expect(savedDocument.title.length).toBeGreaterThan(0);
        expect(savedDocument.description.length).toBeGreaterThan(0);
        expect(['event', 'service', 'sale', 'announcement']).toContain(savedDocument.category);
        expect(savedDocument.lat).toBeGreaterThanOrEqual(-90);
        expect(savedDocument.lat).toBeLessThanOrEqual(90);
        expect(savedDocument.lng).toBeGreaterThanOrEqual(-180);
        expect(savedDocument.lng).toBeLessThanOrEqual(180);
        expect([1000, 3000, 5000]).toContain(savedDocument.radius);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property 8: Timestamp Generation Accuracy
   * Feature: city-flyers-mvp, Property 8: Timestamp Generation Accuracy
   * Validates: Requirements 4.2, 4.3, 5.1
   */
  test('Property 8: CreatedAt should be current timestamp and expiresAt should be exactly 7 days later', async () => {
    // Import after mocks are set up
    const FlyerService = require('../FlyerService').default;
    
    // Mock addDoc to capture the document being saved
    mockAddDoc.mockResolvedValue({ id: 'test-id' });

    await fc.assert(fc.asyncProperty(
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
          fc.constant(1000),  // 1km
          fc.constant(3000),  // 3km
          fc.constant(5000)   // 5km
        )
      }),
      fc.string({ minLength: 10 }), // Mock image URI
      async (flyerData, imageUri) => {
        // Mock the Base64 conversion
        const mockBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
        
        // Mock convertImageToBase64 to return the expected format
        jest.spyOn(FlyerService, 'convertImageToBase64').mockResolvedValue({ data: mockBase64, error: null });
        
        // Record time before creation
        const beforeCreation = new Date();
        
        const result = await FlyerService.createFlyer(flyerData, imageUri);
        
        // Record time after creation
        const afterCreation = new Date();
        
        // Verify result has no error
        expect(result.error).toBeNull();
        
        // Verify addDoc was called
        expect(mockAddDoc).toHaveBeenCalled();
        const savedDocument = mockAddDoc.mock.calls[mockAddDoc.mock.calls.length - 1][1];
        
        // Verify createdAt is within reasonable time bounds (within 1 second of test execution)
        const createdAt = savedDocument.createdAt;
        expect(createdAt).toBeInstanceOf(Date);
        expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime() - 1000);
        expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime() + 1000);
        
        // Verify expiresAt is exactly 7 days (604800000 milliseconds) after createdAt
        const expiresAt = savedDocument.expiresAt;
        expect(expiresAt).toBeInstanceOf(Date);
        const timeDifference = expiresAt.getTime() - createdAt.getTime();
        expect(timeDifference).toBe(7 * 24 * 60 * 60 * 1000); // Exactly 7 days in milliseconds
      }
    ), { numRuns: 100 });
  });

  /**
   * Property 2: Distance-Based Flyer Filtering
   * Feature: city-flyers-mvp, Property 2: Distance-Based Flyer Filtering
   * Validates: Requirements 2.2, 2.3
   */
  test('Property 2: Only flyers within their defined radius from user location should be displayed', () => {
    // Import after mocks are set up
    const FlyerService = require('../FlyerService').default;
    
    // Get the mocked LocationService
    const LocationService = require('../LocationService').default;

    fc.assert(fc.property(
      // Generate user location
      fc.record({
        lat: fc.double({ min: -90, max: 90, noNaN: true }),
        lng: fc.double({ min: -180, max: 180, noNaN: true })
      }),
      // Generate array of flyers with various locations and radii
      fc.array(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1 }),
          description: fc.string({ minLength: 1 }),
          category: fc.oneof(
            fc.constant('event'),
            fc.constant('service'),
            fc.constant('sale'),
            fc.constant('announcement')
          ),
          lat: fc.double({ min: -90, max: 90, noNaN: true }),
          lng: fc.double({ min: -180, max: 180, noNaN: true }),
          radius: fc.oneof(
            fc.constant(1000),  // 1km
            fc.constant(3000),  // 3km
            fc.constant(5000)   // 5km
          ),
          imageBase64: fc.string({ minLength: 10 }),
          createdAt: fc.constant(new Date()),
          expiresAt: fc.constant(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now
        }),
        { minLength: 0, maxLength: 20 }
      ),
      (userLocation, flyers) => {
        // Filter flyers using the service method
        const filteredFlyers = FlyerService.filterByDistance(flyers, userLocation.lat, userLocation.lng);

        // Verify that all returned flyers are within their defined radius
        filteredFlyers.forEach(flyer => {
          const distance = LocationService.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            flyer.lat,
            flyer.lng
          );
          
          // The flyer should be within its defined radius
          expect(distance).toBeLessThanOrEqual(flyer.radius);
          
          // The flyer should have a distance property added
          expect(flyer).toHaveProperty('distance');
          expect(typeof flyer.distance).toBe('number');
          expect(flyer.distance).toBeGreaterThanOrEqual(0);
        });

        // Verify that no flyers outside their radius are included
        flyers.forEach(originalFlyer => {
          const distance = LocationService.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            originalFlyer.lat,
            originalFlyer.lng
          );
          
          const isIncluded = filteredFlyers.some(filtered => filtered.id === originalFlyer.id);
          
          if (distance <= originalFlyer.radius) {
            // Flyer within radius should be included
            expect(isIncluded).toBe(true);
          } else {
            // Flyer outside radius should not be included
            expect(isIncluded).toBe(false);
          }
        });
      }
    ), { numRuns: 100 });
  });

});