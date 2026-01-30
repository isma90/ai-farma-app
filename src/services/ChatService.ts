/**
 * Chat Service
 * Manages chat operations, conversation history, and backend integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatApiClient } from './api/chatApiClient';
import {
  IBackendChatResponse,
  IConversationData,
  ChatHistory,
  SendMessageParams,
  APIError,
} from '@types/index';

class ChatService {
  private conversationKey = 'ai_farma_conversations';
  private currentConversationKey = 'ai_farma_current_conversation';

  /**
   * Send a message to the backend and get LLM response
   */
  async sendMessage(
    user_id: string,
    conversation_id: string,
    message: string
  ): Promise<IBackendChatResponse> {
    // Validate message
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0 || trimmedMessage.length > 500) {
      throw {
        status: 400,
        message: 'Message must be between 1 and 500 characters',
        code: 'VALIDATION_ERROR',
      } as APIError;
    }

    try {
      const response = await chatApiClient.sendMessage({
        user_id,
        conversation_id,
        message: trimmedMessage,
      });

      // Store message locally for offline support
      await this.storeMessageLocally(conversation_id, {
        role: 'user',
        content: trimmedMessage,
        timestamp: new Date().toISOString(),
      });

      // Store response locally
      await this.storeMessageLocally(conversation_id, {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
      });

      // Update conversation timestamp
      await this.updateConversationTimestamp(conversation_id);

      return response;
    } catch (error) {
      console.error('[ChatService] Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get full conversation history from backend
   */
  async getConversationHistoryFromBackend(
    user_id: string,
    conversation_id: string
  ): Promise<IConversationData> {
    try {
      return await chatApiClient.getConversationHistory(user_id, conversation_id);
    } catch (error) {
      console.error('[ChatService] Error fetching conversation history:', error);
      // Fall back to local data if backend fails
      return this.getLocalConversation(conversation_id);
    }
  }

  /**
   * Get list of user conversations from backend
   */
  async getUserConversationsFromBackend(user_id: string) {
    try {
      return await chatApiClient.getUserConversations(user_id);
    } catch (error) {
      console.error('[ChatService] Error fetching conversations:', error);
      // Fall back to local data
      return this.getLocalConversations();
    }
  }

  /**
   * Delete a conversation from backend and local storage
   */
  async deleteConversation(user_id: string, conversation_id: string): Promise<void> {
    try {
      // Delete from backend first
      await chatApiClient.deleteConversation(user_id, conversation_id);
      // Delete from local storage
      const conversations = await this.getLocalConversations();
      const filtered = conversations.filter((c) => c.conversation_id !== conversation_id);
      await AsyncStorage.setItem(
        this.conversationKey,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error('[ChatService] Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Clear all conversations
   */
  async clearAllConversations(user_id: string): Promise<void> {
    try {
      // Clear from backend
      await chatApiClient.clearAllConversations(user_id);
      // Clear local storage
      await AsyncStorage.removeItem(this.conversationKey);
      await AsyncStorage.removeItem(this.currentConversationKey);
    } catch (error) {
      console.error('[ChatService] Error clearing conversations:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(user_id: string, title?: string): Promise<string> {
    const conversationId = `${user_id}_${Date.now()}`;
    const conversation = {
      conversation_id: conversationId,
      user_id,
      title: title || 'Nueva conversación',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      preview: '',
    };

    const conversations = await this.getLocalConversations();
    conversations.push(conversation as any);
    await AsyncStorage.setItem(this.conversationKey, JSON.stringify(conversations));
    await AsyncStorage.setItem(this.currentConversationKey, conversationId);

    return conversationId;
  }

  /**
   * Get current conversation ID
   */
  async getCurrentConversationId(): Promise<string | null> {
    return await AsyncStorage.getItem(this.currentConversationKey);
  }

  /**
   * Set current conversation
   */
  async setCurrentConversation(conversation_id: string): Promise<void> {
    await AsyncStorage.setItem(this.currentConversationKey, conversation_id);
  }

  // Private helper methods

  /**
   * Store message locally for offline support
   */
  private async storeMessageLocally(
    conversation_id: string,
    message: any
  ): Promise<void> {
    try {
      const storageKey = `conversation_${conversation_id}`;
      const existing = await AsyncStorage.getItem(storageKey);
      const messages = existing ? JSON.parse(existing) : [];
      messages.push(message);
      await AsyncStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('[ChatService] Error storing message locally:', error);
    }
  }

  /**
   * Get local conversation
   */
  private async getLocalConversation(conversation_id: string): Promise<IConversationData> {
    try {
      const storageKey = `conversation_${conversation_id}`;
      const data = await AsyncStorage.getItem(storageKey);
      const messages = data ? JSON.parse(data) : [];

      return {
        conversation_id,
        user_id: 'unknown',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages,
      };
    } catch (error) {
      console.error('[ChatService] Error getting local conversation:', error);
      return {
        conversation_id,
        user_id: 'unknown',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
      };
    }
  }

  /**
   * Get local conversations list
   */
  private async getLocalConversations() {
    try {
      const data = await AsyncStorage.getItem(this.conversationKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[ChatService] Error getting local conversations:', error);
      return [];
    }
  }

  /**
   * Update conversation timestamp
   */
  private async updateConversationTimestamp(conversation_id: string): Promise<void> {
    try {
      const conversations = await this.getLocalConversations();
      const index = conversations.findIndex((c: any) => c.conversation_id === conversation_id);
      if (index >= 0) {
        conversations[index].updated_at = new Date().toISOString();
        await AsyncStorage.setItem(this.conversationKey, JSON.stringify(conversations));
      }
    } catch (error) {
      console.error('[ChatService] Error updating conversation timestamp:', error);
    }
  }

  /**
   * Check backend availability
   */
  async isBackendAvailable(): Promise<boolean> {
    return await chatApiClient.healthCheck();
  }
}

// Export singleton instance
export const chatService = new ChatService();

export default ChatService;
