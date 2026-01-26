import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IMedicationSchedule } from '@types/index';
import { COLORS } from '@constants/app';
import { formatDateForDisplay } from '@utils/dateUtils';

interface MedicationCardProps {
  medication: IMedicationSchedule;
  onPress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  showEndDate?: boolean;
}

export const MedicationCard = ({
  medication,
  onPress,
  onEditPress,
  onDeletePress,
  showEndDate = true,
}: MedicationCardProps) => {
  const isActive = medication.endDate
    ? new Date() <= new Date(medication.endDate)
    : true;

  const frequencyLabel = {
    once: '1 vez al día',
    twice: '2 veces al día',
    thrice: '3 veces al día',
    custom: `${medication.times.length} veces`,
  }[medication.frequency];

  return (
    <TouchableOpacity
      style={[styles.container, !isActive && styles.containerInactive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {medication.medicationName}
          </Text>
          {!isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Finalizado</Text>
            </View>
          )}
        </View>

        <Text style={styles.dosage}>Dosis: {medication.dosage}</Text>

        <View style={styles.detailsRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={COLORS.LIGHT_GRAY}
          />
          <Text style={styles.detail}>{frequencyLabel}</Text>
        </View>

        <View style={styles.detailsRow}>
          <MaterialCommunityIcons
            name="calendar"
            size={16}
            color={COLORS.LIGHT_GRAY}
          />
          <Text style={styles.detail}>
            Desde {formatDateForDisplay(new Date(medication.startDate))}
          </Text>
        </View>

        {showEndDate && medication.endDate && (
          <View style={styles.detailsRow}>
            <MaterialCommunityIcons
              name="calendar-end"
              size={16}
              color={COLORS.LIGHT_GRAY}
            />
            <Text style={styles.detail}>
              Hasta {formatDateForDisplay(new Date(medication.endDate))}
            </Text>
          </View>
        )}

        {medication.mealRequirement && medication.mealRequirement !== 'any' && (
          <View style={styles.mealRequirement}>
            <Text style={styles.mealRequirementText}>
              {medication.mealRequirement === 'fasting' ? '⊘ En ayunas' : '🍽️ Con comida'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {onEditPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEditPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={20}
              color={COLORS.PRIMARY}
            />
          </TouchableOpacity>
        )}
        {onDeletePress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDeletePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={COLORS.ERROR}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  containerInactive: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.DARK_GRAY,
    flex: 1,
  },
  inactiveBadge: {
    backgroundColor: COLORS.WARNING,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginLeft: 6,
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  dosage: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: '600',
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detail: {
    fontSize: 12,
    color: COLORS.MEDIUM_GRAY,
    marginLeft: 6,
  },
  mealRequirement: {
    marginTop: 6,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  mealRequirementText: {
    fontSize: 11,
    color: COLORS.MEDIUM_GRAY,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
});
