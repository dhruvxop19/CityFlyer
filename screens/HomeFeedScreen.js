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
import { useAuth, useUser } from '@clerk/clerk-expo';
import FlyerService from '../services/FlyerService';
import LocationService from '../services/LocationService';
import { getErrorInfo, ErrorTypes } from '../utils/ErrorHandler';

const HomeFeedScreen = ({ navigation }) => {
  const { signOut, isSignedIn } = useAuth();
  const { user } = useUser();
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

      // Get user location with enhanced error handling
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

      // Get flyers near user location with enhanced error handling
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

  const handleFlyerPress = (flyer) => {
    navigation.navigate('FlyerDetail', { flyer });
  };

  const renderFlyerCard = (flyer) => {
    const distanceText = LocationService.formatDistance(flyer.distance);
    
    return (
      <TouchableOpacity 
        key={flyer.id} 
        style={styles.flyerCard}
        onPress={() => handleFlyerPress(flyer)}
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

  const renderErrorIcon = () => {
    if (!error) return null;
    
    switch (error.type) {
      case ErrorTypes.LOCATION_PERMISSION_DENIED:
        return <Text style={styles.errorIcon}>📍</Text>;
      case ErrorTypes.LOCATION_UNAVAILABLE:
      case ErrorTypes.LOCATION_TIMEOUT:
        return <Text style={styles.errorIcon}>🗺️</Text>;
      case ErrorTypes.FIREBASE_CONNECTIVITY:
      case ErrorTypes.NETWORK_ERROR:
        return <Text style={styles.errorIcon}>📶</Text>;
      default:
        return <Text style={styles.errorIcon}>⚠️</Text>;
    }
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
        {renderErrorIcon()}
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
        {error.type === ErrorTypes.LOCATION_PERMISSION_DENIED && (
          <Text style={styles.helpText}>
            Go to Settings → Privacy → Location Services to enable location access.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>City Flyers</Text>
            {user?.primaryEmailAddress && (
              <Text style={styles.userEmail}>{user.primaryEmailAddress.emailAddress}</Text>
            )}
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('AddFlyer')}
            >
              <Text style={styles.headerButtonText}>+ Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.signOutButton]}
              onPress={() => signOut()}
            >
              <Text style={styles.headerButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {flyers.length} flyers near you
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={Boolean(false)}
      >
        {flyers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No flyers found in your area
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Be the first to post a flyer!
            </Text>
          </View>
        ) : (
          flyers.map(renderFlyerCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  flyerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  flyerImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  flyerContent: {
    padding: 15,
  },
  flyerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  flyerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  distanceBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  flyerCategory: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  flyerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  helpText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonDisabled: {
    backgroundColor: '#ccc',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeFeedScreen;