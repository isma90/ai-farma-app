/**
 * Application Constants
 */

// Message constraints
export const MESSAGE_MIN_LENGTH = 1;
export const MESSAGE_MAX_LENGTH = 500;

// API Configuration
export const API_TIMEOUT = 10000; // 10 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1 second

// Storage Keys
export const STORAGE_KEYS = {
  CONVERSATIONS: 'ai_farma_conversations',
  CURRENT_CONVERSATION: 'ai_farma_current_conversation',
  USER_PREFERENCES: 'ai_farma_user_preferences',
  LAST_SYNC: 'ai_farma_last_sync',
};

// Warning Severity Levels
export const WARNING_SEVERITY = {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  INFO: 'INFO',
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
} as const;
