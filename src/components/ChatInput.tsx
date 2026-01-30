import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MAX_CHARACTERS = 500;

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  loading?: boolean;
}

/**
 * ChatInput: Text input for sending messages
 * - Character limit validation (500 chars max)
 * - Send button
 * - Loading state
 * - Multiline support
 */
export default function ChatInput({ onSendMessage, loading = false }: ChatInputProps) {
  const [text, setText] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || localLoading || loading) {
      return;
    }

    const messageText = text.trim();
    setText('');

    setLocalLoading(true);
    try {
      await onSendMessage(messageText);
    } catch (error) {
      console.error('[ChatInput] Send error:', error);
      // Re-populate text if sending failed
      setText(messageText);
    } finally {
      setLocalLoading(false);
    }
  };

  const isDisabled = !text.trim() || localLoading || loading;
  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARACTERS;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, isOverLimit && styles.inputOverLimit]}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          multiline
          maxLength={MAX_CHARACTERS}
          editable={!loading && !localLoading}
          placeholderTextColor="#999"
        />
        <Text style={[styles.charCount, isOverLimit && styles.charCountOverLimit]}>
          {charCount}/{MAX_CHARACTERS}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={isDisabled}
      >
        {localLoading || loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons name="send" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F5F5F5',
  },
  input: {
    fontSize: 14,
    maxHeight: 100,
    minHeight: 36,
    paddingVertical: 8,
  },
  inputOverLimit: {
    color: '#f44336',
  },
  charCount: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    paddingVertical: 2,
  },
  charCountOverLimit: {
    color: '#f44336',
  },
  sendButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
});
