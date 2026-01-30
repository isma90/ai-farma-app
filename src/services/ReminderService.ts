export const reminderService = {
  createReminder: async (scheduleId: string, medicationName: string, time: string, notes?: string) => {
    return {
      id: 'reminder-1',
      scheduleId,
      medicationName,
      time,
      enabled: true,
      notes,
    };
  },

  updateReminder: async (reminderId: string, updates: any) => {
    return {
      id: reminderId,
      ...updates,
    };
  },
};
