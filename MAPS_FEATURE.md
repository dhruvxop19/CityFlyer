# Maps Feature Documentation

## Overview

The City Flyers app provides multiple ways to select a custom location for posting flyers, with platform-specific optimizations for iOS and Android users.

## Location Selection Methods

### 1. Address Search (All Platforms)
- Enter any address or location name
- Uses Expo Location geocoding
- Works worldwide
- Example: "Times Square, New York" or "Eiffel Tower, Paris"

### 2. Interactive Map (All Platforms)
- **iOS**: Google Maps in WebView
- **Android**: Google Maps in WebView
- Tap anywhere on the map to select location
- Drag the marker to adjust
- Zoom and pan to explore
- Click "Confirm Location" when ready

### 3. Native Apple Maps (iOS Only)
- Opens the native Apple Maps app
- Better performance on iOS devices
- Familiar iOS interface
- After selecting location, manually enter coordinates back in the app

### 4. Manual Coordinates (All Platforms)
- Enter latitude and longitude directly
- Useful for precise locations
- Latitude: -90 to 90
- Longitude: -180 to 180

## Platform-Specific Features

### iOS Users
iOS users get **two map options**:

1. **Interactive Google Maps** (in-app)
   - Button: "🗺️ Select on Map (Google)"
   - Opens Google Maps in a WebView
   - Select location without leaving the app

2. **Native Apple Maps** (external app)
   - Button: "🍎 Open Apple Maps"
   - Opens the native Apple Maps app
   - Better performance and familiar interface
   - Note: You'll need to manually copy coordinates back

### Android Users
Android users get:

1. **Interactive Google Maps** (in-app)
   - Button: "🗺️ Select on Interactive Map"
   - Opens Google Maps in a WebView
   - Native Google Maps experience

## How to Use

### Using Interactive Map (Recommended)

1. Go to "Add Flyer" screen
2. Select "Custom Location"
3. Click "Select on Interactive Map" (or "Select on Map (Google)" on iOS)
4. Wait for map to load
5. Tap on your desired location
6. Drag the marker to fine-tune
7. Click "Confirm Location"
8. Coordinates are automatically filled in

### Using Apple Maps (iOS Only)

1. Go to "Add Flyer" screen
2. Select "Custom Location"
3. Click "🍎 Open Apple Maps"
4. Apple Maps app opens
5. Find your desired location
6. Long-press to drop a pin
7. Note the coordinates shown
8. Return to City Flyers app
9. Enter coordinates manually

### Using Address Search

1. Go to "Add Flyer" screen
2. Select "Custom Location"
3. Enter an address in the search field
4. Click "🔍 Search Location"
5. Coordinates are automatically filled in

### Using Manual Coordinates

1. Go to "Add Flyer" screen
2. Select "Custom Location"
3. Enter latitude in the first field
4. Enter longitude in the second field
5. Click "📍 Set Coordinates"

## Technical Details

### Map Provider
- **In-App Maps**: Google Maps JavaScript API
- **iOS Native**: Apple Maps (via URL scheme)
- **Android Native**: Google Maps (via geo: URI)

### Coordinates Format
- Latitude: Decimal degrees (-90 to 90)
- Longitude: Decimal degrees (-180 to 180)
- Precision: 6 decimal places

### URL Schemes
- **iOS**: `maps:` and `http://maps.apple.com/`
- **Android**: `geo:` and `https://www.google.com/maps/`

## Troubleshooting

### Map not loading
- Check internet connection
- Ensure location permissions are granted
- Try refreshing the app

### Apple Maps not opening (iOS)
- Ensure Apple Maps is installed (pre-installed on iOS)
- Check if app has permission to open external links
- Try the in-app Google Maps instead

### Coordinates not accurate
- Use the interactive map for better precision
- Zoom in closer before selecting
- Drag the marker to fine-tune position

## Privacy & Permissions

- Location permission required for "Current Location"
- No location permission needed for custom location selection
- Map data provided by Google Maps and Apple Maps
- No location data is stored on external servers

## Future Enhancements

Potential future improvements:
- Native map components (requires development build)
- Offline map support
- Save favorite locations
- Recent locations history
- Map style customization
