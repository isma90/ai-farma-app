import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MedicationStackParamList } from '../../navigation/AppNavigator';
import { authService } from '../../services/AuthService';
import { medicationService, IMedication } from '../../services/MedicationService';
import MedicationCard from '../../components/MedicationCard';

type Props = NativeStackScreenProps<MedicationStackParamList, 'MedicationList'>;

/**
 * MedicationScreen: Display and manage user medications
 * - FlatList of medications
 * - MedicationCard component for each medication
 * - FAB button to add new medication
 * - Edit/delete handlers
 * - Loading and empty states
 */
export default function MedicationScreen({ navigation }: Props) {
  const [medications, setMedications] = useState<IMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserId(user.uid);
      loadMedications(user.uid);
    }
  }, []);

  // Reload medications when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadMedications(userId);
      }
    }, [userId])
  );

  const loadMedications = async (uid: string) => {
    try {
      setLoading(true);
      setError('');
      await medicationService.initialize(uid);
      const meds = await medicationService.getMedications(uid);
      setMedications(meds);
    } catch (err: any) {
      console.error('[MedicationScreen] Load error:', err);
      setError(err.message || 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    if (userId) {
      setRefreshing(true);
      try {
        await loadMedications(userId);
      } finally {
        setRefreshing(false);
      }
    }
  }, [userId]);

  const handleAddMedication = () => {
    navigation.navigate('AddMedication');
  };

  const handleEditMedication = (medication: IMedication) => {
    navigation.navigate('AddMedication', { medicationId: medication.id });
  };

  const handleDeleteMedication = (medicationId: string) => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await medicationService.deleteMedication(userId, medicationId);
              setMedications((prev) => prev.filter((m) => m.id !== medicationId));
            } catch (err: any) {
              console.error('[MedicationScreen] Delete error:', err);
              Alert.alert('Error', err.message || 'Failed to delete medication');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handlePressCard = (medication: IMedication) => {
    navigation.navigate('MedicationDetail', { medicationId: medication.id });
  };

  const renderMedication = useCallback(
    ({ item }: { item: IMedication }) => (
      <MedicationCard
        medication={item}
        onPress={handlePressCard}
        onEdit={handleEditMedication}
        onDelete={handleDeleteMedication}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: IMedication) => item.id, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
        <Text style={styles.errorTitle}>Error Loading Medications</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadMedications(userId)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {medications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="medical-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Medications</Text>
          <Text style={styles.emptyText}>Add your first medication to get started</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMedication}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Medication</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={medications}
          renderItem={renderMedication}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerText}>Your Medications ({medications.length})</Text>
            </View>
          }
        />
      )}

      {/* FAB Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddMedication}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
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
  addButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f44336',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
});
