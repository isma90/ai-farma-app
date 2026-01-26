import React from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';

export const PharmacyListScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Farmacias Cercanas</Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🏥</Text>
        <Text style={styles.emptyTitle}>Cargando farmacias...</Text>
        <Text style={styles.emptyText}>Permite acceso a tu ubicación para ver farmacias cercanas</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
