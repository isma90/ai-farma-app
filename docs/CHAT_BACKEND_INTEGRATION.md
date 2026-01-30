# Chat Backend Integration Guide

## Overview

The chat functionality in the AI Farma mobile app now integrates with the AI Farma backend API instead of connecting directly to OpenAI. This provides:

- **Enhanced Security**: API keys are kept secure on the backend
- **Rate Limiting**: Backend controls request rates
- **Conversation Persistence**: Backend manages conversation storage
- **Audit Trail**: Server-side logging of all interactions
- **Flexibility**: Easy to swap LLM providers without app changes

## Architecture Changes

### Before (Direct OpenAI Integration)
```
Mobile App → OpenAI API
             (API key in frontend)
```

### After (Backend-Mediated Integration)
```
Mobile App → Backend API → OpenAI API
             (Secure)      (Server-side only)
```

## Backend API Endpoints

All chat operations go through the backend at `EXPO_PUBLIC_BACKEND_BASE_URL/api/chat`:

### 1. Send Message
**Endpoint:** `POST /api/chat/send-message`

```typescript
interface SendMessageRequest {
  user_id: string;
  conversation_id: string;
  message: string; // 1-500 characters
}

interface SendMessageResponse {
  response: string;                    // Chat response text
  tool_calls: IToolCallResult[];       // Executed tools and results
  metadata: {
    conversation_id: string;
    user_id: string;
    has_warning: boolean;
    warning_severity: 'CRITICAL' | 'WARNING' | null;
  };
  timestamp: string;                   // ISO 8601 datetime
}
```

### 2. Get Conversation History
**Endpoint:** `GET /api/chat/history/{user_id}/{conversation_id}`

Retrieves full conversation with all messages.

### 3. Get User's Conversations
**Endpoint:** `GET /api/chat/conversations/{user_id}`

Retrieves list of all conversations for a user with summaries.

### 4. Delete Conversation
**Endpoint:** `DELETE /api/chat/conversation/{user_id}/{conversation_id}`

### 5. Clear All Conversations
**Endpoint:** `POST /api/chat/clear-all/{user_id}`

## Configuration

### Environment Variables

In `.env.example` and your `.env` file:

```bash
# Backend URL (local development)
EXPO_PUBLIC_BACKEND_BASE_URL=http://localhost:8000

# Production (example)
EXPO_PUBLIC_BACKEND_BASE_URL=https://api.aifarma.com
```

### Remove Old Configuration

The following is NO LONGER NEEDED:
- `EXPO_PUBLIC_OPENAI_API_KEY` - Now managed by backend only

## Code Changes

### ChatService.ts

**Key changes:**
1. `sendMessage()` now calls `chatApiClient.sendMessage()` instead of OpenAI directly
2. Tool results come from backend response (`tool_calls` array)
3. Backend handles self-medication detection and warnings
4. New methods: `getConversationHistoryFromBackend()`, `getUserConversationsFromBackend()`
5. Updated: `deleteConversation()`, `clearAllConversations()` now sync with backend first

### New File: src/services/api/chatApiClient.ts

HTTP client for backend API with:
- Request/response interceptors for logging
- Automatic error normalization
- Type-safe API methods
- Timeout handling (10s default)

## Error Handling

The API client normalizes HTTP errors:

| Status | Meaning | User Message |
|--------|---------|--------------|
| 400 | Bad Request | "Invalid message format" |
| 403 | Forbidden | "You don't have access to this conversation" |
| 404 | Not Found | "Conversation not found" |
| 429 | Rate Limited | "Too many requests. Please wait." |
| 500 | Server Error | "Server error. Please try again." |
| Network Error | No Connection | "Network error. Please check your connection." |

## Local Development Setup

### Configure Backend

Before starting the backend server, ensure `.env` has proper configuration:

```bash
cd ../ai-farma-back
```

Check/update `.env` file:
```bash
# Required
OPENAI_API_KEY=sk-your-actual-api-key
SECRET_KEY=your-secret-key-here-min-32-chars-long-for-security  # Keep secure!

# Database (using Docker Compose defaults)
DATABASE_URL=postgresql+asyncpg://ai_farma:password@postgres:5432/ai_farma

# Other services
REDIS_URL=redis://redis:6379/0
ENVIRONMENT=development
```

### Start Backend Server

**With Docker Compose (Recommended):**
```bash
docker-compose up -d
```
Backend runs on `http://localhost:8000`

**Without Docker (Local Python):**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Use SQLite for local dev
export DATABASE_URL=sqlite:///./ai_farma.db

python -m uvicorn main:app --reload
```
Backend runs on `http://localhost:8000`

⚠️ **Important Security Notes:**
1. Never commit `.env` file to version control
2. Generate a strong SECRET_KEY for production (min 32 characters)
3. Rotate credentials periodically
4. Keep OPENAI_API_KEY secret

### Configure Frontend

Create `.env` file in project root:

```bash
EXPO_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
# ... other config
```

### Run Mobile App

```bash
npm start
# Press 'a' for Android or 'i' for iOS
```

## Testing the Integration

### 1. Basic Chat Flow

```bash
# Send message
curl -X POST http://localhost:8000/api/chat/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "conversation_id": "test-conv-123",
    "message": "¿Cuál es la dosis de ibuprofeno?"
  }'
```

### 2. Get Conversation History

```bash
curl http://localhost:8000/api/chat/history/test-user/test-conv-123
```

### 3. List Conversations

```bash
curl http://localhost:8000/api/chat/conversations/test-user
```

## Migration Notes

### For Existing Conversations

- Conversations stored locally continue to work
- First backend call creates conversation record on backend
- Subsequent calls read/write from backend

### For Developers

If you have code that:
- Imports `getToolDefinitions()` or `parseToolCallArguments()` from `src/types/openai-tools.ts`
  - These are no longer used in ChatService
  - Backend handles tool definitions and execution

If you have tests that:
- Mock OpenAI API calls
  - Update mocks to use `chatApiClient` instead
  - See `src/services/api/__tests__/chatApiClient.test.ts` for examples

## Performance Considerations

### Message Response Time
- Expected: 3-8 seconds (same as before)
- Backend must connect to OpenAI, process response, execute tools

### Network Latency
- If backend is remote (not localhost), add 0.5-2 seconds
- Compress payloads for slower networks

### Conversation List Loading
- Fetches from backend (not local AsyncStorage)
- On first load, may take 1-2 seconds
- Results are cached locally for subsequent views

## Troubleshooting

### Backend Connection Fails

```
Error: Network error. Please check your connection.
```

**Solutions:**
1. Check `EXPO_PUBLIC_BACKEND_BASE_URL` is correct
2. Verify backend is running: `curl http://localhost:8000/health`
3. Check firewall/network policies

### Message Too Long Error

```
Error: Message must be between 1 and 500 characters
```

**Solution:** Frontend should validate message length before sending.

### Conversation Not Found

```
Error: Conversation not found
```

**Solution:** Ensure `conversation_id` matches one created on backend.

### Rate Limit Hit

```
Error: Too many requests. Please wait.
```

**Solution:** Wait 60 seconds before retrying. User can read FAQs meanwhile.

## Future Improvements

- [ ] Message queuing for offline mode
- [ ] Conversation auto-save while typing
- [ ] Real-time collaboration (WebSocket)
- [ ] Conversation search/filtering
- [ ] Export conversations as PDF

## Support

For issues or questions:
1. Check backend logs: `tail -f server.log`
2. Check frontend console: Browser DevTools or Metro bundler output
3. Review backend API docs: `http://localhost:8000/docs` (Swagger UI)
