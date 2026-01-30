import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '../utils/uuid';

/**
 * Medication data structure
 */
export interface IMedication {
  id: string;
  userId: string;
  name: string;
  dosage: string; // e.g., "500mg"
  frequency: 'once' | 'twice' | 'thrice' | 'custom' | string; // e.g., "once", "every 6h"
  times?: string[]; // Array of times for each dose (HH:MM format)
  startDate: string; // ISO date string
  endDate?: string; // ISO date string (optional)
  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

const MEDICATIONS_KEY = 'medications';
const MEDICATIONS_PREFIX = 'medication_';

/**
 * MedicationService: Manages user medications
 * - CRUD operations
 * - Local persistence (AsyncStorage)
 * - Type-safe medication management
 */
class MedicationService {
  private medicationsCache: Map<string, IMedication> = new Map();
  private isInitialized = false;

  /**
   * Initialize service by loading medications from cache
   */
  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      const medicationsJson = await AsyncStorage.getItem(`${MEDICATIONS_KEY}:${userId}`);
      if (medicationsJson) {
        const medications = JSON.parse(medicationsJson);
        medications.forEach((med: IMedication) => {
          this.medicationsCache.set(med.id, med);
        });
      }
      this.isInitialized = true;
      console.log('[MedicationService] Initialized with', this.medicationsCache.size, 'medications');
    } catch (error) {
      console.error('[MedicationService] Initialization error:', error);
    }
  }

  /**
   * Add a new medication
   */
  async addMedication(userId: string, medication: Omit<IMedication, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<IMedication> {
    try {
      const now = new Date().toISOString();
      const newMedication: IMedication = {
        ...medication,
        id: generateUUID(),
        userId,
        createdAt: now,
        updatedAt: now,
      };

      this.medicationsCache.set(newMedication.id, newMedication);
      await this.persistMedications(userId);

      console.log('[MedicationService] Medication added:', newMedication.id);
      return newMedication;
    } catch (error) {
      console.error('[MedicationService] Add error:', error);
      throw error;
    }
  }

  /**
   * Update an existing medication
   */
  async editMedication(userId: string, medicationId: string, updates: Partial<Omit<IMedication, 'id' | 'userId' | 'createdAt'>>): Promise<IMedication> {
    try {
      const medication = this.medicationsCache.get(medicationId);
      if (!medication || medication.userId !== userId) {
        throw new Error('Medication not found');
      }

      const updatedMedication: IMedication = {
        ...medication,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.medicationsCache.set(medicationId, updatedMedication);
      await this.persistMedications(userId);

      console.log('[MedicationService] Medication updated:', medicationId);
      return updatedMedication;
    } catch (error) {
      console.error('[MedicationService] Edit error:', error);
      throw error;
    }
  }

  /**
   * Delete a medication
   */
  async deleteMedication(userId: string, medicationId: string): Promise<void> {
    try {
      const medication = this.medicationsCache.get(medicationId);
      if (!medication || medication.userId !== userId) {
        throw new Error('Medication not found');
      }

      this.medicationsCache.delete(medicationId);
      await this.persistMedications(userId);

      console.log('[MedicationService] Medication deleted:', medicationId);
    } catch (error) {
      console.error('[MedicationService] Delete error:', error);
      throw error;
    }
  }

  /**
   * Get all medications for user
   */
  async getMedications(userId: string): Promise<IMedication[]> {
    if (!this.isInitialized) {
      await this.initialize(userId);
    }

    return Array.from(this.medicationsCache.values()).filter((med) => med.userId === userId);
  }

  /**
   * Get single medication by ID
   */
  async getMedicationById(userId: string, medicationId: string): Promise<IMedication | null> {
    if (!this.isInitialized) {
      await this.initialize(userId);
    }

    const medication = this.medicationsCache.get(medicationId);
    if (medication && medication.userId === userId) {
      return medication;
    }
    return null;
  }

  /**
   * Get today's medications
   */
  async getTodaysMedications(userId: string): Promise<IMedication[]> {
    const medications = await this.getMedications(userId);
    const today = new Date().toISOString().split('T')[0];

    return medications.filter((med) => {
      const startDate = med.startDate.split('T')[0];
      const endDate = med.endDate?.split('T')[0];

      return startDate <= today && (!endDate || endDate >= today);
    });
  }

  /**
   * Persist medications to AsyncStorage
   */
  private async persistMedications(userId: string): Promise<void> {
    try {
      const medications = Array.from(this.medicationsCache.values()).filter(
        (med) => med.userId === userId
      );
      await AsyncStorage.setItem(`${MEDICATIONS_KEY}:${userId}`, JSON.stringify(medications));
    } catch (error) {
      console.error('[MedicationService] Persist error:', error);
      throw error;
    }
  }

  /**
   * Clear all medications for user
   */
  async clearMedications(userId: string): Promise<void> {
    try {
      Array.from(this.medicationsCache.keys()).forEach((key) => {
        const medication = this.medicationsCache.get(key);
        if (medication?.userId === userId) {
          this.medicationsCache.delete(key);
        }
      });
      await AsyncStorage.removeItem(`${MEDICATIONS_KEY}:${userId}`);
      console.log('[MedicationService] All medications cleared for user:', userId);
    } catch (error) {
      console.error('[MedicationService] Clear error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const medicationService = new MedicationService();

export default MedicationService;
