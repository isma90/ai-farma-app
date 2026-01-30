# Backend Issues and Fixes

**Document Purpose:** Track all backend issues discovered during frontend integration testing and provide clear instructions for fixes.

**Last Updated:** 2026-01-30
**Status:** Active - Issues being reported

---

## Issue #1: tool_calls Returns Null Instead of Empty Array

**Severity:** MEDIUM
**Status:** 🔴 REPORTED
**Discovered:** 2026-01-30 during mobile app testing
**Impact:** Frontend crashes with "Cannot read property 'map' of null"

### Problem Description

The `/api/chat/send-message` endpoint returns `null` for the `tool_calls` field when no tools are executed:

```json
{
  "response": "...",
  "tool_calls": null,  // ❌ WRONG - should be []
  "metadata": {...},
  "timestamp": "..."
}
```

This causes the frontend to crash when trying to iterate over tool_calls.

### Expected Behavior

The API should ALWAYS return an empty array when no tools are executed:

```json
{
  "response": "...",
  "tool_calls": [],  // ✅ CORRECT
  "metadata": {...},
  "timestamp": "..."
}
```

### Fix Instructions for Backend Team

**File to modify:** `backend/src/api/routes/chat.py` (or equivalent chat response handler)

**What to change:**

1. Locate the response construction for `/api/chat/send-message`

2. Find where `tool_calls` is set:
   ```python
   # Current (WRONG):
   tool_calls = None  # ❌
   # or
   response["tool_calls"] = None  # ❌
   ```

3. Change to always return empty list:
   ```python
   # Fixed (CORRECT):
   tool_calls = []  # ✅
   # or
   response["tool_calls"] = tool_calls if tool_calls else []  # ✅
   ```

4. Ensure the response model validates this:
   ```python
   # In response schema definition:
   tool_calls: List[ToolCallResult] = []  # with default empty list
   ```

**Verification:**

After the fix, test the endpoint:

```bash
curl -X POST http://localhost:8000/api/chat/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test",
    "conversation_id": "test-123",
    "message": "Hola"
  }' | jq '.tool_calls'
```

Expected output: `[]` (empty array, not `null`)

**Frontend Workaround (Until Fixed):**
```typescript
// In ChatService.ts line ~267
const toolCallResults: ToolCallResult[] = (backendResponse.tool_calls || []).map(...)
```

Currently implemented in commit `2424acf` as temporary fix.

---

## Issue #2: Conversation Persistence Not Working

**Severity:** MEDIUM
**Status:** 🔴 REPORTED
**Discovered:** 2026-01-30 during integration testing
**Impact:** Users cannot retrieve conversation history after app restart

### Problem Description

The `/api/chat/history/{user_id}/{conversation_id}` endpoint returns `404 Conversation not found` even immediately after sending messages.

```bash
# Send message - succeeds
POST /api/chat/send-message → 200 OK

# Try to get history - fails
GET /api/chat/history/user-123/conv-456 → 404 Not Found
```

This indicates conversations are not being persisted to the database.

### Expected Behavior

Conversations should be automatically saved when:
1. User sends first message to a new conversation_id
2. Should be retrievable immediately via `/api/chat/history`
3. Should appear in `/api/chat/conversations/{user_id}` list

### Fix Instructions for Backend Team

**Files to check/modify:**

1. **`backend/src/services/conversation_service.py`**
   - Verify `save_conversation()` or equivalent method is being called
   - Check it's actually writing to PostgreSQL (not just in-memory dict)
   - Verify user_id and conversation_id are being stored correctly

2. **`backend/src/api/routes/chat.py`**
   - In `POST /api/chat/send-message`, verify conversation is saved after:
     ```python
     # After generating response:
     await conversation_service.save_message(
         user_id=user_id,
         conversation_id=conversation_id,
         role="user",
         content=message
     )
     await conversation_service.save_message(
         user_id=user_id,
         conversation_id=conversation_id,
         role="assistant",
         content=response_text
     )
     ```

3. **Database Configuration**
   - Check `DATABASE_URL` in `.env` points to correct PostgreSQL instance
   - Verify connection is working:
     ```bash
     docker-compose logs postgres | grep "connection accepted"
     ```
   - Check if conversations table exists:
     ```bash
     docker-compose exec postgres psql -U ai_farma -d ai_farma -c \
       "SELECT * FROM conversations LIMIT 1;"
     ```

4. **Verify Data Is Being Saved**
   - Check directly in database:
     ```bash
     docker-compose exec postgres psql -U ai_farma -d ai_farma << EOF
     SELECT id, user_id, conversation_id, message_count
     FROM conversations
     ORDER BY created_at DESC
     LIMIT 5;
     EOF
     ```

### Testing the Fix

Once fixed, test with:

```bash
# 1. Send a message
CONV_ID="test-conv-$(date +%s)"
USER_ID="test-user-123"

curl -X POST http://localhost:8000/api/chat/send-message \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"conversation_id\": \"$CONV_ID\",
    \"message\": \"Test message\"
  }"

# 2. Immediately try to get history
curl http://localhost:8000/api/chat/history/$USER_ID/$CONV_ID

# Should return 200 with conversation data, not 404
```

**Expected Response:**
```json
{
  "id": "test-conv-1706645...",
  "user_id": "test-user-123",
  "title": "Test message",
  "created_at": "2026-01-30T...",
  "updated_at": "2026-01-30T...",
  "messages": [
    {
      "role": "user",
      "content": "Test message",
      "timestamp": "2026-01-30T..."
    },
    {
      "role": "assistant",
      "content": "...",
      "timestamp": "2026-01-30T..."
    }
  ],
  "estimated_token_count": 50
}
```

---

## Issue #3: Conversations List Always Returns Empty

**Severity:** MEDIUM
**Status:** 🟡 DEPENDENT ON ISSUE #2
**Discovered:** 2026-01-30 during integration testing
**Impact:** Users cannot see list of their conversations

### Problem Description

The `/api/chat/conversations/{user_id}` endpoint returns empty list even after sending multiple messages:

```json
{
  "conversations": [],
  "total": 0
}
```

### Root Cause

This is dependent on Issue #2 (conversation persistence). Once conversations are properly saved to database, this endpoint should work automatically.

### Fix Instructions for Backend Team

**Same as Issue #2** - Fix database persistence first, then this will work.

**Additional check:**

Verify the endpoint's query logic in `backend/src/api/routes/chat.py`:

```python
@router.get("/conversations/{user_id}")
async def get_user_conversations(user_id: str):
    # Should query conversations from database, not in-memory
    conversations = await conversation_service.get_user_conversations(user_id)
    # Should return actual data from DB
    return {
        "conversations": conversations,
        "total": len(conversations)
    }
```

---

## Issue #4: Test Tool_calls Response Format Mismatch

**Severity:** LOW
**Status:** 🟢 DOCUMENTED
**Discovered:** 2026-01-30 during API testing
**Impact:** No impact (frontend handles both formats)

### Problem Description

When tools ARE executed, the response format seems correct. Need to verify with actual tool execution test (medication scheduling, pharmacy search).

### Verification Steps

1. Test medication scheduling:
   ```bash
   curl -X POST http://localhost:8000/api/chat/send-message \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "test",
       "conversation_id": "test-med",
       "message": "Necesito un cronograma. Tomo paracetamol 500mg cada 6 horas"
     }'
   ```

2. Verify response includes proper tool_calls:
   ```json
   {
     "tool_calls": [
       {
         "tool_name": "create_medication_schedule",
         "success": true,
         "result": {...},
         "error": null
       }
     ]
   }
   ```

---

## Summary of Backend Issues

| # | Issue | Severity | Status | Fix Time |
|---|-------|----------|--------|----------|
| 1 | tool_calls returns null | MEDIUM | 🔴 REPORTED | 15 min |
| 2 | Conversation persistence broken | MEDIUM | 🔴 REPORTED | 1-2 hours |
| 3 | Conversations list empty | MEDIUM | 🟡 DEPENDENT | Same as #2 |
| 4 | Tool execution format | LOW | 🟢 NEEDS TESTING | Verify |

---

## How to Report New Issues

When testing finds a new backend issue:

1. **Title:** Clear, concise description
2. **Severity:** LOW, MEDIUM, or HIGH
3. **How to reproduce:** Step-by-step
4. **Expected vs Actual:** Show responses
5. **Fix instructions:** Specific file + code changes
6. **Verification steps:** How to test the fix

Add to this document in the appropriate section.

---

## Frontend Workarounds (While Backend is Fixed)

### For Issue #1 (null tool_calls)
✅ **Already implemented** in commit `2424acf`
```typescript
const toolCallResults = (backendResponse.tool_calls || []).map(...)
```

### For Issue #2 & #3 (conversation persistence)
⏳ **Workaround not possible** - requires backend fix

---

## Deployment Checklist

Before deploying to production:

- [ ] Issue #1 fixed: tool_calls always returns []
- [ ] Issue #2 fixed: Conversations persist to database
- [ ] Issue #3 verified: Conversations list works
- [ ] Issue #4 verified: Tool execution returns proper format
- [ ] All endpoints tested with curl
- [ ] Database migrations run successfully
- [ ] Backend tests passing

---

## Links & References

- OpenAPI Spec: `/ai-farma-back/docs/API_CHAT_OPENAPI_SPEC.yaml`
- Integration Guide: `/ai-farma-back/docs/API_CHAT_INTEGRATION_GUIDE.md`
- Backend Source: `/ai-farma-back/src/services/conversation_service.py`

---

**Document Maintained By:** Frontend Integration Team
**For Questions:** See CHAT_BACKEND_INTEGRATION.md
