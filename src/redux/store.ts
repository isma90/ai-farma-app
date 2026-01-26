import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@redux/slices/authSlice';
import pharmacyReducer from '@redux/slices/pharmacySlice';
import medicationReducer from '@redux/slices/medicationSlice';
import appReducer from '@redux/slices/appSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pharmacy: pharmacyReducer,
    medication: medicationReducer,
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
