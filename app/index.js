import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import FlyerService from '../services/FlyerService';
import LocationService from '../services/LocationService';
import { getErrorInfo, ErrorTypes } from '../utils/ErrorHandler';

export default function HomeFeedScreen() {
  const router = useRouter();
  const [flyers, setFlyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    loadFlyers();
  }, []);

  const loadFlyers = async () => {
    try {
      setLoading(true);
      setError(null);

      const locationResult = await LocationService.getCurrentLocation();
      
      if (locationResult.error) {
        const errorInfo = getErrorInfo(locationResult.error);
        setError({
          title: errorInfo.title,
          message: errorInfo.message,
          type: errorInfo.type,
          recoverable: errorInfo.recoverable,
        });
        setLoading(false);
        return;
      }

      if (!locationResult.location) {
        setError({
          title: 'Location Unavailable',
          message: 'Unable to get your location. Please enable location services.',
          type: ErrorTypes.LOCATION_UNAVAILABLE,
          recoverable: true,
        });
        setLoading(false);
        return;
      }

      setUserLocation(locationResult.location);

      const flyersResult = await FlyerService.getFlyersNearLocation(
        locationResult.location.latitude,
        locationResult.location.longitude
      );

      if (flyersResult.error) {
        const errorInfo = getErrorInfo(flyersResult.error);
        setError({
          title: errorInfo.title,
          message: errorInfo.message,
          type: errorInfo.type,
          recoverable: errorInfo.recoverable,
        });
        setLoading(false);
        return;
      }

      setFlyers(flyersResult.flyers);
    } catch (err) {
      console.error('Error loading flyers:', err);
      setError({
        title: 'Unexpected Error',
        message: 'Something went wrong. Please try again.',
        type: ErrorTypes.UNKNOWN_ERROR,
        recoverable: true,
      });
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    loadFlyers();
  };

  const renderFlyerCard = (flyer, index) => {
    const distanceText = LocationService.formatDistance(flyer.distance);
    
    return (
      <TouchableOpacity 
        key={flyer.id || index} 
        style={styles.flyerCard}
        onPress={() => router.push({ pathname: '/flyer/[id]', params: { id: flyer.id, flyer: JSON.stringify(flyer) } })}
      >
        <Image 
          source={{ uri: flyer.imageBase64 }} 
          style={styles.flyerImage}
          resizeMode="cover"
        />
        <View style={styles.flyerContent}>
          <View style={styles.flyerHeader}>
            <Text style={styles.flyerTitle} numberOfLines={2}>
              {flyer.title}
            </Text>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{distanceText}</Text>
            </View>
          </View>
          <Text style={styles.flyerCategory}>{flyer.category}</Text>
          <Text style={styles.flyerDescription} numberOfLines={3}>
            {flyer.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading flyers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>{error.title}</Text>
        <Text style={styles.errorText}>{error.message}</Text>
        {error.recoverable && (
          <TouchableOpacity 
            style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]} 
            onPress={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.retryButtonText}>Try Again</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>City Flyers</Text>
        <View style={styles.headerRow}>
          <Text style={styles.subtitle}>{flyers.length} flyers near you</Text>
          <Link href="/add-flyer" asChild>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {flyers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No flyers found in your area</Text>
            <Text style={styles.emptyStateSubtext}>Be the first to post a flyer!</Text>
          </View>
        ) : (
          flyers.map(renderFlyerCard)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  header: { backgroundColor: '#fff', paddingTop: 20, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666' },
  addButton: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 15 },
  flyerCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, overflow: 'hidden', elevation: 3 },
  flyerImage: { width: '100%', height: 200, backgroundColor: '#f0f0f0' },
  flyerContent: { padding: 15 },
  flyerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  flyerTitle: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1, marginRight: 10 },
  distanceBadge: { backgroundColor: '#007AFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  distanceText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  flyerCategory: { fontSize: 14, color: '#007AFF', fontWeight: '500', marginBottom: 8 },
  flyerDescription: { fontSize: 14, color: '#666', lineHeight: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  errorText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  errorTitle: { fontSize: 20, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 8 },
  retryButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonDisabled: { backgroundColor: '#ccc' },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 18, color: '#333', fontWeight: '500', marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, color: '#666' },
});
