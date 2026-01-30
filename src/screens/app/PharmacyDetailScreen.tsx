import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PharmacyStackParamList } from '../../navigation/AppNavigator';
import { Pharmacy } from '../../services/PharmacyService';

type Props = NativeStackScreenProps<PharmacyStackParamList, 'PharmacyDetail'>;

// Mock pharmacy data
const MOCK_PHARMACIES: Record<string, Pharmacy & { hours?: Record<string, string>; website?: string }> = {
  '1': {
    id: '1',
    name: 'Farmacia Mayor',
    address: 'Calle Principal 123, Santiago',
    latitude: -33.4489,
    longitude: -70.6693,
    phone: '+56 2 1234 5678',
    distance: 0.5,
    hours: {
      'Monday-Friday': '8:00 AM - 9:00 PM',
      'Saturday': '9:00 AM - 9:00 PM',
      'Sunday': '10:00 AM - 8:00 PM',
    },
    website: 'www.farmacimayor.cl',
  },
  '2': {
    id: '2',
    name: 'Farmacias Salcobrand',
    address: 'Av. Kennedy 4000, Las Condes',
    latitude: -33.3882,
    longitude: -70.5734,
    phone: '+56 2 9876 5432',
    distance: 2.1,
    hours: {
      'Monday-Friday': '7:00 AM - 10:00 PM',
      'Saturday': '8:00 AM - 10:00 PM',
      'Sunday': '9:00 AM - 10:00 PM',
    },
    website: 'www.salcobrand.cl',
  },
  '3': {
    id: '3',
    name: 'Farmacia Dr. Simi',
    address: 'Providencia 3456, Providencia',
    latitude: -33.4165,
    longitude: -70.6106,
    phone: '+56 2 5555 5555',
    distance: 1.8,
    hours: {
      'Monday-Friday': '8:30 AM - 8:30 PM',
      'Saturday': '9:00 AM - 8:00 PM',
      'Sunday': '10:00 AM - 7:00 PM',
    },
    website: 'www.drsimiChile.cl',
  },
};

/**
 * PharmacyDetailScreen: Display detailed pharmacy information
 * - Hours of operation
 * - Contact information
 * - Location details
 * - Action buttons for call/directions
 */
export default function PharmacyDetailScreen({ route, navigation }: Props) {
  const [pharmacy, setPharmacy] = useState<(Pharmacy & { hours?: Record<string, string>; website?: string }) | null>(null);

  useEffect(() => {
    const pharmacyId = route.params.pharmacyId;
    const pharmaData = MOCK_PHARMACIES[pharmacyId];

    if (pharmaData) {
      setPharmacy(pharmaData);
      navigation.setOptions({
        headerTitle: pharmaData.name,
      });
    }
  }, []);

  const handleCall = () => {
    if (pharmacy?.phone) {
      Linking.openURL(`tel:${pharmacy.phone}`);
    }
  };

  const handleDirections = () => {
    if (pharmacy) {
      const url = `http://maps.apple.com/?address=${pharmacy.address}&saddr=${pharmacy.latitude},${pharmacy.longitude}`;
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps
        const googleUrl = `https://www.google.com/maps/search/?api=1&query=${pharmacy.latitude},${pharmacy.longitude}`;
        Linking.openURL(googleUrl);
      });
    }
  };

  if (!pharmacy) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Pharmacy not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Distance */}
      <View style={styles.headerSection}>
        <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
        {pharmacy.distance && (
          <View style={styles.distanceTag}>
            <Ionicons name="location-outline" size={16} color="#2196F3" />
            <Text style={styles.distanceText}>{pharmacy.distance.toFixed(1)} km</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <View style={[styles.actionIcon, { backgroundColor: '#2196F3' }]}>
            <Ionicons name="call" size={20} color="#fff" />
          </View>
          <Text style={styles.actionLabel}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
          <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="navigate" size={20} color="#fff" />
          </View>
          <Text style={styles.actionLabel}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="share-social" size={20} color="#fff" />
          </View>
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{pharmacy.phone}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{pharmacy.address}</Text>
          </View>
        </View>

        {pharmacy.website && (
          <View style={styles.infoRow}>
            <Ionicons name="globe-outline" size={20} color="#2196F3" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Website</Text>
              <Text style={styles.infoValue}>{pharmacy.website}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Hours of Operation */}
      {pharmacy.hours && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours of Operation</Text>

          {Object.entries(pharmacy.hours).map(([day, hours]) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{day}</Text>
              <Text style={styles.hoursTime}>{hours}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>

        <View style={styles.serviceItem}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
          <Text style={styles.serviceText}>Prescription Filling</Text>
        </View>

        <View style={styles.serviceItem}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
          <Text style={styles.serviceText}>Health Consultations</Text>
        </View>

        <View style={styles.serviceItem}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
          <Text style={styles.serviceText}>Medicine Delivery</Text>
        </View>

        <View style={styles.serviceItem}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
          <Text style={styles.serviceText}>Insurance Accepted</Text>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

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
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },
  headerSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  pharmacyName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  distanceTag: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hoursDay: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  hoursTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  serviceText: {
    fontSize: 13,
    color: '#666',
  },
  spacer: {
    height: 20,
  },
});
