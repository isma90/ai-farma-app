import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MedicationStackParamList } from '../../navigation/AppNavigator';
import { authService } from '../../services/AuthService';
import { medicationService, IMedication } from '../../services/MedicationService';

type Props = NativeStackScreenProps<MedicationStackParamList, 'MedicationDetail'>;

/**
 * MedicationDetailScreen: Display full medication information
 * - Show all medication details
 * - Edit/delete buttons
 * - Dosage times
 * - Active status
 */
export default function MedicationDetailScreen({ route, navigation }: Props) {
  const [medication, setMedication] = useState<IMedication | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserId(user.uid);
      loadMedication(user.uid, route.params.medicationId);
    }
  }, []);

  const loadMedication = async (uid: string, medId: string) => {
    try {
      setLoading(true);
      await medicationService.initialize(uid);
      const med = await medicationService.getMedicationById(uid, medId);
      setMedication(med);

      if (med) {
        navigation.setOptions({
          headerTitle: med.name,
        });
      }
    } catch (err: any) {
      console.error('[MedicationDetailScreen] Load error:', err);
      Alert.alert('Error', 'Failed to load medication');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (medication) {
      navigation.navigate('AddMedication', { medicationId: medication.id });
    }
  };

  const handleDelete = () => {
    if (!medication) return;

    Alert.alert('Delete Medication', 'Are you sure you want to delete this medication?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await medicationService.deleteMedication(userId, medication.id);
            navigation.goBack();
          } catch (err: any) {
            console.error('[MedicationDetailScreen] Delete error:', err);
            Alert.alert('Error', err.message || 'Failed to delete medication');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!medication) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
        <Text style={styles.errorText}>Medication not found</Text>
      </View>
    );
  }

  // Determine if medication is active today
  const today = new Date().toISOString().split('T')[0];
  const startDate = medication.startDate.split('T')[0];
  const endDate = medication.endDate?.split('T')[0];
  const isActive = startDate <= today && (!endDate || endDate >= today);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          {isActive && (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.activeBadgeText}>Active Today</Text>
            </View>
          )}
        </View>
      </View>

      {/* Details Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="flask-outline" size={20} color="#2196F3" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Dosage</Text>
            <Text style={styles.detailValue}>{medication.dosage}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="time-outline" size={20} color="#2196F3" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Frequency</Text>
            <Text style={styles.detailValue}>{medication.frequency}</Text>
          </View>
        </View>

        {medication.times && medication.times.length > 0 && (
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="alarm-outline" size={20} color="#2196F3" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Dosage Times</Text>
              <View style={styles.timesList}>
                {medication.times.map((time, index) => (
                  <View key={index} style={styles.timeTag}>
                    <Text style={styles.timeTagText}>{time}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="calendar-outline" size={20} color="#2196F3" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Start Date</Text>
            <Text style={styles.detailValue}>
              {new Date(medication.startDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {medication.endDate && (
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color="#2196F3" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>End Date</Text>
              <Text style={styles.detailValue}>
                {new Date(medication.endDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {medication.notes && (
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="document-text-outline" size={20} color="#2196F3" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{medication.notes}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Created/Updated Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>
            {new Date(medication.createdAt).toLocaleDateString()} at{' '}
            {new Date(medication.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>
            {new Date(medication.updatedAt).toLocaleDateString()} at{' '}
            {new Date(medication.updatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
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
  headerSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  medicationName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginTop: 12,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  timeTag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  infoRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: '#666',
  },
  spacer: {
    height: 80,
  },
});
