import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { medicationService } from '@services/MedicationService';
import { notificationService } from '@services/NotificationService';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { IMedicationSchedule, IAdherenceRecord } from '@types/index';
import { COLORS } from '@constants/app';
import { LoadingState } from '@components/LoadingState';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  adherence?: IAdherenceRecord;
}

export const MedicationDetailScreen = ({ route, navigation }: any) => {
  const { medicationId } = route.params;
  const { user } = useSelector((state: RootState) => state.auth);

  const [medication, setMedication] = useState<IMedicationSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      loadMedication();
    }, [medicationId, user])
  );

  const loadMedication = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const med = await medicationService.getMedicationById(user.uid, medicationId);
      if (med) {
        setMedication(med);
      }
    } catch (error) {
      console.error('Failed to load medication:', error);
      Alert.alert('Error', 'No se pudo cargar el medicamento');
    } finally {
      setIsLoading(false);
    }
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const adherance = medication?.adherenceHistory.find(
        (record) =>
          new Date(record.date).toDateString() === currentDate.toDateString()
      );

      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        adherence: adherance,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const handleMarkTaken = async (date: Date) => {
    if (!medication || !user) return;

    try {
      const recordIndex = medication.adherenceHistory.findIndex(
        (record) =>
          new Date(record.date).toDateString() === date.toDateString()
      );

      let updatedHistory = [...medication.adherenceHistory];

      if (recordIndex >= 0) {
        updatedHistory[recordIndex] = {
          ...updatedHistory[recordIndex],
          taken: !updatedHistory[recordIndex].taken,
          takenAt: !updatedHistory[recordIndex].taken ? new Date() : undefined,
        };
      } else {
        updatedHistory.push({
          date,
          taken: true,
          takenAt: new Date(),
        });
      }

      const updatedMedication = { ...medication, adherenceHistory: updatedHistory };
      await medicationService.updateMedication(user.uid, medication.id, updatedMedication);
      setMedication(updatedMedication);
    } catch (error) {
      console.error('Failed to update adherence:', error);
      Alert.alert('Error', 'No se pudo actualizar el registro');
    }
  };

  const calculateAdherencePercentage = () => {
    if (!medication || medication.adherenceHistory.length === 0) return 0;

    const taken = medication.adherenceHistory.filter((record) => record.taken).length;
    return Math.round((taken / medication.adherenceHistory.length) * 100);
  };

  const calendarDays = getCalendarDays();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];

  if (isLoading) {
    return <LoadingState message="Cargando detalles..." />;
  }

  if (!medication) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Medicamento no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Medication Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.medicationName}>{medication.medicationName}</Text>
          <Text style={styles.dosage}>{medication.dosage}</Text>
        </View>
        <View style={styles.statusBadge}>
          <MaterialCommunityIcons name="pill" size={24} color={COLORS.PRIMARY} />
        </View>
      </View>

      {/* Schedule Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Frecuencia</Text>
          <Text style={styles.infoValue}>
            {medication.frequency === 'once'
              ? '1 vez al día'
              : medication.frequency === 'twice'
              ? '2 veces al día'
              : medication.frequency === 'thrice'
              ? '3 veces al día'
              : 'Personalizado'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Horarios</Text>
          <Text style={styles.infoValue}>{medication.times.join(', ')}</Text>
        </View>

        {medication.mealRequirement && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Con comida</Text>
            <Text style={styles.infoValue}>
              {medication.mealRequirement === 'fasting'
                ? 'En ayunas'
                : medication.mealRequirement === 'with-food'
                ? 'Con comida'
                : 'Cualquiera'}
            </Text>
          </View>
        )}

        {medication.notes && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Notas</Text>
            <Text style={styles.infoValue}>{medication.notes}</Text>
          </View>
        )}
      </View>

      {/* Adherence Stats */}
      <View style={styles.adherenceStats}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{calculateAdherencePercentage()}%</Text>
          <Text style={styles.statLabel}>Adherencia</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{medication.adherenceHistory.filter((r) => r.taken).length}</Text>
          <Text style={styles.statLabel}>Tomadas</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{medication.adherenceHistory.filter((r) => !r.taken).length}</Text>
          <Text style={styles.statLabel}>Omitidas</Text>
        </View>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.monthYear}>
            {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Week Days */}
        <View style={styles.weekDaysRow}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            const isToday = day.date.toDateString() === new Date().toDateString();
            const isTaken = day.adherence?.taken ?? false;
            const isSkipped = day.adherence && !day.adherence.taken;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.dayCellOtherMonth,
                  isToday && styles.dayCellToday,
                  isTaken && styles.dayCellTaken,
                  isSkipped && styles.dayCellSkipped,
                ]}
                onPress={() => handleMarkTaken(day.date)}
              >
                <Text
                  style={[
                    styles.dayText,
                    !day.isCurrentMonth && styles.dayTextOtherMonth,
                    (isTaken || isSkipped) && styles.dayTextHighlight,
                  ]}
                >
                  {day.date.getDate()}
                </Text>
                {isTaken && <View style={styles.takenIndicator} />}
                {isSkipped && <View style={styles.skippedIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.SUCCESS }]} />
            <Text style={styles.legendText}>Tomada</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.ERROR }]} />
            <Text style={styles.legendText}>Omitida</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() =>
            navigation.navigate('AddMedication', {
              editingMedication: medication,
              isEditing: true,
            })
          }
        >
          <MaterialCommunityIcons name="pencil" size={20} color={COLORS.WHITE} />
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => {
            Alert.alert(
              'Eliminar medicamento',
              `¿Deseas eliminar "${medication.medicationName}"?`,
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar',
                  onPress: async () => {
                    try {
                      if (user) {
                        await medicationService.deleteMedication(user.uid, medication.id);
                        await notificationService.cancelReminder(medication.id);
                        navigation.goBack();
                      }
                    } catch (error) {
                      console.error('Failed to delete:', error);
                      Alert.alert('Error', 'No se pudo eliminar el medicamento');
                    }
                  },
                  style: 'destructive',
                },
              ]
            );
          }}
        >
          <MaterialCommunityIcons name="trash-can" size={20} color={COLORS.WHITE} />
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  errorText: {
    color: COLORS.ERROR,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_GRAY,
  },
  medicationName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.DARK_GRAY,
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    color: COLORS.MEDIUM_GRAY,
  },
  statusBadge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 50,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.WHITE,
    margin: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_GRAY,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.MEDIUM_GRAY,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.DARK_GRAY,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  adherenceStats: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginVertical: 8,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.MEDIUM_GRAY,
    fontWeight: '500',
  },
  calendarContainer: {
    backgroundColor: COLORS.WHITE,
    margin: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.DARK_GRAY,
    textTransform: 'capitalize',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.MEDIUM_GRAY,
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    position: 'relative',
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  dayCellTaken: {
    backgroundColor: COLORS.SUCCESS,
  },
  dayCellSkipped: {
    backgroundColor: COLORS.ERROR,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.DARK_GRAY,
  },
  dayTextOtherMonth: {
    color: COLORS.LIGHT_GRAY,
  },
  dayTextHighlight: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  takenIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.SUCCESS,
    position: 'absolute',
    bottom: 2,
  },
  skippedIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.ERROR,
    position: 'absolute',
    bottom: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_GRAY,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.MEDIUM_GRAY,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 24,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  deleteButton: {
    backgroundColor: COLORS.ERROR,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 14,
  },
});
