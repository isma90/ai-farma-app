import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPharmacy, IOnDutyPharmacy, ILocation } from '@types/index';
import { locationService } from '@services/LocationService';

const MINSAL_PHARMACIES_URL = 'https://midas.minsal.cl/farmacia_v2/WS/getLocales.php';
const MINSAL_ONDUTY_URL = 'https://midas.minsal.cl/farmacia_v2/WS/getLocalesTurnos.php';

const PHARMACIES_CACHE_KEY = 'pharmacies_cache';
const ONDUTY_CACHE_KEY = 'onduty_cache';
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days for pharmacies
const ONDUTY_CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour for on-duty

class PharmacyService {
  async fetchPharmacies(): Promise<IPharmacy[]> {
    try {
      // Try to get from cache first
      const cached = await this.getCachedPharmacies();
      if (cached && cached.length > 0) {
        return cached;
      }

      // Fetch from API
      const response = await axios.get(MINSAL_PHARMACIES_URL, {
        timeout: 10000,
      });

      const pharmacies = this.parsePharmaciesResponse(response.data);
      await this.cachePharmacies(pharmacies);

      return pharmacies;
    } catch (error) {
      console.error('Failed to fetch pharmacies:', error);
      // Return cached data even if expired
      const cached = await this.getCachedPharmaciesIgnoringExpiry();
      if (cached) return cached;
      throw error;
    }
  }

  async fetchOnDutyPharmacies(date?: string): Promise<string[]> {
    try {
      const queryDate = date || new Date().toISOString().split('T')[0];

      // Try to get from cache first
      const cached = await this.getCachedOnDuty();
      if (cached && cached.date === queryDate) {
        return cached.pharmacyIds;
      }

      // Fetch from API
      const response = await axios.get(MINSAL_ONDUTY_URL, {
        params: { fecha: queryDate },
        timeout: 10000,
      });

      const pharmacyIds = this.parseOnDutyResponse(response.data);
      await this.cacheOnDuty({
        id: queryDate,
        date: queryDate,
        pharmacyIds,
      });

      return pharmacyIds;
    } catch (error) {
      console.error('Failed to fetch on-duty pharmacies:', error);
      const cached = await this.getCachedOnDutyIgnoringExpiry();
      if (cached) return cached.pharmacyIds;
      throw error;
    }
  }

  async getPharmaciesNearby(location: ILocation, radiusKm: number = 5): Promise<IPharmacy[]> {
    const pharmacies = await this.fetchPharmacies();
    const onDutyIds = await this.fetchOnDutyPharmacies();

    return pharmacies
      .map((pharmacy) => ({
        ...pharmacy,
        distanceKm: locationService.calculateDistance(location, {
          latitude: pharmacy.latitud,
          longitude: pharmacy.longitud,
        }),
        isOnDutyToday: onDutyIds.includes(pharmacy.id),
      }))
      .filter((pharmacy) => pharmacy.distanceKm <= radiusKm)
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }

  async searchPharmacies(query: string): Promise<IPharmacy[]> {
    const pharmacies = await this.fetchPharmacies();
    const lowercaseQuery = query.toLowerCase();

    return pharmacies.filter(
      (pharmacy) =>
        pharmacy.nombre.toLowerCase().includes(lowercaseQuery) ||
        pharmacy.direccion.toLowerCase().includes(lowercaseQuery) ||
        pharmacy.comuna.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getPharmacyById(id: string): Promise<IPharmacy | null> {
    const pharmacies = await this.fetchPharmacies();
    return pharmacies.find((p) => p.id === id) || null;
  }

  private parsePharmaciesResponse(data: unknown): IPharmacy[] {
    try {
      // Handle various response formats
      const pharmacyList = Array.isArray(data) ? data : (data as Record<string, unknown>)?.data || [];

      return pharmacyList
        .map((item: unknown) => {
          const p = item as Record<string, unknown>;
          return {
            id: String(p.id || p.codigo_farmacia || ''),
            nombre: String(p.nombre || p.nombre_farmacia || ''),
            direccion: String(p.direccion || ''),
            comuna: String(p.comuna || ''),
            region: String(p.region || ''),
            latitud: Number(p.latitud || 0),
            longitud: Number(p.longitud || 0),
            telefono: p.telefono ? String(p.telefono) : undefined,
            horario: p.horario ? String(p.horario) : undefined,
            servicios: p.servicios ? (Array.isArray(p.servicios) ? p.servicios : []) : undefined,
          };
        })
        .filter((p): p is IPharmacy => p.id && p.nombre && p.latitud !== 0 && p.longitud !== 0);
    } catch (error) {
      console.error('Failed to parse pharmacies response:', error);
      return [];
    }
  }

  private parseOnDutyResponse(data: unknown): string[] {
    try {
      const onDutyList = Array.isArray(data) ? data : (data as Record<string, unknown>)?.data || [];

      return onDutyList
        .map((item: unknown) => {
          const p = item as Record<string, unknown>;
          return String(p.id || p.codigo_farmacia || '');
        })
        .filter((id) => id !== '');
    } catch (error) {
      console.error('Failed to parse on-duty response:', error);
      return [];
    }
  }

  private async cachePharmacies(pharmacies: IPharmacy[]): Promise<void> {
    try {
      const cacheData = {
        data: pharmacies,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(PHARMACIES_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache pharmacies:', error);
    }
  }

  private async getCachedPharmacies(): Promise<IPharmacy[] | null> {
    try {
      const cached = await AsyncStorage.getItem(PHARMACIES_CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;

      if (age > CACHE_EXPIRY_MS) {
        return null;
      }

      return cacheData.data || null;
    } catch (error) {
      console.error('Failed to get cached pharmacies:', error);
      return null;
    }
  }

  private async getCachedPharmaciesIgnoringExpiry(): Promise<IPharmacy[] | null> {
    try {
      const cached = await AsyncStorage.getItem(PHARMACIES_CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      return cacheData.data || null;
    } catch (error) {
      console.error('Failed to get cached pharmacies:', error);
      return null;
    }
  }

  private async cacheOnDuty(data: IOnDutyPharmacy): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(ONDUTY_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache on-duty data:', error);
    }
  }

  private async getCachedOnDuty(): Promise<IOnDutyPharmacy | null> {
    try {
      const cached = await AsyncStorage.getItem(ONDUTY_CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;

      if (age > ONDUTY_CACHE_EXPIRY_MS) {
        return null;
      }

      return cacheData.data || null;
    } catch (error) {
      console.error('Failed to get cached on-duty data:', error);
      return null;
    }
  }

  private async getCachedOnDutyIgnoringExpiry(): Promise<IOnDutyPharmacy | null> {
    try {
      const cached = await AsyncStorage.getItem(ONDUTY_CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      return cacheData.data || null;
    } catch (error) {
      console.error('Failed to get cached on-duty data:', error);
      return null;
    }
  }
}

export const pharmacyService = new PharmacyService();
