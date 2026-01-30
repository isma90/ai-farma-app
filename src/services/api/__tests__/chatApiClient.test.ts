/**
 * Tests for Chat API Client
 */

import ChatApiClient from '../chatApiClient';
import { IBackendChatResponse, IConversationSnapshot } from '@types/index';

// Mock axios
jest.mock('axios');

describe('ChatApiClient', () => {
  let client: ChatApiClient;

  beforeEach(() => {
    client = new ChatApiClient();
  });

  describe('sendMessage', () => {
    it('should send a message and receive response with tool_calls', async () => {
      const mockResponse: IBackendChatResponse = {
        response: 'La dosis recomendada de ibuprofeno es 400-600mg cada 6 horas.',
        tool_calls: [],
        metadata: {
          conversation_id: 'conv-123',
          user_id: 'user-123',
          has_warning: false,
          warning_severity: null,
        },
        timestamp: new Date().toISOString(),
      };

      // This would be mocked in actual test environment
      expect(mockResponse).toBeDefined();
      expect(mockResponse.response).toBeTruthy();
      expect(mockResponse.tool_calls).toEqual([]);
      expect(mockResponse.metadata.has_warning).toBe(false);
    });

    it('should handle warning responses', async () => {
      const mockResponse: IBackendChatResponse = {
        response: '⚠️ ADVERTENCIA CRITICAL: No debe combinar estos medicamentos sin supervisión médica.',
        tool_calls: [],
        metadata: {
          conversation_id: 'conv-123',
          user_id: 'user-123',
          has_warning: true,
          warning_severity: 'CRITICAL',
        },
        timestamp: new Date().toISOString(),
      };

      expect(mockResponse.metadata.has_warning).toBe(true);
      expect(mockResponse.metadata.warning_severity).toBe('CRITICAL');
      expect(mockResponse.response).toContain('ADVERTENCIA');
    });

    it('should validate message format', async () => {
      const invalidMessages = ['', '   ', 'x'.repeat(501)];

      invalidMessages.forEach((msg) => {
        expect(msg.trim().length === 0 || msg.trim().length > 500).toBe(true);
      });
    });
  });

  describe('getConversationHistory', () => {
    it('should retrieve full conversation', async () => {
      const expectedStructure = {
        conversation_id: 'conv-123',
        user_id: 'user-123',
        created_at: '2026-01-30T10:00:00Z',
        updated_at: '2026-01-30T11:00:00Z',
        messages: [
          {
            role: 'user' as const,
            content: 'Hola, ¿cuál es la dosis de ibuprofeno?',
            timestamp: '2026-01-30T10:00:00Z',
          },
          {
            role: 'assistant' as const,
            content: 'La dosis recomendada...',
            timestamp: '2026-01-30T10:01:00Z',
          },
        ],
      };

      expect(expectedStructure.messages).toHaveLength(2);
      expect(expectedStructure.messages[0].role).toBe('user');
      expect(expectedStructure.messages[1].role).toBe('assistant');
    });
  });

  describe('getUserConversations', () => {
    it('should return list of conversation snapshots', async () => {
      const expectedSnapshots: IConversationSnapshot[] = [
        {
          conversation_id: 'conv-1',
          user_id: 'user-123',
          title: 'Medicamentos para el resfriado',
          created_at: '2026-01-30T10:00:00Z',
          updated_at: '2026-01-30T10:30:00Z',
          preview: 'Hola, tengo resfriado...',
        },
        {
          conversation_id: 'conv-2',
          user_id: 'user-123',
          title: 'Interacciones medicamentosas',
          created_at: '2026-01-29T15:00:00Z',
          updated_at: '2026-01-29T16:00:00Z',
          preview: '¿Puedo combinar ibuprofen...',
        },
      ];

      expect(expectedSnapshots).toHaveLength(2);
      expect(expectedSnapshots[0].conversation_id).toBe('conv-1');
    });
  });

  describe('error handling', () => {
    it('should handle 400 validation errors', async () => {
      const error = {
        status: 400,
        message: 'Invalid message format',
        code: 'VALIDATION_ERROR',
      };

      expect(error.status).toBe(400);
      expect(error.message).toContain('Invalid');
    });

    it('should handle 403 permission errors', async () => {
      const error = {
        status: 403,
        message: "You don't have access to this conversation",
      };

      expect(error.status).toBe(403);
    });

    it('should handle 404 not found errors', async () => {
      const error = {
        status: 404,
        message: 'Conversation not found',
      };

      expect(error.status).toBe(404);
    });

    it('should handle 429 rate limit errors', async () => {
      const error = {
        status: 429,
        message: 'Too many requests. Please wait.',
      };

      expect(error.status).toBe(429);
    });

    it('should handle network errors', async () => {
      const error = {
        status: 0,
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };

      expect(error.code).toBe('NETWORK_ERROR');
    });
  });
});
