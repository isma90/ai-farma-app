import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';

export const HomeScreen = () => {
  const { user, isAnonymous } = useSelector((state: RootState) => state.auth);
  const { isOnline } = useSelector((state: RootState) => state.app);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido</Text>
        {user && <Text style={styles.subtitle}>{user.displayName}</Text>}
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Estado de Conexión</Text>
        <Text style={[styles.statusValue, isOnline ? styles.online : styles.offline]}>
          {isOnline ? '🟢 En Línea' : '🔴 Sin Conexión'}
        </Text>
      </View>

      {isAnonymous && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Usuario Anónimo</Text>
          <Text style={styles.warningText}>
            Estás usando la aplicación sin registrarte. Los datos no se sincronizarán entre dispositivos.
          </Text>
        </View>
      )}

      <View style={styles.quickLinks}>
        <Text style={styles.quickLinksTitle}>Funciones Principales</Text>

        <View style={styles.linkCard}>
          <Text style={styles.linkIcon}>🏥</Text>
          <Text style={styles.linkTitle}>Encontrar Farmacias</Text>
          <Text style={styles.linkDescription}>Localizapharmacias cercanas y de turno</Text>
        </View>

        <View style={styles.linkCard}>
          <Text style={styles.linkIcon}>💊</Text>
          <Text style={styles.linkTitle}>Mis Medicinas</Text>
          <Text style={styles.linkDescription}>Gestiona tus medicamentos y recordatorios</Text>
        </View>

        <View style={styles.linkCard}>
          <Text style={styles.linkIcon}>🤖</Text>
          <Text style={styles.linkTitle}>Asistente IA</Text>
          <Text style={styles.linkDescription}>Consulta sobre medicamentos y farmacias</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  online: {
    color: '#4CAF50',
  },
  offline: {
    color: '#FF6B6B',
  },
  warningCard: {
    backgroundColor: '#FFF9C4',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#666',
  },
  quickLinks: {
    padding: 16,
  },
  quickLinksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  linkCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  linkIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 12,
    color: '#999',
  },
});
