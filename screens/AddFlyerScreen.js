import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import LocationService from '../services/LocationService';
import FlyerService from '../services/FlyerService';
import { getErrorInfo, ErrorTypes } from '../utils/ErrorHandler';
import BottomNav from '../components/BottomNav';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CATEGORIES = ['event', 'service', 'sale', 'announcement'];
const RADIUS_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
];

const AddFlyerScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');
  
  // Location selection state
  const [locationType, setLocationType] = useState('current'); // 'current' or 'custom'
  const [customAddress, setCustomAddress] = useState('');
  const [customLocation, setCustomLocation] = useState(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [tempMapLocation, setTempMapLocation] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7580, lng: -73.9855 });

  const geocodeAddress = async () => {
    if (!customAddress.trim()) {
      Alert.alert('Missing Address', 'Please enter an address or location.');
      return;
    }

    setIsGeocodingAddress(true);
    try {
      const results = await Location.geocodeAsync(customAddress);
      
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        setCustomLocation({ latitude, longitude });
        Alert.alert('Success', `Location found:\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`);
      } else {
        Alert.alert('Location Not Found', 'Could not find the specified address. Please try a different address or enter coordinates manually.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to find location. Please check the address and try again or enter coordinates manually.');
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  const setManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid numbers for latitude and longitude.');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      Alert.alert('Invalid Latitude', 'Latitude must be between -90 and 90.');
      return;
    }
    
    if (lng < -180 || lng > 180) {
      Alert.alert('Invalid Longitude', 'Longitude must be between -180 and 180.');
      return;
    }
    
    setCustomLocation({ latitude: lat, longitude: lng });
    Alert.alert('Success', `Coordinates set:\nLatitude: ${lat.toFixed(6)}\nLongitude: ${lng.toFixed(6)}`);
  };

  const openMapPicker = async () => {
    // Get current location to center the map
    const locationResult = await LocationService.getCurrentLocation();
    if (locationResult.location) {
      setMapCenter({
        lat: locationResult.location.latitude,
        lng: locationResult.location.longitude,
      });
    }
    setShowMapModal(true);
  };

  const openNativeMaps = async () => {
    // Get current location
    const locationResult = await LocationService.getCurrentLocation();
    const lat = locationResult.location?.latitude || 40.7580;
    const lng = locationResult.location?.longitude || -73.9855;
    
    // Open native maps app based on platform
    const scheme = Platform.select({
      ios: `maps:0,0?q=Select+Location@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(Select+Location)`,
    });
    
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=Select+Location`,
      android: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });

    try {
      const supported = await Linking.canOpenURL(scheme);
      if (supported) {
        await Linking.openURL(scheme);
        Alert.alert(
          'Select Location',
          'After selecting your location in Maps, please manually enter the coordinates here.',
          [{ text: 'OK' }]
        );
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert('Error', 'Could not open maps application');
    }
  };

  const handleMapMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelected' || data.type === 'locationUpdate') {
        setTempMapLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (error) {
      console.error('Error parsing map message:', error);
    }
  };

  const getMapHTML = () => {
    const mapProvider = Platform.OS === 'ios' ? 'OpenStreetMap' : 'OpenStreetMap';
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body, html { 
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      position: relative;
    }
    #map { 
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      height: 100%;
      width: 100%;
    }
    
    /* Move Leaflet zoom controls to right side, away from search */
    .leaflet-control-zoom {
      margin-right: 10px !important;
      margin-top: 80px !important;
    }
    
    .search-container {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      z-index: 1000;
      display: flex;
      gap: 8px;
    }
    .search-input {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      background: white;
    }
    .search-btn {
      padding: 12px 20px;
      background: #007AFF;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer;
      flex-shrink: 0;
    }
    .search-btn:active {
      background: #0056b3;
    }
    .instructions {
      position: absolute;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 8px 16px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      z-index: 1000;
      font-family: Arial, sans-serif;
      font-size: 12px;
      max-width: 80%;
      text-align: center;
    }
    .platform-badge {
      position: absolute;
      top: 110px;
      left: 50%;
      transform: translateX(-50%);
      background: ${Platform.OS === 'ios' ? '#007AFF' : '#34A853'};
      color: white;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      z-index: 1000;
    }
    .button-container {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      padding: 0 15px;
      z-index: 10000;
      pointer-events: none;
      display: flex;
      justify-content: center;
    }
    .confirm-btn {
      width: 100%;
      max-width: 300px;
      background: #007AFF;
      color: white;
      padding: 16px 32px;
      border: none;
      border-radius: 10px;
      font-size: 18px;
      font-weight: 700;
      box-shadow: 0 6px 20px rgba(0,122,255,0.5);
      cursor: pointer;
      pointer-events: auto;
      text-align: center;
    }
    .confirm-btn:active {
      background: #0056b3;
      transform: scale(0.98);
    }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      z-index: 2000;
      font-size: 14px;
    }
    .hidden {
      display: none !important;
    }
  </style>
</head>
<body>
  <div class="search-container">
    <input type="text" id="searchInput" class="search-input" placeholder="Search location..." />
    <button onclick="searchLocation()" class="search-btn">🔍</button>
  </div>
  <div class="instructions">Tap on the map or search to select a location</div>
  <div class="platform-badge">${mapProvider}</div>
  <div id="loading" class="loading hidden">Searching...</div>
  <div id="map"></div>
  
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    let map;
    let marker;
    let selectedLocation = null;
    
    // Initialize map
    const center = [${mapCenter.lat}, ${mapCenter.lng}];
    
    map = L.map('map').setView(center, 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Add marker
    marker = L.marker(center, { draggable: true }).addTo(map);
    selectedLocation = { lat: center[0], lng: center[1] };
    
    // Handle map click
    map.on('click', function(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      marker.setLatLng([lat, lng]);
      selectedLocation = { lat, lng };
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'locationUpdate',
        latitude: lat,
        longitude: lng,
      }));
    });
    
    // Handle marker drag
    marker.on('dragend', function(e) {
      const position = marker.getLatLng();
      selectedLocation = { lat: position.lat, lng: position.lng };
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'locationUpdate',
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      }));
    });
    
    // Search functionality
    async function searchLocation() {
      const query = document.getElementById('searchInput').value.trim();
      if (!query) return;
      
      const loading = document.getElementById('loading');
      loading.classList.remove('hidden');
      
      try {
        const response = await fetch(
          \`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query)}&limit=1\`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          
          // Move map and marker to searched location
          map.setView([lat, lng], 15);
          marker.setLatLng([lat, lng]);
          selectedLocation = { lat, lng };
        } else {
          alert('Location not found. Try a different search term.');
        }
      } catch (error) {
        alert('Search failed. Please try again.');
      } finally {
        loading.classList.add('hidden');
      }
    }
    
    // Allow Enter key to search
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchLocation();
      }
    });
    
    function confirmLocation() {
      if (selectedLocation) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'locationSelected',
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
        }));
      }
    }
    
    // Auto-send location updates
    map.on('moveend', function() {
      const center = map.getCenter();
      selectedLocation = { lat: center.lat, lng: center.lng };
    });
  </script>
</body>
</html>
    `;
  };

  const pickImage = async () => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select images for your flyer.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      Alert.alert(
        'Image Selection Error',
        'Failed to access your photo library. Please check app permissions and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const validateForm = () => {
    if (!imageUri) {
      Alert.alert('Missing Image', 'Please select an image for your flyer.');
      return false;
    }
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your flyer.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description for your flyer.');
      return false;
    }
    if (!category) {
      Alert.alert('Missing Category', 'Please select a category for your flyer.');
      return false;
    }
    if (!radius) {
      Alert.alert('Missing Radius', 'Please select a visibility radius for your flyer.');
      return false;
    }
    if (locationType === 'custom' && !customLocation) {
      Alert.alert('Missing Location', 'Please search for a location or use your current location.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let flyerLocation;
      
      if (locationType === 'custom' && customLocation) {
        // Use custom location
        setSubmissionStatus('Using custom location...');
        flyerLocation = customLocation;
      } else {
        // Get current location
        setSubmissionStatus('Getting your location...');
        const locationResult = await LocationService.getCurrentLocation();
        
        if (locationResult.error) {
          const errorInfo = getErrorInfo(locationResult.error);
          Alert.alert(errorInfo.title, errorInfo.message);
          setIsSubmitting(false);
          setSubmissionStatus('');
          return;
        }

        if (!locationResult.location) {
          Alert.alert('Location Error', 'Unable to get your current location.');
          setIsSubmitting(false);
          setSubmissionStatus('');
          return;
        }
        
        flyerLocation = locationResult.location;
      }

      setSubmissionStatus('Processing image...');

      const flyerData = {
        title: title.trim(),
        description: description.trim(),
        category,
        lat: flyerLocation.latitude,
        lng: flyerLocation.longitude,
        radius,
      };

      setSubmissionStatus('Uploading flyer...');

      const createResult = await FlyerService.createFlyer(flyerData, imageUri);
      
      if (createResult.error) {
        const errorInfo = getErrorInfo(createResult.error);
        Alert.alert(errorInfo.title, errorInfo.message);
        setIsSubmitting(false);
        setSubmissionStatus('');
        return;
      }
      
      Alert.alert('Success', 'Your flyer has been posted!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      Alert.alert(
        errorInfo.title || 'Error',
        errorInfo.message || 'Failed to create flyer. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      setSubmissionStatus('');
    }
  };

  const handleTabPress = (tab) => {
    if (tab === 'home') {
      navigation.navigate('HomeFeed');
    } else if (tab === 'create') {
      // Already on create
    } else if (tab === 'settings') {
      navigation.navigate('Settings');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create New Flyer</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.selectedImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Tap to select image</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Title Input */}
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter flyer title"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />

      {/* Description Input */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter flyer description"
        value={description}
        onChangeText={setDescription}
        multiline={true}
        numberOfLines={4}
        maxLength={500}
      />

      {/* Category Selector */}
      <Text style={styles.label}>Category</Text>
      <View style={styles.optionsContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.optionButton,
              category === cat && styles.optionButtonSelected,
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.optionText,
                category === cat && styles.optionTextSelected,
              ]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location Selector */}
      <Text style={styles.label}>Location</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[styles.optionButton, locationType === 'current' && styles.optionButtonSelected]} 
          onPress={() => setLocationType('current')}
        >
          <Text style={[styles.optionText, locationType === 'current' && styles.optionTextSelected]}>Current Location</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.optionButton, locationType === 'custom' && styles.optionButtonSelected]} 
          onPress={() => setLocationType('custom')}
        >
          <Text style={[styles.optionText, locationType === 'custom' && styles.optionTextSelected]}>Custom Location</Text>
        </TouchableOpacity>
      </View>

      {locationType === 'custom' && (
        <View style={styles.customLocationContainer}>
          <Text style={styles.sectionTitle}>Search by Address</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter address (e.g., Times Square, New York)" 
            value={customAddress} 
            onChangeText={setCustomAddress}
          />
          <TouchableOpacity 
            style={[styles.searchButton, isGeocodingAddress && styles.searchButtonDisabled]} 
            onPress={geocodeAddress}
            disabled={isGeocodingAddress}
          >
            {isGeocodingAddress ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>🔍 Search Location</Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.orText}>OR</Text>
          
          <TouchableOpacity 
            style={styles.mapButton} 
            onPress={openMapPicker}
          >
            <Text style={styles.mapButtonText}>
              🗺️ Select on Interactive Map
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity 
              style={[styles.mapButton, styles.appleMapsButton]} 
              onPress={openNativeMaps}
            >
              <Text style={styles.mapButtonText}>🍎 Open Apple Maps</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.orText}>OR</Text>
          
          <Text style={styles.sectionTitle}>Enter Coordinates Manually</Text>
          <Text style={styles.helpText}>
            You can find coordinates on Google Maps by right-clicking a location
          </Text>
          <View style={styles.coordinateRow}>
            <View style={styles.coordinateInput}>
              <Text style={styles.coordinateLabel}>Latitude</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g., 40.7580" 
                value={manualLat} 
                onChangeText={setManualLat}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.coordinateInput}>
              <Text style={styles.coordinateLabel}>Longitude</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g., -73.9855" 
                value={manualLng} 
                onChangeText={setManualLng}
                keyboardType="numeric"
              />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.setCoordinatesButton} 
            onPress={setManualCoordinates}
          >
            <Text style={styles.setCoordinatesButtonText}>📍 Set Coordinates</Text>
          </TouchableOpacity>
          
          {customLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationInfoTitle}>✓ Location Selected</Text>
              <Text style={styles.locationInfoText}>
                Latitude: {customLocation.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationInfoText}>
                Longitude: {customLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Radius Selector */}
      <Text style={styles.label}>Visibility Radius</Text>
      <View style={styles.optionsContainer}>
        {RADIUS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              radius === option.value && styles.optionButtonSelected,
            ]}
            onPress={() => setRadius(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                radius === option.value && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <View style={styles.submittingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            {submissionStatus ? (
              <Text style={styles.submittingText}>{submissionStatus}</Text>
            ) : null}
          </View>
        ) : (
          <Text style={styles.submitButtonText}>Post Flyer</Text>
        )}
      </TouchableOpacity>

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Text style={styles.mapHeaderButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.mapHeaderTitle}>Select Location</Text>
            <View style={{ width: 60 }} />
          </View>
          
          <WebView
            source={{ html: getMapHTML() }}
            style={styles.webview}
            onMessage={handleMapMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            cacheEnabled={false}
            incognito={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading map...</Text>
              </View>
            )}
          />
          
          <View style={styles.mapButtonContainer}>
            <TouchableOpacity 
              style={styles.mapConfirmButton}
              onPress={() => {
                if (tempMapLocation) {
                  setCustomLocation(tempMapLocation);
                  setShowMapModal(false);
                  Alert.alert('Location Selected', `Coordinates:\nLatitude: ${tempMapLocation.latitude.toFixed(6)}\nLongitude: ${tempMapLocation.longitude.toFixed(6)}`);
                }
              }}
            >
              <Text style={styles.mapConfirmButtonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
    <BottomNav activeTab="create" onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  headerGradient: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  imagePicker: {
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    borderRadius: 20,
  },
  imagePlaceholderText: {
    color: '#888',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginHorizontal: 20,
    color: '#333',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 15,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: 20,
    gap: 10,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submittingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  headerButton: {
    marginLeft: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  customLocationContainer: {
    marginBottom: 16,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  searchButton: {
    backgroundColor: '#34c759',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#34c759',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginVertical: 12,
    fontWeight: '600',
  },
  coordinateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  coordinateInput: {
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  setCoordinatesButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  setCoordinatesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF9500',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  appleMapsButton: {
    backgroundColor: '#000',
    shadowColor: '#000',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  locationInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 6,
  },
  locationInfoText: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 2,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mapHeaderButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  webview: {
    flex: 1,
  },
  mapButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  mapConfirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mapConfirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default AddFlyerScreen;
