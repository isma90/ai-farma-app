/**
 * Core type definitions for AI Farma application
 */

// Chat API Response Types
export interface IToolCallResult {
  tool_name: string;
  tool_input: Record<string, unknown>;
  result: unknown;
  error?: string;
}

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface IBackendChatResponse {
  response: string;
  tool_calls: IToolCallResult[];
  metadata: {
    conversation_id: string;
    user_id: string;
    has_warning: boolean;
    warning_severity: 'CRITICAL' | 'WARNING' | null;
  };
  timestamp: string;
}

export interface IConversationData {
  conversation_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  messages: IMessage[];
}

export interface IConversationSnapshot {
  conversation_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  preview: string;
}

// Chat Service Types
export interface SendMessageParams {
  user_id: string;
  conversation_id: string;
  message: string;
}

export interface ChatHistory {
  conversation_id: string;
  messages: IMessage[];
}

// Error Types
export interface APIError {
  status: number;
  message: string;
  code?: string;
}

// User Types
export interface User {
  id: string;
  name?: string;
  email?: string;
  created_at: string;
}

// Medication Types
export interface Medication {
  id: string;
  name: string;
  active_component: string;
  dosage: string;
  presentation: string;
  instructions: string;
  warnings?: string[];
  interactions?: MedicationInteraction[];
}

export interface MedicationInteraction {
  medication_id: string;
  medication_name: string;
  interaction_type: 'major' | 'moderate' | 'minor';
  description: string;
}

// Pharmacy Types
export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  hours: string;
  distance?: number;
}

// State Machine Types
export interface ScheduleState {
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  confirmed: boolean;
}
