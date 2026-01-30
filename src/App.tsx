import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View } from 'react-native';

import RootNavigator from './navigation/RootNavigator';

/**
 * Main App component
 * - Initializes Firebase
 * - Sets up NavigationContainer
 * - Manages auth state
 * - Renders RootNavigator for conditional auth/app navigation
 */
export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Firebase and check auth state
    const initializeApp = async () => {
      try {
        // Firebase initialization happens in services/AuthService
        // Just mark loading as complete
        setIsLoading(false);
      } catch (error) {
        console.error('[App] Initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
