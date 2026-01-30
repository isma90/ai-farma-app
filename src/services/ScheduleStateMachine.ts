export enum ScheduleState {
  IDLE = 'IDLE',
  COLLECTING_MEDS = 'COLLECTING_MEDS',
  COLLECTING_FREQUENCY = 'COLLECTING_FREQUENCY',
  GENERATING_TIMES = 'GENERATING_TIMES',
  SHOWING_PROPOSAL = 'SHOWING_PROPOSAL',
  WAITING_SCHEDULE_CONFIRMATION = 'WAITING_SCHEDULE_CONFIRMATION',
  CREATING = 'CREATING',
}

export enum MessageType {
  SCHEDULE_REQUEST = 'SCHEDULE_REQUEST',
  MEDICATION_INFO = 'MEDICATION_INFO',
  BIFURCATION = 'BIFURCATION',
  OTHER = 'OTHER',
}

export interface MedicationData {
  name: string;
  dosage?: string;
  frequency?: string;
}

class ScheduleStateMachineImpl {
  getContext(convId: string) {
    return null;
  }

  initializeContext(convId: string) {
    // Stub
  }

  classifyMessage(message: string, state: ScheduleState): MessageType {
    return MessageType.OTHER;
  }

  startBifurcation(convId: string, type: string) {
    return { id: 'bif-1' };
  }

  endBifurcation(convId: string, bifurcationId: string) {
    // Stub
  }

  updateMedications(convId: string, medications: MedicationData[]) {
    // Stub
  }

  startCollectingMeds(convId: string) {
    // Stub
  }

  proceedToFrequencyCollection(convId: string) {
    // Stub
  }

  proceedToGeneratingTimes(convId: string) {
    // Stub
  }

  setProposedTimes(convId: string, times: string[]) {
    // Stub
  }

  setProposedSchedule(convId: string, schedule: any) {
    // Stub
  }

  confirmTimes(convId: string) {
    // Stub
  }

  rejectTimes(convId: string) {
    // Stub
  }

  proceedToCreation(convId: string) {
    // Stub
  }

  getStateSummary(convId: string): string {
    return '';
  }
}

export const scheduleStateMachine = new ScheduleStateMachineImpl();
