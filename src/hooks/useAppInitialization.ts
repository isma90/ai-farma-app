import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setOnlineStatus } from '@redux/slices/appSlice';
import { setUser, setAnonymousUser, setError } from '@redux/slices/authSlice';
import { authService } from '@services/AuthService';
import NetInfo from '@react-native-community/netinfo';

export const useAppInitialization = () => {
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check network status
      const netInfo = await NetInfo.fetch();
      dispatch(setOnlineStatus(netInfo.isConnected ?? true));

      // Subscribe to network changes
      const unsubscribe = NetInfo.addEventListener((state) => {
        dispatch(setOnlineStatus(state.isConnected ?? true));
      });

      // Initialize authentication
      await initializeAuth();

      setIsReady(true);

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      dispatch(setError('Failed to initialize app'));
      setIsReady(true); // Allow app to continue even if init fails
    }
  };

  const initializeAuth = async () => {
    try {
      const user = await authService.getCurrentUser();

      if (user) {
        if (authService.isCurrentUserAnonymous()) {
          dispatch(setAnonymousUser(user));
        } else {
          dispatch(setUser(user));
        }
      } else {
        // Sign in anonymously if no user
        const anonUser = await authService.signInAnonymously();
        dispatch(setAnonymousUser(anonUser));
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Try anonymous auth as fallback
      try {
        const anonUser = await authService.signInAnonymously();
        dispatch(setAnonymousUser(anonUser));
      } catch (anonError) {
        dispatch(setError('Failed to initialize authentication'));
      }
    }
  };

  return { isReady };
};
