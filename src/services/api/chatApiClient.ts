/**
 * Backend Chat API Client
 * Handles all communication with the AI Farma backend for chat functionality
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  IBackendChatResponse,
  SendMessageParams,
  IConversationData,
  IConversationSnapshot,
  APIError,
} from '@types/index';

class ChatApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use((config) => {
      console.log(`[Chat API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor for error normalization
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[Chat API] Response received:`, response.status);
        return response;
      },
      (error: AxiosError) => {
        console.error(`[Chat API] Error:`, error.response?.status, error.message);
        throw this.normalizeError(error);
      }
    );
  }

  /**
   * Normalize HTTP errors to consistent APIError format
   */
  private normalizeError(error: AxiosError): APIError {
    if (!error.response) {
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }

    const status = error.response.status;
    const data = error.response.data as any;

    let message = 'An error occurred. Please try again.';

    switch (status) {
      case 400:
        message = data?.message || 'Invalid message format';
        break;
      case 403:
        message = "You don't have access to this conversation";
        break;
      case 404:
        message = 'Conversation not found';
        break;
      case 429:
        message = 'Too many requests. Please wait.';
        break;
      case 500:
      case 502:
      case 503:
        message = 'Server error. Please try again.';
        break;
      default:
        message = data?.message || 'An error occurred';
    }

    return {
      status,
      message,
      code: data?.code,
    };
  }

  /**
   * Send a message to the backend and receive LLM response
   */
  async sendMessage(params: SendMessageParams): Promise<IBackendChatResponse> {
    try {
      const response = await this.client.post<IBackendChatResponse>(
        '/api/chat/send-message',
        {
          user_id: params.user_id,
          conversation_id: params.conversation_id,
          message: params.message,
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieve full conversation history from backend
   */
  async getConversationHistory(
    user_id: string,
    conversation_id: string
  ): Promise<IConversationData> {
    try {
      const response = await this.client.get<IConversationData>(
        `/api/chat/history/${user_id}/${conversation_id}`
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get list of conversations for a user
   */
  async getUserConversations(user_id: string): Promise<IConversationSnapshot[]> {
    try {
      const response = await this.client.get<IConversationSnapshot[]>(
        `/api/chat/conversations/${user_id}`
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a single conversation
   */
  async deleteConversation(user_id: string, conversation_id: string): Promise<void> {
    try {
      await this.client.delete(`/api/chat/conversation/${user_id}/${conversation_id}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear all conversations for a user
   */
  async clearAllConversations(user_id: string): Promise<void> {
    try {
      await this.client.post(`/api/chat/clear-all/${user_id}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check backend health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Get current backend URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Export singleton instance
export const chatApiClient = new ChatApiClient();

export default ChatApiClient;
