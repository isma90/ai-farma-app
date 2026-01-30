import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MedicationStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<MedicationStackParamList, 'MedicationDetail'>;

export default function MedicationDetailScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication Detail</Text>
      <Text style={styles.placeholder}>ID: {route.params.medicationId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold' },
  placeholder: { fontSize: 14, color: '#999', marginTop: 12 },
});
