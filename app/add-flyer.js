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
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import LocationService from '../services/LocationService';
import FlyerService from '../services/FlyerService';
import { getErrorInfo } from '../utils/ErrorHandler';

const CATEGORIES = ['event', 'service', 'sale', 'announcement'];
const RADIUS_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
];

export default function AddFlyerScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
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
      Alert.alert('Error', 'Failed to access photo library.');
    }
  };

  const validateForm = () => {
    if (!imageUri) { Alert.alert('Missing Image', 'Please select an image.'); return false; }
    if (!title.trim()) { Alert.alert('Missing Title', 'Please enter a title.'); return false; }
    if (!description.trim()) { Alert.alert('Missing Description', 'Please enter a description.'); return false; }
    if (!category) { Alert.alert('Missing Category', 'Please select a category.'); return false; }
    if (!radius) { Alert.alert('Missing Radius', 'Please select a visibility radius.'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmissionStatus('Getting your location...');
    
    try {
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

      setSubmissionStatus('Processing image...');

      const flyerData = {
        title: title.trim(),
        description: description.trim(),
        category,
        lat: locationResult.location.latitude,
        lng: locationResult.location.longitude,
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
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      Alert.alert(errorInfo.title || 'Error', errorInfo.message || 'Failed to create flyer.');
    } finally {
      setIsSubmitting(false);
      setSubmissionStatus('');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Create New Flyer</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.selectedImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Tap to select image</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} placeholder="Enter flyer title" value={title} onChangeText={setTitle} maxLength={100} />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Enter flyer description" value={description} onChangeText={setDescription} multiline={true} numberOfLines={4} maxLength={500} />

      <Text style={styles.label}>Category</Text>
      <View style={styles.optionsContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat} style={[styles.optionButton, category === cat && styles.optionButtonSelected]} onPress={() => setCategory(cat)}>
            <Text style={[styles.optionText, category === cat && styles.optionTextSelected]}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Visibility Radius</Text>
      <View style={styles.optionsContainer}>
        {RADIUS_OPTIONS.map((option) => (
          <TouchableOpacity key={option.value} style={[styles.optionButton, radius === option.value && styles.optionButtonSelected]} onPress={() => setRadius(option.value)}>
            <Text style={[styles.optionText, radius === option.value && styles.optionTextSelected]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <View style={styles.submittingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            {submissionStatus ? <Text style={styles.submittingText}>{submissionStatus}</Text> : null}
          </View>
        ) : (
          <Text style={styles.submitButtonText}>Post Flyer</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  imagePicker: { marginBottom: 20, borderRadius: 10, overflow: 'hidden' },
  selectedImage: { width: '100%', height: 200, resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', borderRadius: 10 },
  imagePlaceholderText: { color: '#888', fontSize: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: '#fafafa' },
  textArea: { height: 100, textAlignVertical: 'top' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 8 },
  optionButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa' },
  optionButtonSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  optionText: { fontSize: 14, color: '#333' },
  optionTextSelected: { color: '#fff', fontWeight: '600' },
  submitButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  submitButtonDisabled: { backgroundColor: '#ccc' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  submittingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  submittingText: { color: '#fff', fontSize: 14, marginLeft: 8 },
});
