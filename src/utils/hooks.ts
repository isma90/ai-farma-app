/**
 * Custom React Hooks
 */

import { useEffect, useState, useCallback } from 'react';
import { chatService } from '@services/ChatService';
import { IBackendChatResponse, APIError } from '@types/index';

/**
 * Hook for sending messages to chat
 */
export function useChatMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const sendMessage = useCallback(
    async (userId: string, conversationId: string, message: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await chatService.sendMessage(userId, conversationId, message);
        return response;
      } catch (err) {
        const apiError = err as APIError;
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sendMessage, loading, error };
}

/**
 * Hook for loading conversation history
 */
export function useConversationHistory(
  userId: string,
  conversationId: string | null
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  useEffect(() => {
    if (!userId || !conversationId) return;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await chatService.getConversationHistoryFromBackend(
          userId,
          conversationId
        );
        setData(response);
      } catch (err) {
        setError(err as APIError);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [userId, conversationId]);

  const refresh = useCallback(async () => {
    if (!userId || !conversationId) return;

    setLoading(true);
    try {
      const response = await chatService.getConversationHistoryFromBackend(
        userId,
        conversationId
      );
      setData(response);
    } catch (err) {
      setError(err as APIError);
    } finally {
      setLoading(false);
    }
  }, [userId, conversationId]);

  return { data, loading, error, refresh };
}

/**
 * Hook for loading conversations list
 */
export function useConversations(userId: string | null) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadConversations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await chatService.getUserConversationsFromBackend(userId);
        setData(response);
      } catch (err) {
        setError(err as APIError);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await chatService.getUserConversationsFromBackend(userId);
      setData(response);
    } catch (err) {
      setError(err as APIError);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { data, loading, error, refresh };
}

/**
 * Hook for backend health check
 */
export function useBackendStatus() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const available = await chatService.isBackendAvailable();
        setIsAvailable(available);
      } catch {
        setIsAvailable(false);
      } finally {
        setChecking(false);
      }
    };

    checkBackend();

    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isAvailable, checking };
}

/**
 * Hook for debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
