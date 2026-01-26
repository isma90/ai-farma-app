import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { setPharmacies, setOnDutyPharmacies, setLoading, setError } from '@redux/slices/pharmacySlice';
import { pharmacyService } from '@services/PharmacyService';
import { IPharmacy, ILocation } from '@types/index';

export const usePharmacies = (location?: ILocation) => {
  const dispatch = useDispatch();
  const { pharmacies, onDutyIds, isLoading, error } = useSelector(
    (state: RootState) => state.pharmacy
  );
  const [nearby, setNearby] = useState<IPharmacy[]>([]);

  const fetchPharmacies = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const data = await pharmacyService.fetchPharmacies();
      dispatch(setPharmacies(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pharmacies';
      dispatch(setError(errorMessage));
    }
  }, [dispatch]);

  const fetchOnDutyPharmacies = useCallback(async () => {
    try {
      const data = await pharmacyService.fetchOnDutyPharmacies();
      dispatch(setOnDutyPharmacies(data));
    } catch (err) {
      console.error('Failed to fetch on-duty pharmacies:', err);
    }
  }, [dispatch]);

  const getPharmaciesNearby = useCallback(async (loc: ILocation, radiusKm: number = 5) => {
    dispatch(setLoading(true));
    try {
      const data = await pharmacyService.getPharmaciesNearby(loc, radiusKm);
      setNearby(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get nearby pharmacies';
      dispatch(setError(errorMessage));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const searchPharmacies = useCallback(async (query: string) => {
    dispatch(setLoading(true));
    try {
      const data = await pharmacyService.searchPharmacies(query);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search pharmacies';
      dispatch(setError(errorMessage));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const getPharmacy = useCallback(async (id: string) => {
    try {
      return await pharmacyService.getPharmacyById(id);
    } catch (err) {
      console.error('Failed to get pharmacy:', err);
      return null;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPharmacies();
    fetchOnDutyPharmacies();
  }, [fetchPharmacies, fetchOnDutyPharmacies]);

  // Get nearby pharmacies when location changes
  useEffect(() => {
    if (location) {
      getPharmaciesNearby(location);
    }
  }, [location, getPharmaciesNearby]);

  // Enrich pharmacies with on-duty status
  const enrichedPharmacies = pharmacies.map((pharmacy) => ({
    ...pharmacy,
    isOnDutyToday: onDutyIds.includes(pharmacy.id),
  }));

  return {
    pharmacies: enrichedPharmacies,
    nearby,
    isLoading,
    error,
    fetchPharmacies,
    fetchOnDutyPharmacies,
    getPharmaciesNearby,
    searchPharmacies,
    getPharmacy,
  };
};
