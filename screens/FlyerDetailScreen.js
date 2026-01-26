import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LocationService from '../services/LocationService';
import { getErrorInfo } from '../utils/ErrorHandler';

const { width: screenWidth } = Dimensions.get('window');

const FlyerDetailScreen = ({ route, navigation }) => {
  const { flyer } = route.params || {};
  const [currentDistance, setCurrentDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    calculateCurrentDistance();
  }, []);

  const calculateCurrentDistance = async () => {
    try {
      setLoading(true);
      setLocationError(null);

      // Get user's current location with enhanced error handling
      const locationResult = await LocationService.getCurrentLocation();
      
      if (locationResult.error) {
        const errorInfo = getErrorInfo(locationResult.error);
        setLocationError(errorInfo.message);
        // Use the distance passed from HomeFeedScreen if available
        if (flyer && flyer.distance !== undefined) {
          setCurrentDistance(flyer.distance);
        }
        setLoading(false);
        return;
      }

      if (!locationResult.location) {
        // Use the distance passed from HomeFeedScreen if available
        if (flyer && flyer.distance !== undefined) {
          setCurrentDistance(flyer.distance);
        }
        setLoading(false);
        return;
      }

      // Calculate distance from user's current location to flyer location
      const distance = LocationService.calculateDistance(
        locationResult.location.latitude,
        locationResult.location.longitude,
        flyer.lat,
        flyer.lng
      );

      setCurrentDistance(distance);
    } catch (err) {
      console.error('Error calculating distance:', err);
      const errorInfo = getErrorInfo(err);
      setLocationError(errorInfo.message);
      // Fallback to the distance passed from HomeFeedScreen
      if (flyer && flyer.distance !== undefined) {
        setCurrentDistance(flyer.distance);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getExpiryStatus = () => {
    if (!flyer || !flyer.expiresAt) return null;
    const expiryDate = flyer.expiresAt.toDate ? flyer.expiresAt.toDate() : new Date(flyer.expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) {
      return { text: 'Expired', color: '#ff3b30' };
    } else if (daysRemaining <= 2) {
      return { text: `Expires in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`, color: '#ff9500' };
    } else {
      return { text: `Expires in ${daysRemaining} days`, color: '#34c759' };
    }
  };

  if (!flyer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Flyer not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const distanceText = currentDistance !== null 
    ? LocationService.formatDistance(currentDistance)
    : (flyer.distance !== undefined ? LocationService.formatDistance(flyer.distance) : 'N/A');

  const expiryStatus = getExpiryStatus();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Back Button */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backButtonTop}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonTopText}>← Back</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Large Flyer Image */}
      <Image
        source={{ uri: flyer.imageBase64 }}
        style={styles.flyerImage}
        resizeMode="cover"
      />

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Header with Title and Distance */}
        <View style={styles.header}>
          <Text style={styles.title}>{flyer.title}</Text>
          <View style={styles.distanceBadge}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.distanceText}>{distanceText}</Text>
            )}
          </View>
        </View>

        {/* Category Badge */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {flyer.category ? flyer.category.charAt(0).toUpperCase() + flyer.category.slice(1) : 'General'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{flyer.description}</Text>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Posted:</Text>
            <Text style={styles.detailValue}>{formatDate(flyer.createdAt)}</Text>
          </View>

          {expiryStatus && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, { color: expiryStatus.color }]}>
                {expiryStatus.text}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Visibility Radius:</Text>
            <Text style={styles.detailValue}>
              {flyer.radius ? `${flyer.radius / 1000} km` : 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Distance from you:</Text>
            <Text style={styles.detailValue}>{distanceText}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  backButtonTop: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonTopText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  flyerImage: {
    width: screenWidth,
    height: screenWidth * 0.75,
    backgroundColor: '#e0e0e0',
  },
  contentSection: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  distanceBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  distanceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryBadge: {
    backgroundColor: '#f0ebf8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#764ba2',
  },
  categoryText: {
    color: '#764ba2',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
});

export default FlyerDetailScreen;
