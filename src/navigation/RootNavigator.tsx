import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { authService } from '../services/AuthService';

const Stack = createNativeStackNavigator();

/**
 * RootNavigator: Root-level navigation
 * Conditionally renders AuthNavigator or AppNavigator based on authentication state
 */
export default function RootNavigator() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
      setIsAuthLoading(false);
      console.log('[RootNavigator] Auth state changed:', user ? user.uid : 'none');
    });

    return unsubscribe;
  }, []);

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
