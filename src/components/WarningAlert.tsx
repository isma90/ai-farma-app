/**
 * WarningAlert Component
 * Displays medication warnings with severity levels
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface WarningAlertProps {
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  onClose?: () => void;
}

export const WarningAlert: React.FC<WarningAlertProps> = ({
  message,
  severity,
  onClose,
}) => {
  const getStyles = () => {
    switch (severity) {
      case 'CRITICAL':
        return {
          backgroundColor: '#FF3B30',
          icon: '🚨',
          textColor: '#FFFFFF',
        };
      case 'WARNING':
        return {
          backgroundColor: '#FF9500',
          icon: '⚠️',
          textColor: '#FFFFFF',
        };
      case 'INFO':
      default:
        return {
          backgroundColor: '#5AC8FA',
          icon: 'ℹ️',
          textColor: '#FFFFFF',
        };
    }
  };

  const { backgroundColor, icon, textColor } = getStyles();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      </View>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  icon: {
    fontSize: 18,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
