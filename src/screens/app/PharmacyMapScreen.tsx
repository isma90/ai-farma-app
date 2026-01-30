import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PharmacyMapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map</Text>
      <Text style={styles.placeholder}>Pharmacy Map - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold' },
  placeholder: { fontSize: 14, color: '#999', marginTop: 12 },
});
