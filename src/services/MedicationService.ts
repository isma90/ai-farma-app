import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMedicationSchedule, IAdherenceRecord } from '@types/index';
import { v4 as uuid } from 'uuid';

const MEDICATIONS_CACHE_KEY = 'medications_cache';

class MedicationService {
  async createMedication(
    userId: string,
    medication: Omit<IMedicationSchedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IMedicationSchedule> {
    try {
      const medicationData: IMedicationSchedule = {
        ...medication,
        id: uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        adherenceHistory: [],
      };

      // Save to Firestore
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('medications')
        .doc(medicationData.id)
        .set(medicationData);

      // Cache locally
      await this.cacheMedication(userId, medicationData);

      return medicationData;
    } catch (error) {
      throw new Error(`Failed to create medication: ${error}`);
    }
  }

  async getMedications(userId: string): Promise<IMedicationSchedule[]> {
    try {
      // Try Firestore first
      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('medications')
        .get();

      const medications = snapshot.docs.map((doc) => doc.data() as IMedicationSchedule);

      // Cache locally
      await AsyncStorage.setItem(
        `${MEDICATIONS_CACHE_KEY}_${userId}`,
        JSON.stringify(medications)
      );

      return medications;
    } catch (error) {
      // Fallback to local cache
      return this.getCachedMedications(userId);
    }
  }

  async updateMedication(
    userId: string,
    medicationId: string,
    updates: Partial<IMedicationSchedule>
  ): Promise<IMedicationSchedule> {
    try {
      const medication = await firestore()
        .collection('users')
        .doc(userId)
        .collection('medications')
        .doc(medicationId)
        .update({
          ...updates,
          updatedAt: new Date(),
        });

      const updated = await firestore()
        .collection('users')
        .doc(userId)
        .collection('medications')
        .doc(medicationId)
        .get();

      const data = updated.data() as IMedicationSchedule;
      await this.cacheMedication(userId, data);

      return data;
    } catch (error) {
      throw new Error(`Failed to update medication: ${error}`);
    }
  }

  async deleteMedication(userId: string, medicationId: string): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('medications')
        .doc(medicationId)
        .delete();

      await this.removeCachedMedication(userId, medicationId);
    } catch (error) {
      throw new Error(`Failed to delete medication: ${error}`);
    }
  }

  async recordAdherence(
    userId: string,
    medicationId: string,
    taken: boolean,
    takenAt?: Date
  ): Promise<void> {
    try {
      const adherenceRecord: IAdherenceRecord = {
        date: new Date(),
        taken,
        takenAt: takenAt || (taken ? new Date() : undefined),
      };

      await firestore()
        .collection('users')
        .doc(userId)
        .collection('medications')
        .doc(medicationId)
        .update({
          adherenceHistory: firestore.FieldValue.arrayUnion(adherenceRecord),
          updatedAt: new Date(),
        });

      // Also save to local cache
      const medications = await this.getCachedMedications(userId);
      const index = medications.findIndex((m) => m.id === medicationId);
      if (index !== -1) {
        medications[index].adherenceHistory.push(adherenceRecord);
        await AsyncStorage.setItem(
          `${MEDICATIONS_CACHE_KEY}_${userId}`,
          JSON.stringify(medications)
        );
      }
    } catch (error) {
      throw new Error(`Failed to record adherence: ${error}`);
    }
  }

  async getTodaysMedications(userId: string): Promise<IMedicationSchedule[]> {
    try {
      const medications = await this.getMedications(userId);
      const today = new Date();

      return medications.filter((med) => {
        const startDate = new Date(med.startDate);
        const endDate = med.endDate ? new Date(med.endDate) : null;

        return (
          startDate <= today && (endDate === null || endDate >= today)
        );
      });
    } catch (error) {
      throw new Error(`Failed to get today's medications: ${error}`);
    }
  }

  async getAdherenceStats(userId: string, medicationId: string, days: number = 7) {
    try {
      const medications = await this.getMedications(userId);
      const medication = medications.find((m) => m.id === medicationId);

      if (!medication) {
        return null;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentRecords = medication.adherenceHistory.filter(
        (record) => new Date(record.date) >= cutoffDate
      );

      const taken = recentRecords.filter((r) => r.taken).length;
      const total = recentRecords.length;
      const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

      return {
        taken,
        total,
        percentage,
        days,
      };
    } catch (error) {
      throw new Error(`Failed to get adherence stats: ${error}`);
    }
  }

  private async cacheMedication(userId: string, medication: IMedicationSchedule): Promise<void> {
    try {
      const medications = await this.getCachedMedications(userId);
      const index = medications.findIndex((m) => m.id === medication.id);

      if (index !== -1) {
        medications[index] = medication;
      } else {
        medications.push(medication);
      }

      await AsyncStorage.setItem(
        `${MEDICATIONS_CACHE_KEY}_${userId}`,
        JSON.stringify(medications)
      );
    } catch (error) {
      console.error('Failed to cache medication:', error);
    }
  }

  private async removeCachedMedication(userId: string, medicationId: string): Promise<void> {
    try {
      const medications = await this.getCachedMedications(userId);
      const filtered = medications.filter((m) => m.id !== medicationId);
      await AsyncStorage.setItem(
        `${MEDICATIONS_CACHE_KEY}_${userId}`,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error('Failed to remove cached medication:', error);
    }
  }

  private async getCachedMedications(userId: string): Promise<IMedicationSchedule[]> {
    try {
      const cached = await AsyncStorage.getItem(`${MEDICATIONS_CACHE_KEY}_${userId}`);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached medications:', error);
      return [];
    }
  }
}

export const medicationService = new MedicationService();
