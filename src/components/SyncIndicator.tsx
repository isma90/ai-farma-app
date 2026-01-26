import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSyncQueue } from '@hooks/useSyncQueue';
import { COLORS } from '@constants/app';

interface SyncIndicatorProps {
  onSyncPress?: () => void;
  showProgress?: boolean;
}

export const SyncIndicator = ({ onSyncPress, showProgress = true }: SyncIndicatorProps) => {
  const {
    queueSize,
    isSyncing,
    syncProgress,
    lastSyncTime,
    processSyncQueue,
  } = useSyncQueue();

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (queueSize > 0) {
      setShowNotification(true);
    }
  }, [queueSize]);

  if (queueSize === 0 && !isSyncing) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        onSyncPress?.();
        if (!isSyncing && queueSize > 0) {
          processSyncQueue();
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {isSyncing ? (
          <>
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            <Text style={styles.text}>Sincronizando...</Text>
            {showProgress && syncProgress.total > 0 && (
              <Text style={styles.progressText}>
                ({syncProgress.current}/{syncProgress.total})
              </Text>
            )}
          </>
        ) : (
          <>
            <MaterialCommunityIcons
              name="cloud-upload-outline"
              size={18}
              color={COLORS.PRIMARY}
            />
            <Text style={styles.text}>
              {queueSize} cambio{queueSize !== 1 ? 's' : ''} pendiente{queueSize !== 1 ? 's' : ''}
            </Text>
          </>
        )}
      </View>

      {lastSyncTime && (
        <Text style={styles.lastSync}>
          Últ. sync: {lastSyncTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.MEDIUM_GRAY,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.LIGHT_GRAY,
  },
  lastSync: {
    fontSize: 10,
    color: COLORS.LIGHT_GRAY,
    marginTop: 4,
  },
});
