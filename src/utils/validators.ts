/**
 * Validation Utilities
 */

import { MESSAGE_MIN_LENGTH, MESSAGE_MAX_LENGTH } from './constants';

/**
 * Validate chat message
 */
export function validateMessage(message: string): { valid: boolean; error?: string } {
  const trimmed = message.trim();

  if (trimmed.length < MESSAGE_MIN_LENGTH) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > MESSAGE_MAX_LENGTH) {
    return {
      valid: false,
      error: `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate user ID
 */
export function validateUserId(userId: string): { valid: boolean; error?: string } {
  if (!userId || userId.trim().length === 0) {
    return { valid: false, error: 'User ID is required' };
  }

  if (userId.length > 100) {
    return { valid: false, error: 'User ID is too long' };
  }

  return { valid: true };
}

/**
 * Validate conversation ID
 */
export function validateConversationId(convId: string): { valid: boolean; error?: string } {
  if (!convId || convId.trim().length === 0) {
    return { valid: false, error: 'Conversation ID is required' };
  }

  return { valid: true };
}

/**
 * Validate backend URL
 */
export function validateBackendUrl(url: string): { valid: boolean; error?: string } {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid backend URL format' };
  }
}
