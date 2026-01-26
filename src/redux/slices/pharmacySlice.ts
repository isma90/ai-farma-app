import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPharmacy } from '@types/index';

interface PharmacyState {
  pharmacies: IPharmacy[];
  onDutyIds: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  favorites: string[];
}

const initialState: PharmacyState = {
  pharmacies: [],
  onDutyIds: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  favorites: [],
};

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState,
  reducers: {
    setPharmacies: (state, action: PayloadAction<IPharmacy[]>) => {
      state.pharmacies = action.payload;
      state.lastUpdated = new Date();
      state.isLoading = false;
      state.error = null;
    },
    setOnDutyPharmacies: (state, action: PayloadAction<string[]>) => {
      state.onDutyIds = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    addFavorite: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter((id) => id !== action.payload);
    },
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favorites = action.payload;
    },
    clearPharmacies: (state) => {
      state.pharmacies = [];
      state.onDutyIds = [];
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setPharmacies,
  setOnDutyPharmacies,
  setLoading,
  setError,
  addFavorite,
  removeFavorite,
  setFavorites,
  clearPharmacies,
} = pharmacySlice.actions;

export default pharmacySlice.reducer;
