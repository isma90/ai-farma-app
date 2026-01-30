import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';

interface Pharmacy {
  id: string;
  nombre: string;
  direccion: string;
  distancia: number;
  isTurno: boolean;
}

export default function PharmacyListScreen() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    setLoading(true);
    try {
      // Placeholder - implementar llamada a servicio real
      setPharmacies([]);
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPharmacy = ({ item }: { item: Pharmacy }) => (
    <View style={styles.pharmacyItem}>
      <View style={styles.pharmacyContent}>
        <Text style={styles.name}>{item.nombre}</Text>
        <Text style={styles.address}>{item.direccion}</Text>
        <Text style={styles.distance}>{item.distancia.toFixed(1)} km</Text>
        {item.isTurno && <Text style={styles.turno}>📍 24h</Text>}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {pharmacies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sin farmacias cercanas</Text>
          <Text style={styles.emptyText}>Habilita ubicación para ver farmacias</Text>
        </View>
      ) : (
        <FlatList
          data={pharmacies}
          keyExtractor={(item) => item.id}
          renderItem={renderPharmacy}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pharmacyItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
  },
  pharmacyContent: {
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  address: {
    fontSize: 13,
    color: '#666666',
  },
  distance: {
    fontSize: 12,
    color: '#999999',
  },
  turno: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
  },
});
