import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAuthState, IUserProfile } from '@types/index';

const initialState: IAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isAnonymous: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUserProfile>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isAnonymous = !action.payload.email;
      state.isLoading = false;
      state.error = null;
    },
    setAnonymousUser: (state, action: PayloadAction<IUserProfile>) => {
      state.user = action.payload;
      state.isAuthenticated = false;
      state.isAnonymous = true;
      state.isLoading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAnonymous = false;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<IUserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setUser, setAnonymousUser, clearUser, setLoading, setError, updateUserProfile } =
  authSlice.actions;
export default authSlice.reducer;
