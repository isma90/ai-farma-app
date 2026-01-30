/**
 * Tests for Chat Service
 */

import { chatService } from '../ChatService';
import { chatApiClient } from '../api/chatApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../api/chatApiClient');
jest.mock('@react-native-async-storage/async-storage');

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send valid message to backend', async () => {
      const mockResponse = {
        response: 'Test response',
        tool_calls: [],
        metadata: {
          conversation_id: 'conv-1',
          user_id: 'user-1',
          has_warning: false,
          warning_severity: null,
        },
        timestamp: new Date().toISOString(),
      };

      (chatApiClient.sendMessage as jest.Mock).mockResolvedValue(mockResponse);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);

      const result = await chatService.sendMessage('user-1', 'conv-1', 'Hello');

      expect(result).toEqual(mockResponse);
      expect(chatApiClient.sendMessage).toHaveBeenCalledWith({
        user_id: 'user-1',
        conversation_id: 'conv-1',
        message: 'Hello',
      });
    });

    it('should reject empty messages', async () => {
      await expect(chatService.sendMessage('user-1', 'conv-1', '')).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          code: 'VALIDATION_ERROR',
        })
      );
    });

    it('should reject messages over 500 characters', async () => {
      const longMessage = 'x'.repeat(501);
      await expect(chatService.sendMessage('user-1', 'conv-1', longMessage)).rejects.toEqual(
        expect.objectContaining({
          status: 400,
        })
      );
    });

    it('should trim whitespace from messages', async () => {
      const mockResponse = {
        response: 'Test',
        tool_calls: [],
        metadata: {
          conversation_id: 'conv-1',
          user_id: 'user-1',
          has_warning: false,
          warning_severity: null,
        },
        timestamp: new Date().toISOString(),
      };

      (chatApiClient.sendMessage as jest.Mock).mockResolvedValue(mockResponse);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);

      await chatService.sendMessage('user-1', 'conv-1', '  Hello  ');

      expect(chatApiClient.sendMessage).toHaveBeenCalledWith({
        user_id: 'user-1',
        conversation_id: 'conv-1',
        message: 'Hello',
      });
    });
  });

  describe('getConversationHistoryFromBackend', () => {
    it('should fetch conversation from backend', async () => {
      const mockData = {
        conversation_id: 'conv-1',
        user_id: 'user-1',
        created_at: '2026-01-30T10:00:00Z',
        updated_at: '2026-01-30T10:00:00Z',
        messages: [],
      };

      (chatApiClient.getConversationHistory as jest.Mock).mockResolvedValue(mockData);

      const result = await chatService.getConversationHistoryFromBackend('user-1', 'conv-1');

      expect(result).toEqual(mockData);
    });
  });

  describe('createConversation', () => {
    it('should create new conversation with auto-generated ID', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);

      const convId = await chatService.createConversation('user-1', 'Test Conv');

      expect(convId).toMatch(/user-1_\d+/);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation from backend and local storage', async () => {
      (chatApiClient.deleteConversation as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);

      await chatService.deleteConversation('user-1', 'conv-1');

      expect(chatApiClient.deleteConversation).toHaveBeenCalledWith('user-1', 'conv-1');
    });
  });

  describe('isBackendAvailable', () => {
    it('should return true when backend is available', async () => {
      (chatApiClient.healthCheck as jest.Mock).mockResolvedValue(true);

      const result = await chatService.isBackendAvailable();

      expect(result).toBe(true);
    });

    it('should return false when backend is unavailable', async () => {
      (chatApiClient.healthCheck as jest.Mock).mockResolvedValue(false);

      const result = await chatService.isBackendAvailable();

      expect(result).toBe(false);
    });
  });
});
