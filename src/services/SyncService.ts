import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { ISyncQueueItem } from '@types/index';
import { v4 as uuid } from 'uuid';

const SYNC_QUEUE_KEY = 'sync_queue';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

class SyncService {
  async addToSyncQueue(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entityType: 'medication' | 'adherence' | 'favorite',
    entityId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      const queue = await this.getSyncQueue(userId);

      const item: ISyncQueueItem = {
        id: uuid(),
        action,
        entityType,
        entityId,
        data,
        timestamp: new Date(),
        retryCount: 0,
      };

      queue.push(item);
      await AsyncStorage.setItem(`${SYNC_QUEUE_KEY}_${userId}`, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add item to sync queue:', error);
      throw error;
    }
  }

  async processSyncQueue(userId: string, onProgress?: (current: number, total: number) => void) {
    try {
      let queue = await this.getSyncQueue(userId);

      if (queue.length === 0) {
        return { success: true, processed: 0, failed: 0 };
      }

      let processed = 0;
      let failed = 0;
      const failedItems: ISyncQueueItem[] = [];

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        onProgress?.(i + 1, queue.length);

        try {
          await this.syncItem(userId, item);
          processed++;
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);

          if (item.retryCount < MAX_RETRIES) {
            item.retryCount++;
            failedItems.push(item);
          } else {
            failed++;
          }
        }
      }

      // Save failed items back to queue
      if (failedItems.length > 0) {
        await AsyncStorage.setItem(`${SYNC_QUEUE_KEY}_${userId}`, JSON.stringify(failedItems));
      } else {
        await AsyncStorage.removeItem(`${SYNC_QUEUE_KEY}_${userId}`);
      }

      return { success: failed === 0, processed, failed };
    } catch (error) {
      console.error('Failed to process sync queue:', error);
      throw error;
    }
  }

  async getSyncQueue(userId: string): Promise<ISyncQueueItem[]> {
    try {
      const queue = await AsyncStorage.getItem(`${SYNC_QUEUE_KEY}_${userId}`);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  async clearSyncQueue(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${SYNC_QUEUE_KEY}_${userId}`);
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
      throw error;
    }
  }

  private async syncItem(userId: string, item: ISyncQueueItem): Promise<void> {
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, item.retryCount);

    // Wait with exponential backoff
    await new Promise((resolve) => setTimeout(resolve, delay));

    switch (item.action) {
      case 'CREATE':
        await firestore()
          .collection('users')
          .doc(userId)
          .collection(item.entityType)
          .doc(item.entityId)
          .set(item.data);
        break;

      case 'UPDATE':
        await firestore()
          .collection('users')
          .doc(userId)
          .collection(item.entityType)
          .doc(item.entityId)
          .update(item.data);
        break;

      case 'DELETE':
        await firestore()
          .collection('users')
          .doc(userId)
          .collection(item.entityType)
          .doc(item.entityId)
          .delete();
        break;
    }
  }

  async getSyncQueueSize(userId: string): Promise<number> {
    const queue = await this.getSyncQueue(userId);
    return queue.length;
  }

  async hasPendingSync(userId: string): Promise<boolean> {
    const size = await this.getSyncQueueSize(userId);
    return size > 0;
  }
}

export const syncService = new SyncService();
