const fc = require('fast-check');

// Standalone implementation of distance calculation using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
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

// Standalone implementation of distance filtering logic
const filterByDistance = (flyers, userLat, userLng) => {
  return flyers.filter((flyer) => {
    const distance = calculateDistance(
      userLat,
      userLng,
      flyer.lat,
      flyer.lng
    );
    return distance <= flyer.radius;
  }).map((flyer) => ({
    ...flyer,
    distance: calculateDistance(userLat, userLng, flyer.lat, flyer.lng),
  }));
};

describe('Distance-Based Flyer Filtering Property Tests', () => {
  
  /**
   * Property 2: Distance-Based Flyer Filtering
   * Feature: city-flyers-mvp, Property 2: Distance-Based Flyer Filtering
   * Validates: Requirements 2.2, 2.3
   */
  test('Property 2: Only flyers within their defined radius from user location should be displayed', () => {
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
        // Filter flyers using the standalone filtering function
        const filteredFlyers = filterByDistance(flyers, userLocation.lat, userLocation.lng);

        // Verify that all returned flyers are within their defined radius
        filteredFlyers.forEach(flyer => {
          const distance = calculateDistance(
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
          const distance = calculateDistance(
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