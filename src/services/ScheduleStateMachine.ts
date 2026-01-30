/**
 * ScheduleStateMachine: State machine for medication scheduling conversations
 * Stub implementation - full implementation in development
 */

export enum ScheduleState {
  IDLE = 'IDLE',
  COLLECTING_MEDS = 'COLLECTING_MEDS',
  COLLECTING_FREQUENCY = 'COLLECTING_FREQUENCY',
  GENERATING_TIMES = 'GENERATING_TIMES',
  SHOWING_PROPOSAL = 'SHOWING_PROPOSAL',
  CREATING = 'CREATING',
  COMPLETE = 'COMPLETE',
}

export enum MessageType {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface MedicationData {
  name: string;
  dosage?: string;
  frequency?: string;
  times?: string[];
  startDate?: string;
  endDate?: string;
}

export interface ScheduleStateMachineConfig {
  onStateChange?: (state: ScheduleState) => void;
  onMessageNeeded?: (message: string) => void;
}

class ScheduleStateMachineImpl {
  private state: ScheduleState = ScheduleState.IDLE;
  private config: ScheduleStateMachineConfig;

  constructor(config?: ScheduleStateMachineConfig) {
    this.config = config || {};
  }

  getState(): ScheduleState {
    return this.state;
  }

  setState(newState: ScheduleState): void {
    this.state = newState;
    if (this.config.onStateChange) {
      this.config.onStateChange(newState);
    }
  }
}

export const scheduleStateMachine = new ScheduleStateMachineImpl();
