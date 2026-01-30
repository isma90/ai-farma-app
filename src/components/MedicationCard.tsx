import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IMedication } from '../services/MedicationService';

interface MedicationCardProps {
  medication: IMedication;
  onPress?: (medication: IMedication) => void;
  onEdit?: (medication: IMedication) => void;
  onDelete?: (medicationId: string) => void;
}

/**
 * MedicationCard: Displays a single medication in list
 * Shows medication name, dosage, frequency, and action buttons
 */
export default function MedicationCard({ medication, onPress, onEdit, onDelete }: MedicationCardProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(medication);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(medication.id);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(medication);
    }
  };

  // Check if medication is active today
  const today = new Date().toISOString().split('T')[0];
  const startDate = medication.startDate.split('T')[0];
  const endDate = medication.endDate?.split('T')[0];
  const isActive = startDate <= today && (!endDate || endDate >= today);

  return (
    <TouchableOpacity style={[styles.card, !isActive && styles.inactiveCard]} onPress={handlePress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{medication.name}</Text>
          {isActive && <View style={styles.activeBadge} />}
        </View>

        <Text style={styles.dosage}>{medication.dosage}</Text>

        <View style={styles.frequencyRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.frequency}>{medication.frequency}</Text>
        </View>

        {medication.notes && <Text style={styles.notes}>{medication.notes}</Text>}

        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>
            Started: {new Date(medication.startDate).toLocaleDateString()}
          </Text>
          {medication.endDate && (
            <Text style={styles.dateText}>
              Ends: {new Date(medication.endDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
          <Ionicons name="pencil" size={18} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color="#f44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  activeBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  dosage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  frequency: {
    fontSize: 13,
    color: '#666',
  },
  notes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  dateInfo: {
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
  },
});
