const fc = require('fast-check');
const LocationService = require('../LocationService').default;

describe('LocationService Property Tests', () => {
  
  /**
   * Property 1: Location Permission Grants Valid Coordinates
   * Feature: city-flyers-mvp, Property 1: Location Permission Grants Valid Coordinates
   * Validates: Requirements 1.2
   */
  test('Property 1: Valid coordinates should always be within Earth bounds', () => {
    fc.assert(fc.property(
      fc.double({ min: -90, max: 90, noNaN: true }), // Valid latitude
      fc.double({ min: -180, max: 180, noNaN: true }), // Valid longitude
      (lat, lng) => {
        // For any valid coordinates, isValidCoordinate should return true
        const result = LocationService.isValidCoordinate(lat, lng);
        expect(result).toBe(true);
      }
    ), { numRuns: 100 });
  });

  test('Property 1: Invalid coordinates should always be rejected', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.double({ min: -200, max: -90.01, noNaN: true }), // Invalid latitude (too low)
        fc.double({ min: 90.01, max: 200, noNaN: true }), // Invalid latitude (too high)
        fc.constant(NaN), // NaN values
        fc.constant(null), // Null values
        fc.constant(undefined) // Undefined values
      ),
      fc.double({ min: -180, max: 180, noNaN: true }), // Valid longitude for first test
      (invalidLat, lng) => {
        // For any invalid latitude, isValidCoordinate should return false
        const result = LocationService.isValidCoordinate(invalidLat, lng);
        expect(result).toBe(false);
      }
    ), { numRuns: 100 });
  });

  test('Property 1: Invalid longitude should always be rejected', () => {
    fc.assert(fc.property(
      fc.double({ min: -90, max: 90, noNaN: true }), // Valid latitude
      fc.oneof(
        fc.double({ min: -300, max: -180.01, noNaN: true }), // Invalid longitude (too low)
        fc.double({ min: 180.01, max: 300, noNaN: true }), // Invalid longitude (too high)
        fc.constant(NaN), // NaN values
        fc.constant(null), // Null values
        fc.constant(undefined) // Undefined values
      ),
      (lat, invalidLng) => {
        // For any invalid longitude, isValidCoordinate should return false
        const result = LocationService.isValidCoordinate(lat, invalidLng);
        expect(result).toBe(false);
      }
    ), { numRuns: 100 });
  });

});

describe('LocationService Unit Tests', () => {
  
  test('Distance calculation with known coordinates', () => {
    // Test distance between New York and Los Angeles (approximately 3944 km)
    const nyLat = 40.7128;
    const nyLng = -74.0060;
    const laLat = 34.0522;
    const laLng = -118.2437;
    
    const distance = LocationService.calculateDistance(nyLat, nyLng, laLat, laLng);
    
    // Should be approximately 3,944,000 meters (allow 1% tolerance)
    expect(distance).toBeGreaterThan(3900000);
    expect(distance).toBeLessThan(4000000);
  });

  test('Distance calculation for same location should be zero', () => {
    const lat = 40.7128;
    const lng = -74.0060;
    
    const distance = LocationService.calculateDistance(lat, lng, lat, lng);
    
    expect(distance).toBe(0);
  });

  test('Distance formatting works correctly', () => {
    expect(LocationService.formatDistance(500)).toBe('500m');
    expect(LocationService.formatDistance(1500)).toBe('1.5km');
    expect(LocationService.formatDistance(2750)).toBe('2.8km');
  });

  test('Calculate distance throws error for invalid coordinates', () => {
    expect(() => {
      LocationService.calculateDistance(91, 0, 0, 0); // Invalid latitude
    }).toThrow('Invalid coordinates provided to calculateDistance');
    
    expect(() => {
      LocationService.calculateDistance(0, 181, 0, 0); // Invalid longitude
    }).toThrow('Invalid coordinates provided to calculateDistance');
  });

});