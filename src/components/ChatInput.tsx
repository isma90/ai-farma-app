/**
 * ChatInput Component
 * Text input field for sending messages
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MESSAGE_MAX_LENGTH } from '@utils/constants';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  loading,
  disabled,
  placeholder = 'Escribe un mensaje...',
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed.length === 0 || trimmed.length > MESSAGE_MAX_LENGTH) {
      return;
    }
    onSend(trimmed);
    setText('');
  };

  const charCount = text.length;
  const isOverLimit = charCount > MESSAGE_MAX_LENGTH;
  const isEmpty = text.trim().length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={MESSAGE_MAX_LENGTH}
          editable={!disabled && !loading}
          testID="chat-input"
        />
        <Text
          style={[
            styles.charCount,
            isOverLimit ? styles.charCountError : styles.charCountNormal,
          ]}
        >
          {charCount}/{MESSAGE_MAX_LENGTH}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.sendButton,
          (isEmpty || isOverLimit || disabled || loading) && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={isEmpty || isOverLimit || disabled || loading}
        testID="send-button"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.sendButtonText}>Enviar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },
  input: {
    fontSize: 16,
    color: '#000000',
    maxHeight: 100,
  },
  charCount: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    fontSize: 12,
  },
  charCountNormal: {
    color: '#999999',
  },
  charCountError: {
    color: '#FF3B30',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
