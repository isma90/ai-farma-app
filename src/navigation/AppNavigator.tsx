import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HomeScreen } from '@screens/app/HomeScreen';
import { PharmacyMapScreen } from '@screens/app/PharmacyMapScreen';
import { PharmacyListScreen } from '@screens/app/PharmacyListScreen';
import { PharmacyDetailScreen } from '@screens/app/PharmacyDetailScreen';
import { ChatScreen } from '@screens/app/ChatScreen';
import { MedicationScreen } from '@screens/app/MedicationScreen';
import { AddMedicationScreen } from '@screens/app/AddMedicationScreen';
import { SettingsScreen } from '@screens/app/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const PharmacyStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="PharmacyMap"
        component={PharmacyMapScreen}
        options={{ title: 'Mapa de Farmacias' }}
      />
      <Stack.Screen
        name="PharmacyList"
        component={PharmacyListScreen}
        options={{ title: 'Farmacias Cercanas' }}
      />
      <Stack.Screen
        name="PharmacyDetail"
        component={PharmacyDetailScreen}
        options={({ route }: any) => ({
          title: 'Detalles de Farmacia',
          headerBackTitle: 'Atrás',
        })}
      />
    </Stack.Navigator>
  );
};

const MedicationStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="MedicationList"
        component={MedicationScreen}
        options={{ title: 'Mis Medicinas' }}
      />
      <Stack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={{
          title: 'Agregar Medicina',
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'help-circle';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Pharmacy') {
            iconName = focused ? 'hospital-box' : 'hospital-box-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chat' : 'chat-outline';
          } else if (route.name === 'Medications') {
            iconName = focused ? 'pill' : 'pill-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999999',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
        }}
      />
      <Tab.Screen
        name="Pharmacy"
        component={PharmacyStack}
        options={{
          title: 'Farmacias',
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'IA',
        }}
      />
      <Tab.Screen
        name="Medications"
        component={MedicationStack}
        options={{
          title: 'Medicinas',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configuración',
        }}
      />
    </Tab.Navigator>
  );
};
