import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { syncService } from '@services/SyncService';

interface SyncProgress {
  current: number;
  total: number;
  percentage: number;
}

export const useSyncQueue = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({ current: 0, total: 0, percentage: 0 });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const checkQueueSize = useCallback(async () => {
    if (!user) return;

    try {
      const size = await syncService.getSyncQueueSize(user.uid);
      setQueueSize(size);
    } catch (error) {
      console.error('Failed to check queue size:', error);
    }
  }, [user]);

  const processSyncQueue = useCallback(async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await syncService.processSyncQueue(user.uid, (current, total) => {
        setSyncProgress({
          current,
          total,
          percentage: Math.round((current / total) * 100),
        });
      });

      setLastSyncTime(new Date());
      await checkQueueSize();

      if (!result.success && result.failed > 0) {
        setSyncError(`${result.failed} item(s) failed to sync`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setSyncError(errorMessage);
    } finally {
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0, percentage: 0 });
    }
  }, [user, isSyncing, checkQueueSize]);

  const addToQueue = useCallback(
    async (
      action: 'CREATE' | 'UPDATE' | 'DELETE',
      entityType: 'medication' | 'adherence' | 'favorite',
      entityId: string,
      data: Record<string, unknown>
    ) => {
      if (!user) return;

      try {
        await syncService.addToSyncQueue(user.uid, action, entityType, entityId, data);
        await checkQueueSize();
      } catch (error) {
        console.error('Failed to add to sync queue:', error);
      }
    },
    [user, checkQueueSize]
  );

  const clearQueue = useCallback(async () => {
    if (!user) return;

    try {
      await syncService.clearSyncQueue(user.uid);
      setQueueSize(0);
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }, [user]);

  const hasPendingSync = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      return await syncService.hasPendingSync(user.uid);
    } catch (error) {
      console.error('Failed to check pending sync:', error);
      return false;
    }
  }, [user]);

  // Check queue size periodically
  useEffect(() => {
    checkQueueSize();

    const interval = setInterval(checkQueueSize, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkQueueSize]);

  return {
    queueSize,
    isSyncing,
    syncProgress,
    lastSyncTime,
    syncError,
    processSyncQueue,
    addToQueue,
    clearQueue,
    hasPendingSync,
    checkQueueSize,
  };
};
