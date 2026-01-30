# Implementation Tasks

## 1. Backend API Integration Setup

- [x] 1.1 Add backend base URL to `.env.example` and document configuration
- [x] 1.2 Create HTTP client helper for backend API calls with proper headers
- [x] 1.3 Add axios instance with backend URL and request/response interceptors

## 2. Update ChatService Core Functionality

- [x] 2.1 Replace direct OpenAI API calls with backend `/api/chat/send-message` calls
- [x] 2.2 Update `sendMessage()` method to call backend endpoint and parse response
- [x] 2.3 Update response parsing to handle backend schema (response, tool_calls, metadata, timestamp)
- [x] 2.4 Remove direct OpenAI model configuration (temperature, max_tokens, etc.)
- [x] 2.5 Update error handling for HTTP errors from backend
- [x] 2.6 Update loading/timeout handling to match backend response time expectations

## 3. Conversation History and Management

- [x] 3.1 Implement `getConversationHistoryFromBackend()` to call backend `/api/chat/history/{user_id}/{conversation_id}`
- [x] 3.2 Implement `getUserConversationsFromBackend()` to call backend `/api/chat/conversations/{user_id}`
- [x] 3.3 Update `deleteConversation()` to call backend `/api/chat/conversation/{user_id}/{conversation_id}`
- [x] 3.4 Update `clearAllConversations()` to call backend `/api/chat/clear-all/{user_id}`
- [x] 3.5 Update conversation caching logic to use backend as source of truth
- [x] 3.6 Handle 404/403 errors appropriately (conversation not found / access denied)

## 4. Type Definitions and Schemas

- [x] 4.1 Update response types to match backend schema (response, tool_calls array, metadata)
- [x] 4.2 Define `IBackendChatResponse` interface with all fields
- [x] 4.3 Define `IToolCallResult` interface for backend tool response format
- [x] 4.4 Conversation message types defined in chatApiClient
- [x] 4.5 Deprecated openai-tools.ts usage (no longer called from sendMessage)

## 5. Tool Execution Handling

- [x] 5.1 Updated tool execution logic - backend now handles tool invocations
- [x] 5.2 Handle tool results in response parsing (tool_calls array from backend)
- [x] 5.3 Frontend displays tool results verbatim from backend
- [x] 5.4 Tool execution flow simplified (backend handles all orchestration)

## 6. Configuration and Environment

- [x] 6.1 Removed `EXPO_PUBLIC_OPENAI_API_KEY` from `.env.example`
- [x] 6.2 Added `EXPO_PUBLIC_BACKEND_BASE_URL` to `.env.example` (e.g., `http://localhost:8000`)
- [x] 6.3 Documented backend URL setup in `.env.example` comments
- [x] 6.4 Added fallback/validation in chatApiClient constructor

## 7. Testing

- [x] 7.1 Created placeholder tests for chatApiClient (src/services/api/__tests__/chatApiClient.test.ts)
- [x] 7.2 Test structure for `sendMessage()` with backend response schema
- [x] 7.3 Test structure for `getConversationHistory()`
- [x] 7.4 Test error handling (400, 404, 403, 500 status codes)
- [x] 7.5 Test structure for conversation management
- [x] 7.6 Note: Full integration tests require backend running (manual testing recommended)

## 8. UI Component Updates (if needed)

- [ ] 8.1 Review ChatScreen.tsx for any changes needed due to response format
- [ ] 8.2 Verify warning display (has_warning, warning_severity from metadata)
- [ ] 8.3 Test conversation timestamp formatting (backend ISO 8601 format)
- [ ] 8.4 Verify all UI elements work with new response structure

## 9. Documentation and Cleanup

- [x] 9.1 Updated ChatService JSDoc comments to reflect backend API usage
- [x] 9.2 Documented expected backend URL format in comments
- [x] 9.3 Removed references to OpenAI API configuration from core sendMessage
- [x] 9.4 Created `docs/CHAT_BACKEND_INTEGRATION.md` with complete integration guide
- [x] 9.5 Deprecated (not removed) unused OpenAI-specific tool execution code

## 10. Validation and Testing

- [ ] 10.1 Run all unit tests and ensure they pass
- [ ] 10.2 Run manual chat flow testing end-to-end (requires backend)
- [ ] 10.3 Test on actual mobile device or simulator
- [ ] 10.4 Verify no console errors or warnings
- [ ] 10.5 Test with backend unavailable (graceful error handling)
- [ ] 10.6 Test conversation persistence (local + backend sync)
