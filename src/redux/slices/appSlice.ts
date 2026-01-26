import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAppState } from '@types/index';

const initialState: IAppState = {
  isOnline: true,
  appVersion: '1.0.0',
  locale: 'es',
  theme: 'light',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setLocale: (state, action: PayloadAction<'es' | 'en'>) => {
      state.locale = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setAppVersion: (state, action: PayloadAction<string>) => {
      state.appVersion = action.payload;
    },
  },
});

export const { setOnlineStatus, setLocale, setTheme, setAppVersion } = appSlice.actions;
export default appSlice.reducer;
