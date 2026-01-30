/**
 * Chat Service - Simplified version for MVP
 * Manages chat operations, conversation history, and backend integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatApiClient } from './api/chatApiClient';
import { generateUUID } from '../utils/uuid';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class ChatService {
  private conversationMessagesKey = 'chat_messages';
  private conversationListKey = 'chat_conversations';
  private currentConvKey = 'current_conversation';

  /**
   * Send a message and get response from backend
   */
  async sendMessage(
    text: string,
    messages: ChatMessage[],
    userId: string,
    conversationId: string
  ) {
    try {
      // Call backend
      const response = await chatApiClient.sendMessage({
        user_id: userId,
        conversation_id: conversationId,
        message: text,
      });

      return {
        text: response.response,
        toolCalls: response.tool_calls,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Load chat history for a conversation from local storage
   */
  async loadChatHistory(userId: string, conversationId: string): Promise<ChatMessage[]> {
    try {
      const key = `${this.conversationMessagesKey}_${userId}_${conversationId}`;
      const data = await AsyncStorage.getItem(key);

      if (data) {
        const messages = JSON.parse(data) as ChatMessage[];
        messages.forEach((msg) => {
          msg.timestamp = new Date(msg.timestamp);
        });
        return messages;
      }

      return [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  /**
   * Save chat messages to local storage
   */
  async saveChatHistory(
    userId: string,
    conversationId: string,
    messages: ChatMessage[]
  ): Promise<void> {
    try {
      const key = `${this.conversationMessagesKey}_${userId}_${conversationId}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  /**
   * Load all conversations for a user
   */
  async loadAllConversations(userId: string): Promise<any[]> {
    try {
      const key = `${this.conversationListKey}_${userId}`;
      const data = await AsyncStorage.getItem(key);

      if (data) {
        const conversations = JSON.parse(data);
        conversations.forEach((conv: any) => {
          conv.createdAt = new Date(conv.createdAt);
          conv.updatedAt = new Date(conv.updatedAt);
        });
        return conversations;
      }

      return [];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  /**
   * Save conversation to history
   */
  async saveConversation(userId: string, conversation: any): Promise<void> {
    try {
      const key = `${this.conversationListKey}_${userId}`;
      const conversations = await this.loadAllConversations(userId);

      const index = conversations.findIndex((c) => c.id === conversation.id);
      if (index >= 0) {
        conversations[index] = conversation;
      } else {
        conversations.unshift(conversation);
      }

      await AsyncStorage.setItem(key, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    try {
      // Delete from backend if implemented
      await chatApiClient.deleteConversation(userId, conversationId);

      // Delete from local storage
      const key = `${this.conversationListKey}_${userId}`;
      const conversations = await this.loadAllConversations(userId);
      const filtered = conversations.filter((c) => c.id !== conversationId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));

      // Delete messages
      const msgKey = `${this.conversationMessagesKey}_${userId}_${conversationId}`;
      await AsyncStorage.removeItem(msgKey);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  /**
   * Clear all conversations
   */
  async clearAllConversations(userId: string): Promise<void> {
    try {
      await chatApiClient.clearAllConversations(userId);

      const key = `${this.conversationListKey}_${userId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing conversations:', error);
    }
  }

  /**
   * Set current conversation
   */
  async setCurrentConversation(userId: string, conversationId: string): Promise<void> {
    try {
      const key = `${this.currentConvKey}_${userId}`;
      await AsyncStorage.setItem(key, conversationId);
    } catch (error) {
      console.error('Error setting current conversation:', error);
    }
  }

  /**
   * Get current conversation ID
   */
  async getCurrentConversation(userId: string): Promise<string | null> {
    try {
      const key = `${this.currentConvKey}_${userId}`;
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting current conversation:', error);
      return null;
    }
  }
}

export const chatService = new ChatService();
