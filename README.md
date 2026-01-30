# AI Farma - Pharmacy Management and Drug Interaction Assistant

A React Native mobile application that provides intelligent assistance for pharmacy management and medication interaction checking, powered by AI backend integration.

## Features

✅ **Chat Interface** - Natural language conversations with AI assistant
✅ **Medication Database** - Comprehensive drug information and interaction checking
✅ **Pharmacy Locator** - Find nearby pharmacies with location services
✅ **Conversation History** - Persistent storage of chat conversations
✅ **Warning System** - Alerts for dangerous medication combinations
✅ **Offline Support** - Message queueing when backend is unavailable
✅ **Backend Integration** - Secure server-side LLM processing

## Tech Stack

- **Frontend:** React Native with Expo
- **Language:** TypeScript
- **State Management:** AsyncStorage for local persistence
- **HTTP Client:** Axios
- **Navigation:** React Navigation
- **Testing:** Jest with React Native testing library
- **Backend:** Python (separate repository)

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen containers
├── services/
│   ├── ChatService.ts  # Chat business logic
│   ├── api/
│   │   └── chatApiClient.ts  # Backend HTTP client
│   └── ...other services
├── navigation/         # Navigation configuration
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and constants
└── App.tsx            # Main app component

docs/
├── CHAT_BACKEND_INTEGRATION.md  # Backend integration guide
└── IMPLEMENTATION_SUMMARY_CHAT_BACKEND.md  # Implementation details
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Python 3.8+ (for backend development)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/isma90/ai-farma-app.git
   cd ai-farma-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   ```env
   EXPO_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
   EXPO_PUBLIC_ENV=development
   ```

4. **Start the backend server** (in separate terminal):
   ```bash
   cd ../ai-farma-back
   python -m uvicorn main:app --reload
   ```

5. **Start the development server:**
   ```bash
   npm start
   # or
   yarn start
   ```

6. **Run on device/simulator:**
   - Press `i` for iOS
   - Press `a` for Android
   - Press `w` for web

## Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## Architecture

### Chat Flow

```
User Input
   ↓
ChatService.sendMessage()
   ↓
ChatApiClient.sendMessage()
   ↓
Backend /api/chat/send-message
   ├─ Process with LLM
   ├─ Execute tools (backend-driven)
   └─ Return formatted response
   ↓
Parse IBackendChatResponse
   ↓
Display in UI (with warning handling if needed)
   ↓
Store locally for offline support
```

### Error Handling

All API errors are normalized to a consistent format:

```typescript
interface APIError {
  status: number;
  message: string;
  code?: string;
}
```

The `chatApiClient` automatically handles:
- Network errors (0 status)
- HTTP error codes (400, 403, 404, 429, 500+)
- Request timeouts (10 seconds)
- Request/response logging

### Offline Support

- Messages are stored locally in AsyncStorage
- Failed API calls are queued for retry
- Backend health check determines availability
- User can continue using app with local storage fallback

## Testing

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

### Test Structure

Tests are located next to source files:
- `src/services/api/__tests__/chatApiClient.test.ts` - API client tests
- `src/services/__tests__/ChatService.test.ts` - Chat service tests

### Mock Setup

The `jest.setup.js` file configures:
- AsyncStorage mocking
- Axios mocking
- React Native environment setup

## Backend Integration

For detailed information about backend integration, see:
- [Chat Backend Integration Guide](./docs/CHAT_BACKEND_INTEGRATION.md)
- [Implementation Summary](./docs/IMPLEMENTATION_SUMMARY_CHAT_BACKEND.md)

### Key Points

- Backend handles all LLM processing
- Tool execution is backend-driven
- Frontend receives fully formatted responses
- No API keys in frontend code
- Centralized audit logging

## Environment Configuration

### Development

```env
EXPO_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
EXPO_PUBLIC_ENV=development
```

### Production

```env
EXPO_PUBLIC_BACKEND_BASE_URL=https://api.aifarma.com
EXPO_PUBLIC_ENV=production
```

## Troubleshooting

### Backend Connection Issues

```bash
# Check if backend is running
curl http://localhost:8000/health

# Check environment variable
grep EXPO_PUBLIC_BACKEND_BASE_URL .env

# Verify backend URL format (no trailing slash)
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Reset Expo cache
expo start -c
```

### Test Failures

```bash
# Run with verbose output
npm test -- --verbose

# Run specific test file
npm test chatApiClient.test.ts
```

## Best Practices

1. **Always validate messages** before sending (1-500 characters)
2. **Handle errors gracefully** with user-friendly messages
3. **Check backend availability** before critical operations
4. **Cache responses locally** for offline support
5. **Use AsyncStorage** for conversation persistence
6. **Implement retry logic** for failed requests

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Use Conventional Commits format
4. Keep commits atomic and reversible
5. Run `npm run lint` and `npm run type-check` before committing

## Git Workflow

This project uses Trunk-Based Development (TBD):
- Short-lived feature branches
- Frequent integration to main
- All tests must pass before merge
- Changes governed by OpenSpec specifications

## Security

- API keys are server-side only
- User conversations are encrypted at rest (backend)
- All API calls use HTTPS in production
- Rate limiting enforced by backend
- Audit logging of all interactions

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check [Chat Backend Integration Guide](./docs/CHAT_BACKEND_INTEGRATION.md)
2. Review [Implementation Summary](./docs/IMPLEMENTATION_SUMMARY_CHAT_BACKEND.md)
3. Open an issue on GitHub

## Related Repositories

- [AI Farma Backend](https://github.com/isma90/ai-farma-back) - Backend API server
- [OpenSpec Documentation](./openspec/) - Specification-driven development

---

**Last Updated:** 2026-01-30
**Version:** 1.0.0
