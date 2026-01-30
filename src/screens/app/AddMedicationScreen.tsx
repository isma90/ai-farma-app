import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MedicationStackParamList } from '../../navigation/AppNavigator';
import { authService } from '../../services/AuthService';
import { medicationService, IMedication } from '../../services/MedicationService';

type Props = NativeStackScreenProps<MedicationStackParamList, 'AddMedication'>;

const FREQUENCY_OPTIONS = ['once', 'twice', 'thrice', 'every 6h', 'every 8h', 'every 12h'];

/**
 * AddMedicationScreen: Create or edit a medication
 * - Form inputs for medication details
 * - Date pickers for start/end dates
 * - Time pickers for dosage times
 * - Frequency selector
 * - Save/cancel buttons
 */
export default function AddMedicationScreen({ navigation, route }: Props) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [medicationId, setMedicationId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Date/time picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserId(user.uid);

      // If editing, load medication data
      if (route.params?.medicationId) {
        loadMedicationData(user.uid, route.params.medicationId);
      }
    }
  }, []);

  const loadMedicationData = async (uid: string, medId: string) => {
    try {
      setLoading(true);
      await medicationService.initialize(uid);
      const med = await medicationService.getMedicationById(uid, medId);

      if (med) {
        setMedicationId(med.id);
        setName(med.name);
        setDosage(med.dosage);
        setFrequency(med.frequency);
        setNotes(med.notes || '');
        setStartDate(new Date(med.startDate));
        if (med.endDate) {
          setEndDate(new Date(med.endDate));
        }
        setTimes(med.times || ['08:00']);
        setIsEditing(true);
        navigation.setOptions({ headerTitle: 'Edit Medication' });
      }
    } catch (err: any) {
      console.error('[AddMedicationScreen] Load error:', err);
      Alert.alert('Error', 'Failed to load medication');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate && event.type !== 'dismissed') {
      setStartDate(selectedDate);
      if (Platform.OS === 'android') {
        // On Android, picker closes after selection
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate && event.type !== 'dismissed') {
      setEndDate(selectedDate);
      if (Platform.OS === 'android') {
        // On Android, picker closes after selection
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime && event.type !== 'dismissed') {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      const newTimes = [...times];
      newTimes[selectedTimeIndex] = timeString;
      setTimes(newTimes);
    }
  };

  const addTimeSlot = () => {
    setTimes([...times, '12:00']);
  };

  const removeTimeSlot = (index: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Medication name is required');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Error', 'Dosage is required');
      return;
    }

    try {
      setLoading(true);
      const medicationData = {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        times,
        startDate: startDate.toISOString(),
        endDate: endDate ? endDate.toISOString() : undefined,
        notes: notes.trim() || undefined,
      };

      if (isEditing && medicationId) {
        // Edit existing
        await medicationService.editMedication(userId, medicationId, medicationData);
        Alert.alert('Success', 'Medication updated');
      } else {
        // Create new
        await medicationService.addMedication(userId, medicationData);
        Alert.alert('Success', 'Medication added');
      }

      navigation.goBack();
    } catch (err: any) {
      console.error('[AddMedicationScreen] Save error:', err);
      Alert.alert('Error', err.message || 'Failed to save medication');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading && isEditing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Medication Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Medication Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Paracetamol, Ibuprofen"
            value={name}
            onChangeText={setName}
            editable={!loading}
            placeholderTextColor="#999"
          />
        </View>

        {/* Dosage */}
        <View style={styles.section}>
          <Text style={styles.label}>Dosage *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500mg, 1 tablet"
            value={dosage}
            onChangeText={setDosage}
            editable={!loading}
            placeholderTextColor="#999"
          />
        </View>

        {/* Frequency */}
        <View style={styles.section}>
          <Text style={styles.label}>Frequency</Text>
          <TouchableOpacity
            style={styles.frequencyButton}
            onPress={() => setShowFrequencyModal(true)}
          >
            <Text style={styles.frequencyButtonText}>{frequency}</Text>
            <Ionicons name="chevron-down" size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {/* Times */}
        <View style={styles.section}>
          <View style={styles.timesHeader}>
            <Text style={styles.label}>Times</Text>
            <TouchableOpacity onPress={addTimeSlot}>
              <Ionicons name="add-circle-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>
          {times.map((time, index) => (
            <View key={index} style={styles.timeRow}>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => {
                  setSelectedTimeIndex(index);
                  setShowTimePicker(true);
                }}
              >
                <Ionicons name="time-outline" size={18} color="#2196F3" />
                <Text style={styles.timeText}>{time}</Text>
              </TouchableOpacity>
              {times.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeTimeSlot(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={20} color="#f44336" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Start Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#2196F3" />
            <Text style={styles.dateButtonText}>
              {startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* End Date */}
        <View style={styles.section}>
          <Text style={styles.label}>End Date (Optional)</Text>
          <View style={styles.endDateRow}>
            <TouchableOpacity
              style={[styles.dateButton, { flex: 1 }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#2196F3" />
              <Text style={styles.dateButtonText}>
                {endDate ? endDate.toLocaleDateString() : 'Not set'}
              </Text>
            </TouchableOpacity>
            {endDate && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setEndDate(null)}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="e.g., Take with food, avoid alcohol"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            editable={!loading}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update' : 'Save'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${times[selectedTimeIndex]}`)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      {/* Frequency Modal */}
      <Modal visible={showFrequencyModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowFrequencyModal(false)}
        />
        <View style={styles.frequencyModal}>
          <Text style={styles.frequencyModalTitle}>Select Frequency</Text>
          <FlatList
            data={FREQUENCY_OPTIONS}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.frequencyOption,
                  frequency === item && styles.frequencyOptionSelected,
                ]}
                onPress={() => {
                  setFrequency(item);
                  setShowFrequencyModal(false);
                }}
              >
                <Text
                  style={[
                    styles.frequencyOptionText,
                    frequency === item && styles.frequencyOptionTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {frequency === item && (
                  <Ionicons name="checkmark" size={20} color="#2196F3" />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            scrollEnabled={false}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  frequencyButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  endDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 8,
  },
  spacer: {
    height: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  frequencyModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: '50%',
  },
  frequencyModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  frequencyOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  frequencyOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  frequencyOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  frequencyOptionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
