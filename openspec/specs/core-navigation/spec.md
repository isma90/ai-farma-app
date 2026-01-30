# Core Navigation Capability

## Purpose

The system SHALL provide a logical and intuitive navigation structure that allows users to access all major features of the application through a bottom tab navigation pattern with stack-based detailed screens.

## Requirements

### Requirement: Authentication Flow Navigation

The system SHALL manage navigation between unauthenticated and authenticated states.

#### Scenario: User not logged in
- **GIVEN** user launches app for first time
- **WHEN** app initializes
- **THEN** display authentication stack (Welcome, Login, Signup)
- **AND** prevent access to main app screens

#### Scenario: User logged in
- **GIVEN** user is authenticated
- **WHEN** app initializes
- **THEN** display main app with bottom tab navigator
- **AND** show 5 main tabs: Home, Pharmacy Map, Chat, Medications, Settings

#### Scenario: User logs out
- **GIVEN** user is in authenticated state
- **WHEN** user taps logout in Settings
- **THEN** clear authentication state
- **AND** return to authentication stack

### Requirement: Bottom Tab Navigation

The system SHALL provide 5 main navigation tabs accessible from any screen.

#### Scenario: Tab structure
- **THEN** display tabs in this order (left to right):
  1. **Home** - Dashboard with today's summary
  2. **Pharmacy** - Find and locate pharmacies
  3. **Chat** - AI medication advisor
  4. **Medications** - Manage medication schedule
  5. **Settings** - User profile and preferences

#### Scenario: Tab active state
- **WHEN** user navigates to a tab
- **THEN** highlight active tab
- **AND** show icon change or color difference
- **AND** persist screen state within tab (not reset on switch)

#### Scenario: Tab icons
- **THEN** each tab shows icon:
  - Home: house icon
  - Pharmacy: pharmacy/location icon
  - Chat: message/chat icon
  - Medications: pills/medicine icon
  - Settings: gear icon

### Requirement: Stack Navigation Per Tab

Each tab SHALL have its own stack navigator for detailed screens.

#### Scenario: Chat tab navigation
- **GIVEN** user is in Chat tab
- **WHEN** user taps message
- **THEN** push ConversationDetailScreen onto Chat stack
- **AND** show back button to return to chat list

#### Scenario: Pharmacy tab navigation
- **GIVEN** user is in Pharmacy tab
- **WHEN** user taps pharmacy item
- **THEN** push PharmacyDetailScreen onto Pharmacy stack
- **AND** show pharmacy info (address, phone, hours, map)
- **AND** show back button to return to list/map

#### Scenario: Medications tab navigation
- **GIVEN** user is in Medications tab
- **WHEN** user taps medication item
- **THEN** push MedicationDetailScreen onto Medications stack
- **AND** show medication info and adherence
- **AND** show back button to return to list

#### Scenario: Settings tab navigation
- **GIVEN** user is in Settings tab
- **WHEN** user taps profile
- **THEN** push ProfileEditScreen onto Settings stack
- **AND** allow editing profile info
- **AND** show back button to return to settings

### Requirement: Deep Linking Support

The system SHALL support deep linking for direct navigation.

#### Scenario: Open pharmacy from URL
- **GIVEN** user receives link to specific pharmacy
- **WHEN** user taps link (e.g., `aifarma://pharmacy/123`)
- **THEN** navigate directly to PharmacyDetailScreen
- **AND** show full pharmacy info

#### Scenario: Open medication from URL
- **GIVEN** user receives link to specific medication
- **WHEN** user taps link (e.g., `aifarma://medication/456`)
- **THEN** navigate directly to MedicationDetailScreen
- **AND** show medication info

#### Scenario: Open conversation from URL
- **GIVEN** user receives link to specific conversation
- **WHEN** user taps link (e.g., `aifarma://conversation/789`)
- **THEN** navigate directly to ConversationDetailScreen
- **AND** show conversation messages

### Requirement: Navigation Performance

Navigation transitions SHALL be smooth and responsive.

#### Scenario: Tab switch animation
- **WHEN** user switches between tabs
- **THEN** transition within 300ms
- **AND** show smooth fade or slide animation
- **AND** not block user interaction

#### Scenario: Screen push animation
- **WHEN** user navigates to detail screen
- **THEN** animate screen push from right
- **AND** show back button with slide animation
- **AND** complete animation within 300ms

#### Scenario: Screen pop animation
- **WHEN** user taps back button
- **THEN** pop screen with slide animation
- **AND** return to previous screen state
- **AND** restore scroll position if applicable

### Requirement: Header and Back Navigation

Each screen SHALL display appropriate header information.

#### Scenario: Tab headers
- **GIVEN** user is in any tab
- **THEN** show tab title in header
- **AND** show optional right actions (filter, menu, etc.)

#### Scenario: Detail screen headers
- **GIVEN** user is on detail screen
- **WHEN** user navigates via stack
- **THEN** show back button in header
- **AND** show screen title
- **AND** tapping back button pops to previous screen

#### Scenario: Nested navigation indication
- **GIVEN** user is deep in navigation stack
- **WHEN** user taps back multiple times
- **THEN** each back action pops one level
- **AND** reaching tab root prevents further back

### Requirement: Bottom Tab Persistence

Active tab state SHALL persist across app backgrounding.

#### Scenario: App backgrounding
- **GIVEN** user is on Chat tab
- **WHEN** user backgrounds app
- **AND** reopens app
- **THEN** return to Chat tab (not Home tab)
- **AND** show previous screen state

#### Scenario: Screen state restoration
- **GIVEN** user scrolled in list
- **WHEN** user switches tabs and returns
- **THEN** restore scroll position
- **AND** maintain any unsaved form data

### Requirement: Onboarding Flow

New users SHALL see onboarding before accessing main app.

#### Scenario: First app launch
- **GIVEN** new user launches app
- **WHEN** app initializes
- **THEN** show WelcomeScreen
- **AND** display 4-5 screens explaining features
- **AND** allow skipping onboarding

#### Scenario: Onboarding completion
- **GIVEN** user completes onboarding
- **WHEN** user taps "Get Started"
- **THEN** navigate to authentication flow
- **AND** set `onboarding_complete` flag
- **AND** never show onboarding again

#### Scenario: Permission requests in onboarding
- **GIVEN** user is in onboarding
- **WHEN** reaching location screen
- **THEN** request location permission
- **AND** explain why needed
- **AND** allow user to skip for now

