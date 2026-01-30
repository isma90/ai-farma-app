/**
 * SimplifiedChatService: Lightweight chat service wrapper
 * Provides core chat functionality with mock AI responses
 * No backend required - works completely offline
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '../utils/uuid';

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
  private mockResponses: string[] = [
    'Based on your medication history, I recommend taking your medication with food to minimize side effects.',
    'Great question! Common side effects of this medication include dizziness and drowsiness. Make sure to stay hydrated.',
    'I found 3 pharmacies nearby that are currently open. Would you like me to show you the map?',
    'It\'s important to take your medications at consistent times each day. Set a reminder for the same time daily.',
    'Before combining medications, always consult with your healthcare provider to check for potential interactions.',
    'Your medication adherence is looking good! Keep up with your schedule for best results.',
    'If you experience severe side effects, please stop taking the medication and consult a healthcare provider immediately.',
    'I recommend organizing your medications into a pill organizer to help you remember to take them on time.',
  ];

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
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Get a mock response based on user message
      const response = this.generateMockResponse(userMessage);

      // Save conversation history
      const messages = conversationHistory || [];
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
          content: response,
          timestamp: new Date(),
        } as ChatMessage,
      ];
      await this.saveConversationHistory(conversationId, updatedMessages);

      return {
        text: response,
        toolCalls: [],
      };
    } catch (error: any) {
      console.error('[ChatService] Send message error:', error);
      throw new Error(error.message || 'Failed to send message');
    }
  }

  /**
   * Generate mock AI response based on user message
   */
  private generateMockResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Pattern-based responses
    if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hey')
    ) {
      return "Hello! I'm your AI medication assistant. I can help you with medication information, pharmacy locations, side effects, and medication schedules. What can I help you with today?";
    }

    if (
      lowerMessage.includes('side effect') ||
      lowerMessage.includes('symptom') ||
      lowerMessage.includes('effect')
    ) {
      return 'Common side effects vary by medication. The most frequent ones are usually mild and temporary. Always monitor how you feel and contact your healthcare provider if side effects worsen. Would you like specific information about a particular medication?';
    }

    if (
      lowerMessage.includes('pharmacy') ||
      lowerMessage.includes('pharmacies') ||
      lowerMessage.includes('location')
    ) {
      return 'I can help you find nearby pharmacies! To show you the closest options, I need your location. You can also check our pharmacy locator tab to see all available pharmacies in your area with their opening hours.';
    }

    if (
      lowerMessage.includes('reminder') ||
      lowerMessage.includes('schedule') ||
      lowerMessage.includes('time')
    ) {
      return 'Setting reminders is important for medication adherence! I recommend taking your medications at the same time each day. Use the Medications tab to set specific times for each medication you take.';
    }

    if (
      lowerMessage.includes('interaction') ||
      lowerMessage.includes('combine') ||
      lowerMessage.includes('together')
    ) {
      return 'Always check for drug interactions before combining medications! Some medications should not be taken together as they can reduce effectiveness or cause harmful reactions. Please consult with your healthcare provider or pharmacist.';
    }

    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      return '⚠️ If you\'re experiencing a medical emergency, please call emergency services immediately (911 in the US). I\'m here to provide information only, not emergency care.';
    }

    // Return a random response for other questions
    return this.mockResponses[Math.floor(Math.random() * this.mockResponses.length)];
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
