import { useState, useEffect, useCallback } from 'react';
import { ILocation } from '@types/index';
import { locationService } from '@services/LocationService';

export const useUserLocation = (autoStart: boolean = true) => {
  const [location, setLocation] = useState<ILocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loc = await locationService.getLocation();
      setLocation(loc);
      return loc;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.error('Location error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startWatching = useCallback(
    async (minDisplacementMeters?: number) => {
      try {
        await locationService.startLocationWatcher((newLocation) => {
          setLocation(newLocation);
        }, minDisplacementMeters);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to watch location';
        setError(errorMessage);
      }
    },
    []
  );

  const stopWatching = useCallback(() => {
    locationService.stopLocationWatcher();
  }, []);

  useEffect(() => {
    if (autoStart) {
      getLocation();
    }

    return () => {
      stopWatching();
    };
  }, [autoStart, getLocation, stopWatching]);

  return {
    location,
    isLoading,
    error,
    getLocation,
    startWatching,
    stopWatching,
  };
};
