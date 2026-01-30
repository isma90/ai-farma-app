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
  BIFURCATION = 'bifurcation',
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

interface ConversationContext {
  medications: MedicationData[];
  currentMedication?: MedicationData;
  userMessage?: string;
  state?: ScheduleState;
}

class ScheduleStateMachineImpl {
  private state: ScheduleState = ScheduleState.IDLE;
  private config: ScheduleStateMachineConfig;
  private contextsMap: Map<string, ConversationContext> = new Map();

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

  getContext(conversationId: string): ConversationContext | undefined {
    return this.contextsMap.get(conversationId);
  }

  initializeContext(conversationId: string, context: ConversationContext): void {
    this.contextsMap.set(conversationId, context);
  }

  classifyMessage(message: string): string {
    // Simple message classification
    if (message.toLowerCase().includes('medication') || message.toLowerCase().includes('med')) {
      return 'medication_inquiry';
    }
    if (message.toLowerCase().includes('pharmacy') || message.toLowerCase().includes('drug')) {
      return 'pharmacy_inquiry';
    }
    return 'general';
  }

  startBifurcation(conversationId: string): void {
    const context = this.contextsMap.get(conversationId);
    if (context) {
      context.state = ScheduleState.COLLECTING_MEDS;
    }
  }

  endBifurcation(conversationId: string): void {
    const context = this.contextsMap.get(conversationId);
    if (context) {
      context.state = ScheduleState.COMPLETE;
    }
  }
}

export const scheduleStateMachine = new ScheduleStateMachineImpl();
