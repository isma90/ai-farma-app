export const medicationScheduleOptimizer = {
  generateOptimalSchedule: async (medications: any[]) => {
    return {
      times: ['09:00', '14:00', '20:00'],
      schedule: [],
      warnings: [],
      rationale: 'Schedule optimized',
    };
  },
};
