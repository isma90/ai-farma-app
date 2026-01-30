import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { chatService } from '../../services/ChatService';

export default function SettingsScreen() {
  const [settingValue, setSettingValue] = useState('');

  const handleClearConversations = () => {
    Alert.alert(
      'Limpiar conversaciones',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Limpiar',
          onPress: async () => {
            try {
              await chatService.clearAllConversations('user-1');
              Alert.alert('Éxito', 'Conversaciones eliminadas');
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar las conversaciones');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración General</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Versión de la app</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Entorno</Text>
          <Text style={styles.settingValue}>Desarrollo</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos</Text>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleClearConversations}
        >
          <Text style={styles.dangerButtonText}>🗑️ Limpiar todas las conversaciones</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre la App</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>AI Farma</Text>
          <Text style={styles.infoDescription}>
            Asistente farmacéutico inteligente para Chile
          </Text>
          <Text style={styles.infoNote}>
            Desarrollado con React Native y Expo
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#000000',
  },
  settingValue: {
    fontSize: 14,
    color: '#999999',
  },
  dangerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginVertical: 8,
  },
  dangerButtonText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  infoContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  infoNote: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
  },
});
