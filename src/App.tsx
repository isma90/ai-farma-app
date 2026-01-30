import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RootNavigator from './navigation/RootNavigator';

/**
 * Main App component
 * - Sets up NavigationContainer
 * - Renders RootNavigator (directly to AppNavigator)
 * - No authentication required
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
