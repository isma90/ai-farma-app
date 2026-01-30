import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PharmacyStackParamList } from '../../navigation/AppNavigator';
import { pharmacyService, Pharmacy } from '../../services/PharmacyService';

type Props = NativeStackScreenProps<PharmacyStackParamList, 'PharmacyList'>;

// Mock pharmacy data for demo purposes
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

/**
 * PharmacyListScreen: Display nearby pharmacies
 * - Search/filter pharmacies
 * - Show distance and hours
 * - Navigate to map or detail
 */
export default function PharmacyListScreen({ navigation }: Props) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(MOCK_PHARMACIES);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>(MOCK_PHARMACIES);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadPharmacies();
    }, [])
  );

  const loadPharmacies = async () => {
    try {
      setLoading(true);
      // For now, using mock data. Replace with real API call later
      // const nearby = await pharmacyService.searchPharmacies(lat, lon);
      setPharmacies(MOCK_PHARMACIES);
      setFilteredPharmacies(MOCK_PHARMACIES);
    } catch (err: any) {
      console.error('[PharmacyListScreen] Load error:', err);
      Alert.alert('Error', 'Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPharmacies();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredPharmacies(pharmacies);
    } else {
      const filtered = pharmacies.filter(
        (pharmacy) =>
          pharmacy.name.toLowerCase().includes(text.toLowerCase()) ||
          pharmacy.address.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPharmacies(filtered);
    }
  };

  const handlePharmacyPress = (pharmacy: Pharmacy) => {
    navigation.navigate('PharmacyDetail', { pharmacyId: pharmacy.id });
  };

  const handleMapPress = () => {
    navigation.navigate('PharmacyMap');
  };

  const renderPharmacy = useCallback(({ item }: { item: Pharmacy }) => (
    <TouchableOpacity
      style={styles.pharmacyCard}
      onPress={() => handlePharmacyPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.pharmacyHeader}>
        <View style={styles.pharmacyInfo}>
          <Text style={styles.pharmacyName}>{item.name}</Text>
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.distanceText}>{item.distance?.toFixed(1)} km away</Text>
          </View>
        </View>
        <View style={styles.openBadge}>
          <Text style={styles.openText}>Open</Text>
        </View>
      </View>

      <View style={styles.addressRow}>
        <Ionicons name="home-outline" size={16} color="#999" />
        <Text style={styles.addressText}>{item.address}</Text>
      </View>

      {item.phone && (
        <View style={styles.phoneRow}>
          <Ionicons name="call-outline" size={16} color="#999" />
          <Text style={styles.phoneText}>{item.phone}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.detailButton}>
        <Text style={styles.detailButtonText}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color="#2196F3" />
      </TouchableOpacity>
    </TouchableOpacity>
  ), []);

  const keyExtractor = useCallback((item: Pharmacy) => item.id, []);

  if (loading && pharmacies.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pharmacies..."
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Map Button */}
      <TouchableOpacity style={styles.mapButton} onPress={handleMapPress}>
        <Ionicons name="map-outline" size={18} color="#fff" />
        <Text style={styles.mapButtonText}>View Map</Text>
      </TouchableOpacity>

      {/* Pharmacies List */}
      {filteredPharmacies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No pharmacies found</Text>
          <Text style={styles.emptyText}>Try adjusting your search or enable location</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPharmacies}
          renderItem={renderPharmacy}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerText}>
                {filteredPharmacies.length} pharmacies nearby
              </Text>
            </View>
          }
        />
      )}
    </View>
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
  searchContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
    color: '#333',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    justifyContent: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  pharmacyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
  },
  openBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  openText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  phoneText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  detailButtonText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
});
