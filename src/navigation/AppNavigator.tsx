import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/app/HomeScreen';
import ChatScreen from '../screens/app/ChatScreen';
import PharmacyListScreen from '../screens/app/PharmacyListScreen';
import PharmacyMapScreen from '../screens/app/PharmacyMapScreen';
import PharmacyDetailScreen from '../screens/app/PharmacyDetailScreen';
import MedicationScreen from '../screens/app/MedicationScreen';
import AddMedicationScreen from '../screens/app/AddMedicationScreen';
import MedicationDetailScreen from '../screens/app/MedicationDetailScreen';
import SettingsScreen from '../screens/app/SettingsScreen';
import ConversationHistoryScreen from '../screens/app/ConversationHistoryScreen';

// Type definitions
export type AppTabParamList = {
  HomeStack: undefined;
  PharmacyStack: undefined;
  ChatStack: undefined;
  MedicationStack: undefined;
  SettingsStack: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type PharmacyStackParamList = {
  PharmacyList: undefined;
  PharmacyMap: undefined;
  PharmacyDetail: { pharmacyId: string };
};

export type ChatStackParamList = {
  ChatScreen: undefined;
  ConversationHistory: undefined;
};

export type MedicationStackParamList = {
  MedicationList: undefined;
  AddMedication: undefined;
  MedicationDetail: { medicationId: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const PharmacyStack = createNativeStackNavigator<PharmacyStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const MedicationStack = createNativeStackNavigator<MedicationStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

// Home Stack Navigator
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Home',
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

// Pharmacy Stack Navigator
function PharmacyStackNavigator() {
  return (
    <PharmacyStack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <PharmacyStack.Screen
        name="PharmacyList"
        component={PharmacyListScreen}
        options={{ headerTitle: 'Pharmacies' }}
      />
      <PharmacyStack.Screen
        name="PharmacyMap"
        component={PharmacyMapScreen}
        options={{ headerTitle: 'Map' }}
      />
      <PharmacyStack.Screen
        name="PharmacyDetail"
        component={PharmacyDetailScreen}
        options={{ headerTitle: 'Pharmacy Details' }}
      />
    </PharmacyStack.Navigator>
  );
}

// Chat Stack Navigator
function ChatStackNavigator() {
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <ChatStack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ headerTitle: 'AI Assistant' }}
      />
      <ChatStack.Screen
        name="ConversationHistory"
        component={ConversationHistoryScreen}
        options={{ headerTitle: 'Conversations' }}
      />
    </ChatStack.Navigator>
  );
}

// Medication Stack Navigator
function MedicationStackNavigator() {
  return (
    <MedicationStack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <MedicationStack.Screen
        name="MedicationList"
        component={MedicationScreen}
        options={{ headerTitle: 'Medications' }}
      />
      <MedicationStack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={{ headerTitle: 'Add Medication' }}
      />
      <MedicationStack.Screen
        name="MedicationDetail"
        component={MedicationDetailScreen}
        options={{ headerTitle: 'Medication Details' }}
      />
    </MedicationStack.Navigator>
  );
}

// Settings Stack Navigator
function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Settings',
      }}
    >
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

/**
 * AppNavigator: Main app navigation with 5 bottom tabs
 * - Home: Dashboard
 * - Pharmacy: Find pharmacies
 * - Chat: AI Assistant
 * - Medications: Manage medications
 * - Settings: User settings
 */
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'HomeStack':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'PharmacyStack':
              iconName = focused ? 'location' : 'location-outline';
              break;
            case 'ChatStack':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'MedicationStack':
              iconName = focused ? 'medical' : 'medical-outline';
              break;
            case 'SettingsStack':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#888888',
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -5,
        },
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="PharmacyStack"
        component={PharmacyStackNavigator}
        options={{
          tabBarLabel: 'Pharmacy',
        }}
      />
      <Tab.Screen
        name="ChatStack"
        component={ChatStackNavigator}
        options={{
          tabBarLabel: 'Chat',
        }}
      />
      <Tab.Screen
        name="MedicationStack"
        component={MedicationStackNavigator}
        options={{
          tabBarLabel: 'Meds',
        }}
      />
      <Tab.Screen
        name="SettingsStack"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}
