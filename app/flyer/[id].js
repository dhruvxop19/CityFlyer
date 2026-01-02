import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import LocationService from '../../services/LocationService';
import { getErrorInfo } from '../../utils/ErrorHandler';

const { width: screenWidth } = Dimensions.get('window');

export default function FlyerDetailScreen() {
  const params = useLocalSearchParams();
  const flyer = params.flyer ? JSON.parse(params.flyer) : null;
  
  const [currentDistance, setCurrentDistance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateCurrentDistance();
  }, []);

  const calculateCurrentDistance = async () => {
    try {
      setLoading(true);
      const locationResult = await LocationService.getCurrentLocation();
      
      if (locationResult.location && flyer) {
        const distance = LocationService.calculateDistance(
          locationResult.location.latitude,
          locationResult.location.longitude,
          flyer.lat,
          flyer.lng
        );
        setCurrentDistance(distance);
      } else if (flyer && flyer.distance !== undefined) {
        setCurrentDistance(flyer.distance);
      }
    } catch (err) {
      console.error('Error calculating distance:', err);
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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getExpiryStatus = () => {
    if (!flyer || !flyer.expiresAt) return null;
    const expiryDate = flyer.expiresAt.toDate ? flyer.expiresAt.toDate() : new Date(flyer.expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) return { text: 'Expired', color: '#ff3b30' };
    if (daysRemaining <= 2) return { text: `Expires in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`, color: '#ff9500' };
    return { text: `Expires in ${daysRemaining} days`, color: '#34c759' };
  };

  if (!flyer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Flyer not found</Text>
      </View>
    );
  }

  const distanceText = currentDistance !== null 
    ? LocationService.formatDistance(currentDistance)
    : (flyer.distance !== undefined ? LocationService.formatDistance(flyer.distance) : 'N/A');

  const expiryStatus = getExpiryStatus();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Image source={{ uri: flyer.imageBase64 }} style={styles.flyerImage} resizeMode="cover" />

      <View style={styles.contentSection}>
        <View style={styles.header}>
          <Text style={styles.title}>{flyer.title}</Text>
          <View style={styles.distanceBadge}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.distanceText}>{distanceText}</Text>}
          </View>
        </View>

        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{flyer.category ? flyer.category.charAt(0).toUpperCase() + flyer.category.slice(1) : 'General'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{flyer.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Posted:</Text>
            <Text style={styles.detailValue}>{formatDate(flyer.createdAt)}</Text>
          </View>
          {expiryStatus && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, { color: expiryStatus.color }]}>{expiryStatus.text}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Visibility Radius:</Text>
            <Text style={styles.detailValue}>{flyer.radius ? `${flyer.radius / 1000} km` : 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Distance from you:</Text>
            <Text style={styles.detailValue}>{distanceText}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contentContainer: { paddingBottom: 30 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  flyerImage: { width: screenWidth, height: screenWidth * 0.75, backgroundColor: '#e0e0e0' },
  contentSection: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 12 },
  distanceBadge: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, minWidth: 60, alignItems: 'center' },
  distanceText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  categoryContainer: { flexDirection: 'row', marginBottom: 20 },
  categoryBadge: { backgroundColor: '#e8f4fd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  categoryText: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  description: { fontSize: 16, color: '#666', lineHeight: 24 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  detailLabel: { fontSize: 14, color: '#666' },
  detailValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  errorText: { fontSize: 18, color: '#ff3b30', textAlign: 'center', marginBottom: 20 },
});
