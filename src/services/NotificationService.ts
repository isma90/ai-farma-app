import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMedicationSchedule } from '@types/index';

const REMINDERS_CACHE_KEY = 'scheduled_reminders';

class NotificationService {
  private registeredReminders: Map<string, string> = new Map();

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  async scheduleReminder(medication: IMedicationSchedule, reminderMinutesBefore: number = 15) {
    try {
      for (const time of medication.times) {
        const [hours, minutes] = time.split(':').map(Number);
        const trigger = new Date();
        trigger.setHours(hours, minutes - reminderMinutesBefore);

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Recordatorio de Medicamento',
            body: `Es hora de tomar ${medication.medicationName} (${medication.dosage})`,
            data: {
              medicationId: medication.id,
              type: 'medication_reminder',
            },
          },
          trigger,
        });

        const reminderId = `${medication.id}_${time}`;
        this.registeredReminders.set(reminderId, notificationId);
      }

      await this.saveRemindersToCache();
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      throw error;
    }
  }

  async cancelReminder(medicationId: string, time?: string) {
    try {
      if (time) {
        const reminderId = `${medicationId}_${time}`;
        const notificationId = this.registeredReminders.get(reminderId);
        if (notificationId) {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
          this.registeredReminders.delete(reminderId);
        }
      } else {
        // Cancel all reminders for this medication
        for (const [reminderId, notificationId] of this.registeredReminders.entries()) {
          if (reminderId.startsWith(medicationId)) {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            this.registeredReminders.delete(reminderId);
          }
        }
      }

      await this.saveRemindersToCache();
    } catch (error) {
      console.error('Failed to cancel reminder:', error);
      throw error;
    }
  }

  async cancelAllReminders() {
    try {
      for (const notificationId of this.registeredReminders.values()) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
      this.registeredReminders.clear();
      await this.saveRemindersToCache();
    } catch (error) {
      console.error('Failed to cancel all reminders:', error);
      throw error;
    }
  }

  async loadRemindersFromCache() {
    try {
      const cached = await AsyncStorage.getItem(REMINDERS_CACHE_KEY);
      if (cached) {
        const reminders = JSON.parse(cached);
        this.registeredReminders = new Map(reminders);
      }
    } catch (error) {
      console.error('Failed to load reminders from cache:', error);
    }
  }

  private async saveRemindersToCache() {
    try {
      const reminders = Array.from(this.registeredReminders.entries());
      await AsyncStorage.setItem(REMINDERS_CACHE_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.error('Failed to save reminders to cache:', error);
    }
  }

  async showLocalNotification(title: string, message: string, data?: Record<string, unknown>) {
    try {
      await Notifications.presentNotificationAsync({
        title,
        body: message,
        data: data || {},
      });
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }

  setupNotificationHandler(
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
  ) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse
    );

    return subscription;
  }
}

export const notificationService = new NotificationService();
