/**
 * SimplifiedChatService: Lightweight chat service wrapper
 * Provides core chat functionality without advanced state management
 * Uses backend API for message processing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '../utils/uuid';
import { chatApiClient, IBackendChatResponse } from './api/chatApiClient';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

const CHAT_HISTORY_KEY = 'chat_history';

class SimpleChatService {
  private messagesCache: Map<string, ChatMessage[]> = new Map();

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[],
    userId: string,
    conversationId: string
  ): Promise<{ text: string; toolCalls?: ToolCall[] }> {
    try {
      // Store user message
      const messages = conversationHistory || [];

      // Call backend API for AI response
      const response = await chatApiClient.sendMessage({
        user_id: userId,
        conversation_id: conversationId,
        message: userMessage,
      });

      if (!response) {
        throw new Error('No response from API');
      }

      // Save conversation history
      const updatedMessages: ChatMessage[] = [
        ...messages,
        {
          id: generateUUID(),
          role: 'user',
          content: userMessage,
          timestamp: new Date(),
        } as ChatMessage,
        {
          id: generateUUID(),
          role: 'assistant',
          content: response.response || 'I could not generate a response.',
          timestamp: new Date(),
          toolCalls: (response.tool_calls || []) as unknown as ToolCall[],
        } as ChatMessage,
      ];
      await this.saveConversationHistory(conversationId, updatedMessages);

      return {
        text: response.response || '',
        toolCalls: (response.tool_calls || []) as unknown as ToolCall[],
      };
    } catch (error: any) {
      console.error('[ChatService] Send message error:', error);
      throw new Error(error.message || 'Failed to send message');
    }
  }

  /**
   * Get system prompt for AI assistant
   */
  getSystemPrompt(): string {
    return `You are an AI medication advisor assistant for the AI Farma app.
You help users with:
- Medication information and usage
- Drug interactions and safety
- Finding nearby pharmacies
- Managing medication schedules
- General health questions

Always prioritize user safety and recommend consulting healthcare professionals for medical decisions.
Be clear that you are an AI assistant, not a substitute for professional medical advice.`;
  }

  /**
   * Save conversation history
   */
  private async saveConversationHistory(
    conversationId: string,
    messages: ChatMessage[]
  ): Promise<void> {
    try {
      const key = `${CHAT_HISTORY_KEY}:${conversationId}`;
      const data = messages.map((m) => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      }));
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('[ChatService] Save error:', error);
    }
  }

  /**
   * Load conversation history
   */
  async loadConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    try {
      const key = `${CHAT_HISTORY_KEY}:${conversationId}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) return [];

      const messages = JSON.parse(data);
      return messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    } catch (error) {
      console.error('[ChatService] Load error:', error);
      return [];
    }
  }

  /**
   * Clear conversation history
   */
  async clearConversationHistory(conversationId: string): Promise<void> {
    try {
      const key = `${CHAT_HISTORY_KEY}:${conversationId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[ChatService] Clear error:', error);
    }
  }
}

export const chatService = new SimpleChatService();
export default SimpleChatService;
