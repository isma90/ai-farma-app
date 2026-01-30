import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PharmacyStackParamList } from '../../navigation/AppNavigator';
import { Pharmacy } from '../../services/PharmacyService';

type Props = NativeStackScreenProps<PharmacyStackParamList, 'PharmacyMap'>;

// Mock pharmacy data for demo
const MOCK_PHARMACIES: Pharmacy[] = [
  {
    id: '1',
    name: 'Farmacia Mayor',
    address: 'Calle Principal 123, Santiago',
    latitude: -33.4489,
    longitude: -70.6693,
    phone: '+56 2 1234 5678',
    distance: 0.5,
  },
  {
    id: '2',
    name: 'Farmacias Salcobrand',
    address: 'Av. Kennedy 4000, Las Condes',
    latitude: -33.3882,
    longitude: -70.5734,
    phone: '+56 2 9876 5432',
    distance: 2.1,
  },
  {
    id: '3',
    name: 'Farmacia Dr. Simi',
    address: 'Providencia 3456, Providencia',
    latitude: -33.4165,
    longitude: -70.6106,
    phone: '+56 2 5555 5555',
    distance: 1.8,
  },
];

// Default map region (Santiago, Chile)
const DEFAULT_REGION = {
  latitude: -33.4489,
  longitude: -70.6693,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

/**
 * PharmacyMapScreen: Display pharmacies on a map
 * - Show pharmacy markers
 * - Display info callouts
 * - Navigate to pharmacy details
 */
export default function PharmacyMapScreen({ navigation }: Props) {
  const [pharmacies] = useState<Pharmacy[]>(MOCK_PHARMACIES);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [loading] = useState(false);
  const mapRef = useRef<MapView>(null);

  const handleMarkerPress = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        300
      );
    }
  };

  const handlePharmacyPress = (pharmacy: Pharmacy) => {
    navigation.navigate('PharmacyDetail', { pharmacyId: pharmacy.id });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        provider={PROVIDER_GOOGLE}
      >
        {pharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy.id}
            coordinate={{
              latitude: pharmacy.latitude,
              longitude: pharmacy.longitude,
            }}
            onPress={() => handleMarkerPress(pharmacy)}
          >
            <View style={[styles.markerContainer, selectedPharmacy?.id === pharmacy.id && styles.markerSelected]}>
              <Ionicons name="medical-outline" size={20} color="#fff" />
            </View>

            <Callout style={styles.callout} onPress={() => handlePharmacyPress(pharmacy)}>
              <View style={styles.calloutContent}>
                <Text style={styles.calloutTitle}>{pharmacy.name}</Text>
                <Text style={styles.calloutSubtitle}>{pharmacy.distance?.toFixed(1)} km away</Text>
                <View style={styles.calloutButton}>
                  <Text style={styles.calloutButtonText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={14} color="#2196F3" />
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Bottom Info Panel */}
      {selectedPharmacy && (
        <View style={styles.infoPanel}>
          <View style={styles.infoPanelHeader}>
            <View style={styles.infoPanelContent}>
              <Text style={styles.infoPanelTitle}>{selectedPharmacy.name}</Text>
              <Text style={styles.infoPanelSubtitle}>{selectedPharmacy.distance?.toFixed(1)} km away</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPharmacy(null)}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.infoPanelAddress}>{selectedPharmacy.address}</Text>

          <View style={styles.infoPanelActions}>
            <TouchableOpacity style={styles.infoPanelButton}>
              <Ionicons name="call-outline" size={18} color="#2196F3" />
              <Text style={styles.infoPanelButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoPanelButton}>
              <Ionicons name="navigate-outline" size={18} color="#4CAF50" />
              <Text style={styles.infoPanelButtonText}>Navigate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoPanelButton}
              onPress={() => handlePharmacyPress(selectedPharmacy)}
            >
              <Ionicons name="information-circle-outline" size={18} color="#FF9800" />
              <Text style={styles.infoPanelButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Map Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (mapRef.current) {
              mapRef.current.animateToRegion(DEFAULT_REGION, 300);
            }
            setSelectedPharmacy(null);
          }}
        >
          <Ionicons name="locate" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Pharmacy List Toggle */}
      <TouchableOpacity
        style={styles.listButton}
        onPress={() => navigation.navigate('PharmacyList')}
      >
        <Ionicons name="list" size={20} color="#fff" />
        <Text style={styles.listButtonText}>List View</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  markerSelected: {
    backgroundColor: '#1565C0',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  callout: {
    width: 200,
  },
  calloutContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  calloutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    gap: 4,
  },
  calloutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 10,
  },
  infoPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoPanelContent: {
    flex: 1,
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoPanelSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  infoPanelAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 16,
  },
  infoPanelActions: {
    flexDirection: 'row',
    gap: 12,
  },
  infoPanelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 6,
  },
  infoPanelButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  controls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  listButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  listButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
