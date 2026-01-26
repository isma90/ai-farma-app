import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🤖</Text>
        <Text style={styles.title}>Asistente IA</Text>
        <Text style={styles.message}>Próximamente</Text>
        <Text style={styles.description}>
          El asistente farmacéutico impulsado por IA estará disponible en la próxima actualización
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  message: {
    fontSize: 18,
    color: '#2196F3',
    marginBottom: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
