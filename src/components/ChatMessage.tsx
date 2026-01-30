/**
 * ChatMessage Component
 * Displays individual chat messages with styling based on role
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  hasWarning?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  hasWarning,
}) => {
  const isUser = role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {hasWarning && <Text style={styles.warningIcon}>⚠️ </Text>}
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {content}
        </Text>
      </View>
      {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 12,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userBubble: {
    backgroundColor: '#007AFF',
    marginLeft: '20%',
  },
  assistantBubble: {
    backgroundColor: '#E5E5EA',
    marginRight: '20%',
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#000000',
  },
  warningIcon: {
    marginRight: 4,
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    marginHorizontal: 12,
  },
});
