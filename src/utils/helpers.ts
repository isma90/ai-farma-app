/**
 * Helper Utilities
 */

import { IBackendChatResponse } from '@types/index';

/**
 * Format warning message with severity indicator
 */
export function formatWarningMessage(
  message: string,
  severity?: 'CRITICAL' | 'WARNING' | null
): string {
  if (!severity) return message;

  const icon = severity === 'CRITICAL' ? '🚨' : '⚠️';
  return `${icon} ADVERTENCIA ${severity}: ${message}`;
}

/**
 * Check if response has warning
 */
export function hasWarning(response: IBackendChatResponse): boolean {
  return response.metadata.has_warning;
}

/**
 * Get warning severity
 */
export function getWarningSeverity(response: IBackendChatResponse) {
  return response.metadata.warning_severity;
}

/**
 * Format timestamp to readable format
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES');
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} minuto(s)`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} hora(s)`;

  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} día(s)`;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
