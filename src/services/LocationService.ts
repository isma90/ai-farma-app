import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ILocation } from '@types/index';

const LOCATION_CACHE_KEY = 'last_known_location';
const LOCATION_CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

class LocationService {
  private lastLocation: ILocation | null = null;
  private locationWatcher: Location.LocationSubscription | null = null;

  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request location permission:', error);
      return false;
    }
  }

  async getLocation(): Promise<ILocation> {
    try {
      const permission = await Location.getForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw new Error('Location permission denied');
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const result: ILocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };

      this.lastLocation = result;
      await this.cacheLocation(result);

      return result;
    } catch (error) {
      // Try to return cached location
      const cached = await this.getCachedLocation();
      if (cached) {
        return cached;
      }
      throw new Error(`Failed to get location: ${error}`);
    }
  }

  async startLocationWatcher(
    onLocationUpdate: (location: ILocation) => void,
    minDisplacementMeters: number = 500
  ): Promise<void> {
    try {
      const permission = await Location.getForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        throw new Error('Location permission denied');
      }

      this.locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: minDisplacementMeters,
        },
        (location) => {
          const newLocation: ILocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
          };

          this.lastLocation = newLocation;
          onLocationUpdate(newLocation);
        }
      );
    } catch (error) {
      console.error('Failed to start location watcher:', error);
      throw error;
    }
  }

  stopLocationWatcher(): void {
    if (this.locationWatcher) {
      this.locationWatcher.remove();
      this.locationWatcher = null;
    }
  }

  private async cacheLocation(location: ILocation): Promise<void> {
    try {
      const cacheData = {
        location,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache location:', error);
    }
  }

  private async getCachedLocation(): Promise<ILocation | null> {
    try {
      const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;

      if (age > LOCATION_CACHE_EXPIRY_MS) {
        await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
        return null;
      }

      return cacheData.location as ILocation;
    } catch (error) {
      console.error('Failed to get cached location:', error);
      return null;
    }
  }

  calculateDistance(loc1: ILocation, loc2: ILocation): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(loc2.latitude - loc1.latitude);
    const dLon = this.toRad(loc2.longitude - loc1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(loc1.latitude)) *
        Math.cos(this.toRad(loc2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  getLastLocation(): ILocation | null {
    return this.lastLocation;
  }
}

export const locationService = new LocationService();
