import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useUserLocation } from '@hooks/useUserLocation';

export const PharmacyMapScreen = () => {
  const { location, isLoading, error } = useUserLocation();
  const [pharmaciesCount, setPharmaciesCount] = useState(0);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location ? (
        <View style={styles.content}>
          <Text style={styles.title}>Mapa de Farmacias</Text>
          <Text style={styles.info}>
            Tu ubicación: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
          <Text style={styles.placeholder}>
            [Mapa interactivo con marcadores de farmacias]
          </Text>
          <Text style={styles.pharmacyCount}>Farmacias cercanas: {pharmaciesCount}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.errorText}>No se pudo obtener la ubicación</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  placeholder: {
    backgroundColor: '#ddd',
    height: 300,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    color: '#999',
  },
  pharmacyCount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
});
