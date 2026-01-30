import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../../navigation/AppNavigator';
import { authService } from '../../services/AuthService';
import { chatService, ChatMessage as ChatMessageType } from '../../services/ChatServiceSimple';
import ChatMessage from '../../components/ChatMessage';
import ChatInput from '../../components/ChatInput';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatScreen'>;

/**
 * ChatScreen: Main chat interface for AI medication advisor
 * - Displays conversation history
 * - Sends messages via ChatService
 * - Shows loading/error states
 * - Displays disclaimer on first access
 */
export default function ChatScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [userId, setUserId] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    // Get user or use mock user
    let user = authService.getCurrentUser();
    if (!user) {
      // Use mock user if no authenticated user
      user = {
        uid: 'user_' + Math.random().toString(36).substr(2, 9),
        email: 'guest@aifarma.local',
        displayName: 'Guest',
      };
    }

    setUserId(user.uid);
    // Generate conversation ID
    const convId = `conv_${user.uid}_${Date.now()}`;
    setConversationId(convId);

    // Add greeting message
    const greeting: ChatMessageType = {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I\'m your AI medication assistant. I can help you with medication schedules, interactions, side effects, and finding nearby pharmacies. How can I help you today?',
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!userId || !conversationId || !text.trim()) {
        return;
      }

      // Add user message to UI immediately
      const userMessage: ChatMessageType = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError('');

      try {
        // Send message via ChatService
        const response = await chatService.sendMessage(text, messages, userId, conversationId);

        // Add assistant response
        const assistantMessage: ChatMessageType = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: response.text,
          timestamp: new Date(),
          toolCalls: response.toolCalls,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        console.error('[ChatScreen] Send message error:', err);
        setError(err.message || 'Failed to send message. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [userId, conversationId, messages, chatService]
  );

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
  };

  const renderMessage = useCallback(({ item }: { item: ChatMessageType }) => <ChatMessage message={item} />, []);

  const keyExtractor = useCallback((item: ChatMessageType) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onEndReachedThreshold={0.5}
      />

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2196F3" />
          <Text style={styles.loadingText}>Assistant is thinking...</Text>
        </View>
      )}

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError('')}>
            <Text style={styles.errorDismiss}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Chat Input */}
      {disclaimerAccepted ? (
        <ChatInput onSendMessage={handleSendMessage} loading={loading} />
      ) : (
        <View style={styles.disabledInput}>
          <Text style={styles.disabledText}>Please accept the disclaimer to continue</Text>
        </View>
      )}

      {/* Disclaimer Modal */}
      <Modal
        visible={showDisclaimer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisclaimer(false)}
      >
        <View style={styles.disclaimerOverlay}>
          <View style={styles.disclaimerContent}>
            <Text style={styles.disclaimerTitle}>⚠️ Important Disclaimer</Text>

            <Text style={styles.disclaimerText}>
              This application provides information about medications and pharmacies. It does NOT replace professional medical consultation.
            </Text>

            <Text style={styles.disclaimerText}>
              Always consult with a healthcare provider before:
            </Text>
            <Text style={styles.disclaimerBullet}>• Starting or stopping medications</Text>
            <Text style={styles.disclaimerBullet}>• Changing dosages</Text>
            <Text style={styles.disclaimerBullet}>• Combining medications</Text>
            <Text style={styles.disclaimerBullet}>• If you experience serious side effects</Text>

            <Text style={styles.disclaimerText}>
              In case of emergency, call emergency services immediately.
            </Text>

            <View style={styles.disclaimerButtons}>
              <TouchableOpacity
                style={styles.disclaimerButton}
                onPress={handleDisclaimerAccept}
              >
                <Text style={styles.disclaimerButtonText}>I Understand</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    paddingVertical: 8,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  loadingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#666',
    fontSize: 13,
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderTopWidth: 1,
    borderTopColor: '#ef5350',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    flex: 1,
  },
  errorDismiss: {
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledText: {
    color: '#999',
    fontSize: 13,
  },
  disclaimerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  disclaimerContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginBottom: 12,
  },
  disclaimerBullet: {
    fontSize: 13,
    lineHeight: 18,
    color: '#555',
    marginLeft: 12,
    marginBottom: 6,
  },
  disclaimerButtons: {
    marginTop: 20,
    gap: 12,
  },
  disclaimerButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disclaimerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
