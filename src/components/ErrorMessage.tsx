/**
 * ErrorMessage Component
 * Displays error messages with retry option
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { APIError } from '@types/index';

interface ErrorMessageProps {
  error: APIError | string | null;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  variant = 'error',
}) => {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;

  const getBackgroundColor = () => {
    switch (variant) {
      case 'warning':
        return '#FFF3CD';
      case 'info':
        return '#D1ECF1';
      case 'error':
      default:
        return '#F8D7DA';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'warning':
        return '#856404';
      case 'info':
        return '#0C5460';
      case 'error':
      default:
        return '#721C24';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'error':
      default:
        return '❌';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={[styles.message, { color: getTextColor() }]}>{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Reintentar</Text>
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
    borderLeftWidth: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  icon: {
    fontSize: 18,
    marginTop: 2,
  },
  message: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
});
