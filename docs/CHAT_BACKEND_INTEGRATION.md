# Chat Backend Integration Guide

This document provides comprehensive guidance on how the AI Farma mobile app integrates with the backend API for chat functionality.

## Architecture Overview

### Before Integration (Frontend-Driven)
```
Mobile App
├─ Receives user message
├─ Sends directly to OpenAI API
├─ Parses LLM response with tool_calls
├─ Executes tools locally
└─ Sends results back to LLM
```

**Problems with this approach:**
- API key exposed in frontend code
- Complex tool execution logic in mobile app
- No audit trail of interactions
- Rate limiting handled on frontend
- Difficult to swap LLM providers

### After Integration (Backend-Driven)
```
Mobile App
├─ Sends message to Backend
└─ Backend handles everything:
   ├─ LLM integration (OpenAI, Claude, etc.)
   ├─ Tool execution
   ├─ Response formatting
   ├─ Audit logging
   └─ Returns formatted response
```

## Backend API Endpoints

All endpoints are prefixed with `EXPO_PUBLIC_BACKEND_BASE_URL/api/chat`

### 1. Send Message

**Endpoint:** `POST /send-message`

**Request:**
```json
{
  "user_id": "user-123",
  "conversation_id": "conv-456",
  "message": "¿Cuál es la dosis de ibuprofeno?"
}
```

**Response:**
```json
{
  "response": "La dosis recomendada de ibuprofeno...",
  "tool_calls": [
    {
      "tool_name": "search_pharmacy",
      "tool_input": { "city": "Madrid" },
      "result": [{"name": "Farmacia X", "address": "..."}],
      "error": null
    }
  ],
  "metadata": {
    "conversation_id": "conv-456",
    "user_id": "user-123",
    "has_warning": false,
    "warning_severity": null
  },
  "timestamp": "2026-01-30T15:45:00Z"
}
```

**Error Responses:**

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Invalid message format | Message validation failed |
| 403 | You don't have access | User doesn't own conversation |
| 404 | Conversation not found | Conversation ID doesn't exist |
| 429 | Too many requests | Rate limit exceeded |
| 500 | Server error | Backend processing error |

### 2. Get Conversation History

**Endpoint:** `GET /history/{user_id}/{conversation_id}`

**Response:**
```json
{
  "conversation_id": "conv-456",
  "user_id": "user-123",
  "created_at": "2026-01-30T10:00:00Z",
  "updated_at": "2026-01-30T15:45:00Z",
  "messages": [
    {
      "role": "user",
      "content": "¿Cuál es la dosis de ibuprofeno?",
      "timestamp": "2026-01-30T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "La dosis recomendada...",
      "timestamp": "2026-01-30T10:01:00Z"
    }
  ]
}
```

### 3. List User Conversations

**Endpoint:** `GET /conversations/{user_id}`

**Response:**
```json
[
  {
    "conversation_id": "conv-1",
    "user_id": "user-123",
    "title": "Medicamentos para el resfriado",
    "created_at": "2026-01-30T10:00:00Z",
    "updated_at": "2026-01-30T10:30:00Z",
    "preview": "Hola, tengo resfriado..."
  },
  {
    "conversation_id": "conv-2",
    "user_id": "user-123",
    "title": "Interacciones medicamentosas",
    "created_at": "2026-01-29T15:00:00Z",
    "updated_at": "2026-01-29T16:00:00Z",
    "preview": "¿Puedo combinar ibuprofen..."
  }
]
```

### 4. Delete Conversation

**Endpoint:** `DELETE /conversation/{user_id}/{conversation_id}`

**Response:** 204 No Content

### 5. Clear All Conversations

**Endpoint:** `POST /clear-all/{user_id}`

**Response:** 200 OK

## Local Development Setup

### Prerequisites
- Backend server running (see backend repository)
- Node.js and npm/yarn installed
- Expo CLI installed globally

### Steps

1. **Start the backend server:**
   ```bash
   cd ../ai-farma-back
   python -m uvicorn main:app --reload
   ```
   Backend will be available at `http://localhost:8000`

2. **Configure environment:**
   Create or update `.env` file:
   ```env
   EXPO_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
   EXPO_PUBLIC_ENV=development
   ```

3. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Start the mobile app:**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Run on device or simulator:**
   - Press `i` for iOS
   - Press `a` for Android
   - Press `w` for web

## Testing the Integration

### Using curl

**Test sending a message:**
```bash
curl -X POST http://localhost:8000/api/chat/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "conversation_id": "test-conv-123",
    "message": "¿Cuál es la dosis de ibuprofeno?"
  }'
```

**Test getting history:**
```bash
curl http://localhost:8000/api/chat/history/test-user/test-conv-123
```

**Test listing conversations:**
```bash
curl http://localhost:8000/api/chat/conversations/test-user
```

### Using the Frontend

1. Create a new conversation
2. Send test messages
3. Verify responses appear correctly
4. Check for warning messages if applicable
5. Test conversation deletion

## Warning Handling

The backend can return warning messages when self-medication risks are detected:

**Response with warning:**
```json
{
  "response": "⚠️ ADVERTENCIA CRITICAL: No debe combinar estos medicamentos sin supervisión médica.",
  "tool_calls": [],
  "metadata": {
    "has_warning": true,
    "warning_severity": "CRITICAL"
  },
  "timestamp": "2026-01-30T15:45:00Z"
}
```

**Warning Severity Levels:**
- `CRITICAL`: Dangerous combination, user should see a doctor
- `WARNING`: Potential interaction, use caution
- `INFO`: General information or reminder

The mobile app should:
1. Check `has_warning` flag
2. Display warning prominently if true
3. Show severity level (⚠️ for WARNING/CRITICAL)
4. Allow user to acknowledge and continue

## Error Handling

### Network Errors
```typescript
try {
  const response = await chatService.sendMessage(userId, conversationId, message);
} catch (error: APIError) {
  if (error.code === 'NETWORK_ERROR') {
    // Show offline message, queue for retry
  } else if (error.status === 429) {
    // Rate limited, show wait time
  } else {
    // Show general error message
  }
}
```

### Offline Support

The `ChatService` implements offline support:
- Messages are stored locally in AsyncStorage
- Failed messages are queued for retry
- When backend becomes available, queued messages are sent
- Full conversation history can be pulled from backend when reconnected

## Migration from Frontend-Only Integration

If you previously had direct OpenAI integration:

1. **Remove OpenAI API key from frontend:**
   - Delete `EXPO_PUBLIC_OPENAI_API_KEY` from `.env`
   - Remove OpenAI client initialization

2. **Update ChatService:**
   - Use the refactored `ChatService` that calls backend
   - Remove tool execution logic
   - Remove OpenAI model configuration

3. **Update screens/components:**
   - Change from calling `sendMessage()` to `chatApiClient.sendMessage()`
   - Update error handling for new error format
   - Update response handling (no more tool execution)

4. **Testing:**
   - Test with backend running
   - Test network error scenarios
   - Test offline message queueing

## Performance Considerations

1. **Message Timeout:** 10 seconds by default (configurable)
2. **Rate Limiting:** Backend enforces per-user rate limits
3. **Conversation Limits:** Keep conversation size reasonable for local storage
4. **Caching:** Backend responses are cached locally for offline support

## Troubleshooting

### "Backend API not configured"
**Cause:** Missing or invalid `EXPO_PUBLIC_BACKEND_BASE_URL`
**Solution:**
- Check `.env` file
- Verify URL format (e.g., `http://localhost:8000`, not `localhost:8000`)
- Make sure backend server is running

### "Network error. Please check your connection."
**Cause:** Backend unreachable
**Solution:**
- Verify backend is running: `curl http://localhost:8000/health`
- Check network connectivity
- Check firewall settings
- On iOS: May need to configure ATS for localhost development

### "Message too long"
**Cause:** Message exceeds 500 character limit
**Solution:**
- Frontend should validate before sending
- Check message length before calling `sendMessage()`

### "Too many requests"
**Cause:** Rate limit exceeded
**Solution:**
- Wait 60 seconds before retrying
- Implement exponential backoff in retry logic
- Check if multiple requests are being sent unintentionally

### Conversations not syncing
**Cause:** Backend and local storage out of sync
**Solution:**
- Clear local conversations: `chatService.clearAllConversations(userId)`
- Refresh from backend: `chatService.getUserConversationsFromBackend(userId)`
- Check backend is returning data

## Security Considerations

1. **API Key Protection:**
   - API key is now server-side only
   - Frontend cannot access LLM credentials
   - Better protection against key exposure

2. **User Authentication:**
   - Ensure `user_id` is properly authenticated
   - Backend should verify user ownership of conversations
   - Consider implementing JWT tokens for API calls

3. **Rate Limiting:**
   - Backend enforces per-user rate limits
   - Prevents abuse and ensures fair usage

4. **Audit Logging:**
   - All conversation data should be logged server-side
   - Timestamps are provided in responses
   - Enables compliance with data regulations

## Next Steps

1. **Full Integration Testing:** Test against real backend instance
2. **Performance Monitoring:** Track response times and error rates
3. **Offline Mode:** Enhance offline message queueing
4. **Message Search:** Add conversation search capabilities
5. **Analytics:** Track usage patterns server-side

## Additional Resources

- Backend API Documentation: See `ai-farma-back` repository
- Chat Service: `src/services/ChatService.ts`
- Chat API Client: `src/services/api/chatApiClient.ts`
- Type Definitions: `src/types/index.ts`
