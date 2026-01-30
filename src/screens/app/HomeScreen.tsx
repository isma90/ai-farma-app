import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { authService } from '../../services/AuthService';
import { medicationService, IMedication } from '../../services/MedicationService';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

/**
 * HomeScreen: Dashboard showing today's medications and quick stats
 * - Display today's active medications
 * - Show medication count statistics
 * - Quick action buttons
 */
export default function HomeScreen({ navigation }: Props) {
  const [todaysMedications, setTodaysMedications] = useState<IMedication[]>([]);
  const [totalMedications, setTotalMedications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserId(user.uid);
      loadData(user.uid);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadData(userId);
      }
    }, [userId])
  );

  const loadData = async (uid: string) => {
    try {
      setLoading(true);
      await medicationService.initialize(uid);
      const all = await medicationService.getMedications(uid);
      const todays = await medicationService.getTodaysMedications(uid);
      setTotalMedications(all.length);
      setTodaysMedications(todays);
    } catch (err) {
      console.error('[HomeScreen] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationsPress = () => {
    navigation.getParent()?.navigate('MedicationStack');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Good Day!</Text>
        <Text style={styles.welcomeSubtitle}>Here's your medication overview</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="medical-outline" size={28} color="#2196F3" />
          </View>
          <Text style={styles.statValue}>{totalMedications}</Text>
          <Text style={styles.statLabel}>Medications</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="time-outline" size={28} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>{todaysMedications.length}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#FF9800" />
          </View>
          <Text style={styles.statValue}>0%</Text>
          <Text style={styles.statLabel}>Adherence</Text>
        </View>
      </View>

      {/* Today's Medications Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Medications</Text>
          {todaysMedications.length > 0 && (
            <TouchableOpacity onPress={handleMedicationsPress}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {todaysMedications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No medications today!</Text>
            <Text style={styles.emptySubtext}>You're all set</Text>
          </View>
        ) : (
          <View style={styles.medicationsList}>
            {todaysMedications.slice(0, 3).map((med) => (
              <View key={med.id} style={styles.medicationItem}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <Text style={styles.medicationDosage}>{med.dosage}</Text>
                  <Text style={styles.medicationFrequency}>
                    <Ionicons name="time-outline" size={12} color="#666" /> {med.frequency}
                  </Text>
                </View>
                <View style={styles.medicationCheckbox}>
                  <TouchableOpacity style={styles.checkbox}>
                    <Ionicons name="ellipse-outline" size={24} color="#2196F3" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleMedicationsPress}>
          <View style={styles.actionIcon}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Add Medication</Text>
            <Text style={styles.actionSubtitle}>Create a new medication record</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIcon} style={{ backgroundColor: '#4CAF50' }}>
            <Ionicons name="map-outline" size={24} color="#fff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Find Pharmacy</Text>
            <Text style={styles.actionSubtitle}>Locate nearby pharmacies</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIcon} style={{ backgroundColor: '#FF9800' }}>
            <Ionicons name="chatbubble-outline" size={24} color="#fff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>AI Assistant</Text>
            <Text style={styles.actionSubtitle}>Ask about medications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
        <Text style={styles.infoText}>
          Keep your medication list updated to receive accurate reminders and recommendations
        </Text>
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
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  viewAll: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  medicationsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  medicationDosage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  medicationFrequency: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  medicationCheckbox: {
    marginLeft: 12,
  },
  checkbox: {
    padding: 4,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  infoSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1565C0',
    flex: 1,
    lineHeight: 16,
  },
  spacer: {
    height: 20,
  },
});
