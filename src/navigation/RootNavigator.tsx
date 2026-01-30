import React from 'react';
import AppNavigator from './AppNavigator';

/**
 * RootNavigator: Root-level navigation
 * Directly renders AppNavigator (no authentication required)
 */
export default function RootNavigator() {
  return <AppNavigator />;
}
