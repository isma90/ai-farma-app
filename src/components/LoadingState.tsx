import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '@constants/app';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = 'Cargando...' }: LoadingStateProps) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.MEDIUM_GRAY,
  },
});
