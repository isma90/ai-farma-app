/**
 * Root Navigator
 * Main navigation structure for the app
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChatScreen, ConversationsScreen, MedicationScreen } from '@screens/index';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Chat Stack Navigator
 */
function ChatStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="ConversationsList"
        component={ConversationsScreen}
        options={{ title: 'Conversaciones' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Chat',
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Medication Stack Navigator
 */
function MedicationStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MedicationList"
        component={MedicationScreen}
        options={{ title: 'Medicamentos' }}
      />
    </Stack.Navigator>
  );
}

/**
 * Bottom Tab Navigator
 */
export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          borderTopColor: '#E5E5EA',
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{
          title: 'Chat',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => {
            return <Text style={{ color, fontSize: size }}>💬</Text>;
          },
        }}
      />
      <Tab.Screen
        name="MedicationTab"
        component={MedicationStackNavigator}
        options={{
          title: 'Medicamentos',
          tabBarLabel: 'Medicamentos',
          tabBarIcon: ({ color, size }) => {
            return <Text style={{ color, fontSize: size }}>💊</Text>;
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default RootNavigator;

// Import Text for icons
import { Text } from 'react-native';
