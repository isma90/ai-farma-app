/**
 * PharmacyService: Manages pharmacy locator data
 * Stub implementation - full implementation in development
 */

export interface Pharmacy {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  distance?: number;
}

class PharmacyService {
  async searchPharmacies(latitude: number, longitude: number, radius: number = 5000): Promise<Pharmacy[]> {
    console.log('[PharmacyService] Searching pharmacies near', { latitude, longitude }, 'radius:', radius);
    return [];
  }

  async getPharmacyDetails(pharmacyId: string): Promise<Pharmacy | null> {
    console.log('[PharmacyService] Getting pharmacy details:', pharmacyId);
    return null;
  }

  async getPharmaciesNearby(latitude: number, longitude: number, radius?: number): Promise<Pharmacy[]> {
    console.log('[PharmacyService] Getting nearby pharmacies:', { latitude, longitude }, 'radius:', radius);
    return [];
  }
}

export const pharmacyService = new PharmacyService();
