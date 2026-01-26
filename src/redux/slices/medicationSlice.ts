import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IMedicationSchedule } from '@types/index';

interface MedicationState {
  medications: IMedicationSchedule[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MedicationState = {
  medications: [],
  isLoading: false,
  error: null,
};

const medicationSlice = createSlice({
  name: 'medication',
  initialState,
  reducers: {
    setMedications: (state, action: PayloadAction<IMedicationSchedule[]>) => {
      state.medications = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addMedication: (state, action: PayloadAction<IMedicationSchedule>) => {
      state.medications.push(action.payload);
    },
    updateMedication: (state, action: PayloadAction<IMedicationSchedule>) => {
      const index = state.medications.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.medications[index] = action.payload;
      }
    },
    removeMedication: (state, action: PayloadAction<string>) => {
      state.medications = state.medications.filter((m) => m.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setMedications, addMedication, updateMedication, removeMedication, setLoading, setError } =
  medicationSlice.actions;

export default medicationSlice.reducer;
