import React, { useState, useEffect, useFocusEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { medicationService } from '@services/MedicationService';
import { notificationService } from '@services/NotificationService';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { MedicationCard } from '@components/MedicationCard';
import { LoadingState } from '@components/LoadingState';
import { EmptyState } from '@components/EmptyState';
import { IMedicationSchedule } from '@types/index';
import { COLORS } from '@constants/app';

export const MedicationScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [medications, setMedications] = useState<IMedicationSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadMedications();
    }, [user])
  );

  const loadMedications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const meds = await medicationService.getMedications(user.uid);
      setMedications(meds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to load medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedication = (medication: IMedicationSchedule) => {
    Alert.alert(
      'Eliminar medicamento',
      `¿Deseas eliminar "${medication.medicationName}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              if (user) {
                await medicationService.deleteMedication(user.uid, medication.id);
                await notificationService.cancelReminder(medication.id);
                await loadMedications();
              }
            } catch (error) {
              console.error('Failed to delete medication:', error);
              Alert.alert('Error', 'No se pudo eliminar el medicamento');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditMedication = (medication: IMedicationSchedule) => {
    // TODO: Navigate to edit screen
    Alert.alert('Info', 'Editar medicamentos será implementado en la próxima versión');
  };

  if (isLoading) {
    return <LoadingState message="Cargando medicamentos..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Medicinas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMedication')}
        >
          <MaterialCommunityIcons
            name="plus-circle"
            size={28}
            color={COLORS.PRIMARY}
          />
        </TouchableOpacity>
      </View>

      {medications.length === 0 ? (
        <EmptyState
          icon="💊"
          title="Sin medicinas registradas"
          message="Agrega tus medicinas para recibir recordatorios"
          actionText="+ Agregar Medicina"
          onAction={() => navigation.navigate('AddMedication')}
        />
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MedicationCard
              medication={item}
              onPress={() => {
                // TODO: Navigate to medication detail
              }}
              onEditPress={() => handleEditMedication(item)}
              onDeletePress={() => handleDeleteMedication(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_GRAY,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.DARK_GRAY,
  },
  addButton: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
});
