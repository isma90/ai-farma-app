import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import * as Notifications from 'expo-notifications';
import * as Sentry from 'sentry-react-native';

import { store } from '@redux/store';
import { RootNavigator } from '@navigation/RootNavigator';
import { useAppInitialization } from '@hooks/useAppInitialization';

// Initialize Sentry
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_ENV || 'development',
  tracesSampleRate: 1.0,
});

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const AppContent = () => {
  const { isReady } = useAppInitialization();

  if (!isReady) {
    return null; // Show splash screen while initializing
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <AppContent />
      </PaperProvider>
    </ReduxProvider>
  );
};

export default Sentry.wrap(App);
