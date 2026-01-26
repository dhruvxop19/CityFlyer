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
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import LocationService from '../services/LocationService';
import FlyerService from '../services/FlyerService';
import { getErrorInfo, ErrorTypes } from '../utils/ErrorHandler';

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
      if (data.type === 'locationSelected') {
        setCustomLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
        setShowMapModal(false);
        Alert.alert('Location Selected', `Coordinates:\nLatitude: ${data.latitude.toFixed(6)}\nLongitude: ${data.longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error parsing map message:', error);
    }
  };

  const getMapHTML = () => {
    const mapProvider = Platform.OS === 'ios' ? 'Google Maps' : 'Google Maps';
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body, html { margin: 0; padding: 0; height: 100%; }
    #map { height: 100%; width: 100%; }
    .instructions {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 10px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      z-index: 1000;
      font-family: Arial, sans-serif;
      font-size: 14px;
    }
    .platform-badge {
      position: absolute;
      top: 60px;
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
    .confirm-btn {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #007AFF;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      z-index: 1000;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="instructions">Tap on the map to select a location</div>
  <div class="platform-badge">${mapProvider}</div>
  <div id="map"></div>
  <button class="confirm-btn" onclick="confirmLocation()">Confirm Location</button>
  
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBg4AcujbKNc2eirrbmVvsWG0LjwVaLGI8"></script>
  <script>
    let map;
    let marker;
    let selectedLocation = null;
    
    function initMap() {
      const center = { lat: ${mapCenter.lat}, lng: ${mapCenter.lng} };
      
      map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });
      
      marker = new google.maps.Marker({
        map: map,
        position: center,
        draggable: true,
      });
      
      selectedLocation = center;
      
      map.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.setPosition({ lat, lng });
        selectedLocation = { lat, lng };
      });
      
      marker.addListener('dragend', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        selectedLocation = { lat, lng };
      });
    }
    
    function confirmLocation() {
      if (selectedLocation) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'locationSelected',
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
        }));
      }
    }
    
    initMap();
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create New Flyer</Text>
        <View style={styles.placeholder} />
      </View>

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
              {Platform.OS === 'ios' ? '🗺️ Select on Map (Google)' : '🗺️ Select on Interactive Map'}
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
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading map...</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  placeholder: {
    width: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imagePicker: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  imagePlaceholderText: {
    color: '#888',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
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
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  setCoordinatesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  appleMapsButton: {
    backgroundColor: '#000',
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
