import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ChatStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<ChatStackParamList, 'ConversationHistory'>;

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
}

// Mock conversation data
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    title: 'Medication Interaction Questions',
    preview: 'Can I take ibuprofen with my blood pressure medication?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    messageCount: 8,
  },
  {
    id: '2',
    title: 'Pharmacy Recommendations',
    preview: 'Which pharmacy is open 24 hours near my location?',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    messageCount: 5,
  },
  {
    id: '3',
    title: 'Side Effects Discussion',
    preview: 'Is dizziness a common side effect of this medication?',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    messageCount: 12,
  },
];

/**
 * ConversationHistoryScreen: Display chat conversation history
 * - List of past conversations
 * - Resume conversation option
 * - Delete conversation option
 */
export default function ConversationHistoryScreen({ navigation }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const loadConversations = async () => {
    try {
      setLoading(true);
      // For now, using mock data. Replace with real API call later
      setConversations(MOCK_CONVERSATIONS);
    } catch (err: any) {
      console.error('[ConversationHistoryScreen] Load error:', err);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadConversations();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleDeleteConversation = (id: string) => {
    Alert.alert('Delete Conversation', 'Are you sure you want to delete this conversation?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => {
          setConversations((prev) => prev.filter((c) => c.id !== id));
        },
        style: 'destructive',
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Conversations',
      'This will permanently delete all conversations. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          onPress: () => {
            setConversations([]);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderConversation = useCallback(({ item }: { item: Conversation }) => {
    const timeAgo = getTimeAgo(item.timestamp);

    return (
      <TouchableOpacity style={styles.conversationCard} onPress={() => {}}>
        <View style={styles.cardContent}>
          <Text style={styles.conversationTitle}>{item.title}</Text>
          <Text style={styles.conversationPreview} numberOfLines={2}>
            {item.preview}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.conversationTime}>{timeAgo}</Text>
            <Text style={styles.messageCount}>{item.messageCount} messages</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteConversation(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#f44336" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Conversations Yet</Text>
          <Text style={styles.emptyText}>Start chatting with AI Assistant to begin</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => {
              navigation.navigate('ChatScreen');
            }}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#fff" />
            <Text style={styles.startButtonText}>Start New Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListHeaderComponent={
              <View style={styles.header}>
                <Text style={styles.headerText}>Conversation History</Text>
                <Text style={styles.headerSubtext}>{conversations.length} conversations</Text>
              </View>
            }
          />

          {conversations.length > 0 && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleClearAll}
            >
              <Ionicons name="trash-outline" size={16} color="#f44336" />
              <Text style={styles.clearAllButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationTime: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  messageCount: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 16,
    gap: 8,
  },
  clearAllButtonText: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: '600',
  },
});
