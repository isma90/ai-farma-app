import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID string
 */
export function generateUUID(): string {
  return uuidv4();
}
