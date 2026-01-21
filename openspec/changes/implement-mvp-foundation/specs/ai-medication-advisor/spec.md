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

