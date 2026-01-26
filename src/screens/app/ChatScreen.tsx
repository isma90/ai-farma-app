import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { COLORS } from '@constants/app';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

export const ChatScreen = () => {
  const { isOnline } = useSelector((state: RootState) => state.app);
  const { user } = useSelector((state: RootState) => state.auth);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hola 👋 Soy tu asistente farmacéutico. Puedo ayudarte con preguntas sobre medicamentos, farmacias y adherencia a tratamientos. ¿En qué puedo ayudarte?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    if (!isOnline) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: 'No tienes conexión a internet. El asistente requiere conexión para responder.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([...messages, errorMessage]);
      setInputText('');
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response (Phase 2: integrate with Claude/OpenAI)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Gracias por tu pregunta. En esta versión, el asistente está en fase de desarrollo. Pronto podré brindarte información completa sobre medicamentos, interacciones, y recomendaciones personalizadas. 🚀',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.sender === 'user' ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
          ]}
        >
          {item.text}
        </Text>
        {item.isLoading && (
          <ActivityIndicator
            size="small"
            color={item.sender === 'user' ? COLORS.WHITE : COLORS.PRIMARY}
            style={styles.loadingIndicator}
          />
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {!isOnline && (
        <View style={styles.offlineNotice}>
          <MaterialCommunityIcons
            name="wifi-off"
            size={16}
            color={COLORS.WARNING}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.offlineText}>Sin conexión - El chat no funcionará</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onEndReached={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onEndReachedThreshold={0.1}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu pregunta..."
          placeholderTextColor={COLORS.LIGHT_GRAY}
          value={inputText}
          onChangeText={setInputText}
          editable={!isLoading && isOnline}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!isOnline || isLoading || !inputText.trim()) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!isOnline || isLoading || !inputText.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.WHITE} />
          ) : (
            <MaterialCommunityIcons name="send" size={20} color={COLORS.WHITE} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  offlineNotice: {
    backgroundColor: COLORS.WARNING,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  offlineText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: COLORS.PRIMARY,
  },
  aiBubble: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.WHITE,
  },
  aiMessageText: {
    color: COLORS.DARK_GRAY,
  },
  loadingIndicator: {
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_GRAY,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 8,
    color: COLORS.DARK_GRAY,
  },
  sendButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 50,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
