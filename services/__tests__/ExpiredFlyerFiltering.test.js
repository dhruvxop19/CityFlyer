const fc = require('fast-check');

// Standalone implementation of expiry filtering logic (mirrors FlyerService.filterByExpiry)
const filterByExpiry = (flyers) => {
  const now = new Date();
  return flyers.filter((flyer) => {
    const expiresAt = flyer.expiresAt instanceof Date ? flyer.expiresAt : new Date(flyer.expiresAt);
    // Handle invalid dates
    if (isNaN(expiresAt.getTime())) {
      return false;
    }
    return expiresAt > now;
  });
};

// Helper to generate valid dates
const validDateArbitrary = (minOffset, maxOffset) => {
  const now = Date.now();
  return fc.integer({ min: now + minOffset, max: now + maxOffset }).map(ts => new Date(ts));
};

describe('Expired Flyer Exclusion Property Tests', () => {
  
  /**
   * Property 4: Expired Flyer Exclusion
   * Feature: city-flyers-mvp, Property 4: Expired Flyer Exclusion
   * Validates: Requirements 2.6, 5.2, 5.3
   * 
   * For any set of flyers, those with expiresAt timestamps before the current time 
   * should never appear in feed displays or search results.
   */
  test('Property 4: Expired flyers should never appear in filtered results', () => {
    fc.assert(fc.property(
      // Generate array of flyers with various expiry states, then assign unique IDs
      fc.array(
        fc.record({
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
          createdAt: validDateArbitrary(-30 * 24 * 60 * 60 * 1000, 0), // Up to 30 days ago
          // Generate expiresAt that can be either in the past (expired) or future (valid)
          expiresAt: validDateArbitrary(-14 * 24 * 60 * 60 * 1000, 14 * 24 * 60 * 60 * 1000) // -14 to +14 days
        }),
        { minLength: 0, maxLength: 20 }
      ).map(flyersWithoutIds => 
        // Assign unique IDs to each flyer using array index
        flyersWithoutIds.map((flyer, index) => ({ ...flyer, id: `flyer-${index}` }))
      ),
      (flyers) => {
        const now = new Date();
        
        // Filter flyers using the expiry filtering function
        const filteredFlyers = filterByExpiry(flyers);

        // Property: All returned flyers should have expiresAt > now (not expired)
        filteredFlyers.forEach(flyer => {
          const expiresAt = flyer.expiresAt instanceof Date ? flyer.expiresAt : new Date(flyer.expiresAt);
          expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
        });

        // Property: No expired flyers should be in the results
        flyers.forEach(originalFlyer => {
          const expiresAt = originalFlyer.expiresAt instanceof Date ? originalFlyer.expiresAt : new Date(originalFlyer.expiresAt);
          const isExpired = isNaN(expiresAt.getTime()) || expiresAt <= now;
          const isIncluded = filteredFlyers.some(filtered => filtered.id === originalFlyer.id);
          
          if (isExpired) {
            // Expired flyers should NOT be included
            expect(isIncluded).toBe(false);
          } else {
            // Non-expired flyers should be included
            expect(isIncluded).toBe(true);
          }
        });
      }
    ), { numRuns: 100 });
  });

});