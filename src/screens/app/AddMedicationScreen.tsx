import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { medicationService } from '@services/MedicationService';
import { notificationService } from '@services/NotificationService';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { COLORS, MEDICATION_FREQUENCIES, MEAL_REQUIREMENTS } from '@constants/app';
import { formatTime } from '@utils/dateUtils';
import { v4 as uuid } from 'uuid';

export const AddMedicationScreen = ({ navigation, route }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const editingMedication = route?.params?.editingMedication;
  const isEditing = route?.params?.isEditing ?? false;

  const [name, setName] = useState(editingMedication?.medicationName || '');
  const [dosage, setDosage] = useState(editingMedication?.dosage || '');
  const [frequency, setFrequency] = useState<'once' | 'twice' | 'thrice' | 'custom'>(editingMedication?.frequency || 'once');
  const [times, setTimes] = useState(editingMedication?.times || ['08:00']);
  const [mealRequirement, setMealRequirement] = useState<'fasting' | 'with-food' | 'any'>(editingMedication?.mealRequirement || 'any');
  const [startDate, setStartDate] = useState(editingMedication ? new Date(editingMedication.startDate) : new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(editingMedication && editingMedication.endDate ? new Date(editingMedication.endDate) : undefined);
  const [notes, setNotes] = useState(editingMedication?.notes || '');
  const [isLoading, setIsLoading] = useState(false);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeEditIndex, setTimeEditIndex] = useState(0);

  useEffect(() => {
    if (isEditing) {
      navigation.setOptions({ title: 'Editar Medicina' });
    } else {
      navigation.setOptions({ title: 'Agregar Medicina' });
    }
  }, [isEditing, navigation]);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const newTimes = [...times];
      newTimes[timeEditIndex] = formatTime(hours, minutes);
      setTimes(newTimes);
    }
  };

  const handleFrequencyChange = (freq: typeof frequency) => {
    setFrequency(freq);
    if (freq === 'once') {
      setTimes(['08:00']);
    } else if (freq === 'twice') {
      setTimes(['08:00', '20:00']);
    } else if (freq === 'thrice') {
      setTimes(['08:00', '14:00', '20:00']);
    }
  };

  const handleAddTime = () => {
    setTimes([...times, '12:00']);
  };

  const handleRemoveTime = (index: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del medicamento');
      return false;
    }
    if (!dosage.trim()) {
      Alert.alert('Error', 'Ingresa la dosis');
      return false;
    }
    if (times.length === 0) {
      Alert.alert('Error', 'Agrega al menos un horario');
      return false;
    }
    if (endDate && endDate < startDate) {
      Alert.alert('Error', 'La fecha de finalización debe ser posterior a la de inicio');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    setIsLoading(true);
    try {
      if (isEditing && editingMedication) {
        // Update existing medication
        const updatedMedication = {
          ...editingMedication,
          medicationName: name,
          dosage,
          frequency,
          times,
          mealRequirement,
          startDate,
          endDate,
          notes,
          updatedAt: new Date(),
        };
        await medicationService.updateMedication(user.uid, editingMedication.id, updatedMedication);

        // Cancel old reminder and schedule new one
        await notificationService.cancelReminder(editingMedication.id);
        await notificationService.scheduleReminder(updatedMedication, 15);

        Alert.alert('Éxito', 'Medicamento actualizado correctamente', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // Create new medication
        const medication = await medicationService.createMedication(user.uid, {
          medicationName: name,
          dosage,
          frequency,
          times,
          mealRequirement,
          startDate,
          endDate,
          notes,
          userId: user.uid,
          adherenceHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Schedule reminders
        await notificationService.scheduleReminder(medication, 15);

        Alert.alert('Éxito', 'Medicamento agregado correctamente', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to save medication:', error);
      Alert.alert('Error', 'No se pudo guardar el medicamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Name */}
      <View style={styles.section}>
        <Text style={styles.label}>Nombre del medicamento *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Paracetamol"
          value={name}
          onChangeText={setName}
          editable={!isLoading}
        />
      </View>

      {/* Dosage */}
      <View style={styles.section}>
        <Text style={styles.label}>Dosis *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 500mg"
          value={dosage}
          onChangeText={setDosage}
          editable={!isLoading}
        />
      </View>

      {/* Frequency */}
      <View style={styles.section}>
        <Text style={styles.label}>Frecuencia *</Text>
        <View style={styles.buttonGroup}>
          {(
            ['once', 'twice', 'thrice', 'custom'] as const
          ).map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.frequencyButton,
                frequency === freq && styles.frequencyButtonActive,
              ]}
              onPress={() => handleFrequencyChange(freq)}
            >
              <Text
                style={[
                  styles.frequencyButtonText,
                  frequency === freq && styles.frequencyButtonTextActive,
                ]}
              >
                {freq === 'once'
                  ? '1x'
                  : freq === 'twice'
                  ? '2x'
                  : freq === 'thrice'
                  ? '3x'
                  : 'Custom'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Times */}
      <View style={styles.section}>
        <Text style={styles.label}>Horarios *</Text>
        {times.map((time, index) => (
          <View key={index} style={styles.timeRow}>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => {
                setTimeEditIndex(index);
                setShowTimePicker(true);
              }}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color={COLORS.PRIMARY}
              />
              <Text style={styles.timeText}>{time}</Text>
            </TouchableOpacity>
            {times.length > 1 && (
              <TouchableOpacity
                onPress={() => handleRemoveTime(index)}
                style={styles.removeButton}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color={COLORS.ERROR}
                />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {frequency === 'custom' && (
          <TouchableOpacity
            style={styles.addTimeButton}
            onPress={handleAddTime}
          >
            <MaterialCommunityIcons name="plus" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.addTimeButtonText}>Agregar horario</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Meal Requirement */}
      <View style={styles.section}>
        <Text style={styles.label}>Requisito de comida</Text>
        <View style={styles.buttonGroup}>
          {(['fasting', 'with-food', 'any'] as const).map((req) => (
            <TouchableOpacity
              key={req}
              style={[
                styles.mealButton,
                mealRequirement === req && styles.mealButtonActive,
              ]}
              onPress={() => setMealRequirement(req)}
            >
              <Text
                style={[
                  styles.mealButtonText,
                  mealRequirement === req && styles.mealButtonTextActive,
                ]}
              >
                {req === 'fasting' ? 'En ayunas' : req === 'with-food' ? 'Con comida' : 'Cualquiera'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Start Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Fecha de inicio *</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowStartDatePicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>

      {/* End Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Fecha de finalización (opcional)</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowEndDatePicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.dateText}>
            {endDate ? endDate.toLocaleDateString() : 'Sin fecha de fin'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.label}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Ej: Tomar después de comer"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          editable={!isLoading}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${times[timeEditIndex]}:00`)}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.DARK_GRAY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.DARK_GRAY,
  },
  notesInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  frequencyButton: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.MEDIUM_GRAY,
  },
  frequencyButtonTextActive: {
    color: COLORS.WHITE,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.DARK_GRAY,
    marginLeft: 8,
  },
  removeButton: {
    marginLeft: 8,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addTimeButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
    marginLeft: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.DARK_GRAY,
    marginLeft: 8,
  },
  mealButton: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  mealButtonActive: {
    backgroundColor: COLORS.SUCCESS,
    borderColor: COLORS.SUCCESS,
  },
  mealButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.MEDIUM_GRAY,
  },
  mealButtonTextActive: {
    color: COLORS.WHITE,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
  },
  cancelButtonText: {
    color: COLORS.DARK_GRAY,
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
