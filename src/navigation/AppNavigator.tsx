import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Screens
import ChatScreen from '../screens/app/ChatScreen';
import ConversationHistoryScreen from '../screens/app/ConversationHistoryScreen';
import PharmacyListScreen from '../screens/app/PharmacyListScreen';
import SettingsScreen from '../screens/app/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Chat Stack Navigator
 */
function ChatStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Atrás',
      }}
    >
      <Stack.Screen
        name="ConversationHistory"
        component={ConversationHistoryScreen}
        options={{
          title: 'Mis Conversaciones',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Chat',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Pharmacy Stack Navigator
 */
function PharmacyStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Atrás',
      }}
    >
      <Stack.Screen
        name="PharmacyList"
        component={PharmacyListScreen}
        options={{
          title: 'Farmacias Cercanas',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Settings Stack Navigator
 */
function SettingsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configuración',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Main App Navigator with Bottom Tabs
 */
export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          borderTopColor: '#E5E5EA',
          borderTopWidth: 1,
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{
          title: 'Chat',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="PharmacyTab"
        component={PharmacyStackNavigator}
        options={{
          title: 'Farmacias',
          tabBarLabel: 'Farmacias',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏥</Text>,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          title: 'Ajustes',
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default AppNavigator;
