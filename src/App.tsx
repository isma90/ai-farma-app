/**
 * Main App Component
 * Entry point for the AI Farma application
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { chatService } from '@services/ChatService';

// Placeholder screens (to be implemented)
const ChatScreen = () => <View />;
const ConversationsScreen = () => <View />;
const MedicationScreen = () => <View />;

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const available = await chatService.isBackendAvailable();
        setIsBackendAvailable(available);
        console.log('[App] Backend available:', available);
      } catch (error) {
        console.error('[App] Error checking backend:', error);
        setIsBackendAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkBackend();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Conversations"
          component={ConversationsScreen}
          options={{ title: 'Conversaciones' }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: 'Chat' }}
        />
        <Stack.Screen
          name="Medication"
          component={MedicationScreen}
          options={{ title: 'Medicamentos' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
