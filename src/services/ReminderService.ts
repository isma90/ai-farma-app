/**
 * ReminderService: Manages medication reminders
 * Stub implementation - full implementation in development
 */

class ReminderService {
  async setReminder(userId: string, medicationId: string, time: string): Promise<void> {
    console.log('[ReminderService] Setting reminder for', medicationId, 'at', time);
  }

  async cancelReminder(reminderId: string): Promise<void> {
    console.log('[ReminderService] Canceling reminder:', reminderId);
  }
}

export const reminderService = new ReminderService();
