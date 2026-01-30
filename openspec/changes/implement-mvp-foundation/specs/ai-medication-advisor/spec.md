## ADDED Requirements

### Requirement: AI Chat Placeholder Interface
The system SHALL provide a chat placeholder screen that prepares for future AI integration.

#### Scenario: Access AI chat
- **WHEN** user taps Chat tab (AI icon)
- **THEN** show chat screen with:
  - Empty message list
  - Message input field
  - "Disabled in MVP" message or info

#### Scenario: AI unavailable notice
- **WHEN** user views chat screen
- **THEN** display message:
  - "AI medication assistant coming soon"
  - "Chat with our expert about medications in the next update"
- **AND** disable input field (grayed out)

#### Scenario: Offline handling
- **WHEN** network is unavailable
- **THEN** show: "AI chat requires internet connection"
- **AND** keep placeholder visible but disabled

## NOTES FOR PHASE 2 IMPLEMENTATION

**Important**: When Phase 2 implements the full AI medication advisor feature, the system MUST enforce the scope limitation requirement from the main spec:
- The AI must only respond to queries about medications and pharmacies
- Out-of-scope queries must be rejected with a clear message
- The system prompt to Claude/OpenAI must explicitly define this scope limitation
- See the "Query Scope Limitation and Out-of-Scope Rejection" requirement in the main spec for full details

This ensures compliance with project.md constraint (line 516) that limits the AI to medication/pharmacy topics only.

