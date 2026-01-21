## MODIFIED Requirements

### Requirement: Application Navigation Structure
The system SHALL provide a clear, logical navigation structure for the mobile app.

#### Scenario: Bottom tab navigation
- **WHEN** app launches after authentication
- **THEN** display bottom tab bar with 5 tabs:
  - Home (dashboard icon)
  - Pharmacies (location icon)
  - Chat (chat bubble icon, disabled/placeholder in MVP)
  - Medications (pill bottle icon)
  - Settings (gear icon)

#### Scenario: Screen hierarchy
- **WHEN** user navigates through app
- **THEN** maintain stack navigation for detail screens (push/pop)
- **AND** preserve tab position when switching tabs and returning

#### Scenario: Deep linking
- **WHEN** app receives deep link (e.g., from notification)
- **THEN** navigate to appropriate tab and screen
- **AND** maintain proper back button behavior (return to previous)

#### Scenario: MVP - No modal dialogs yet
- **WHEN** user performs actions like confirming medication taken
- **THEN** navigate to confirmation screen or toast message
- **AND** full bottom sheet modals deferred to Phase 2

### Requirement: User Authentication
The system SHALL provide authentication with anonymous and account options.

#### Scenario: Anonymous user access
- **WHEN** user opens app for first time
- **THEN** auto-create anonymous Firebase session
- **AND** store data locally in AsyncStorage
- **AND** show "Sign in" prompt on Settings tab

#### Scenario: Sign up with email
- **WHEN** user selects "Create account"
- **THEN** navigate to sign-up screen with:
  - Email field with validation
  - Password field (min 8 chars, 1 uppercase, 1 number)
  - Confirm password field
  - Sign up button
  - Link to sign in if already have account

#### Scenario: Email verification
- **WHEN** user completes sign up
- **THEN** send verification email
- **AND** require email confirmation before full access
- **AND** show timer for resend (expires after 24 hours)

#### Scenario: Sign in with email
- **WHEN** user selects "Sign in"
- **THEN** navigate to login screen with email and password fields
- **AND** show "Forgot password?" link

#### Scenario: Invalid credentials
- **WHEN** user enters wrong email/password
- **THEN** show error: "Invalid email or password"
- **AND** do NOT reveal which field is wrong

#### Scenario: Password reset
- **WHEN** user selects "Forgot password?"
- **THEN** request email
- **AND** send reset link if account exists
- **AND** show: "Check your email for instructions"
- **AND** link valid for 24 hours

#### Scenario: Google Sign-in
- **WHEN** user selects "Sign in with Google"
- **THEN** open Google OAuth flow
- **AND** create Firebase account automatically
- **AND** return to app with authenticated session

#### Scenario: MVP - No Apple Sign-in in MVP
- **WHEN** user views sign-in screen
- **THEN** do NOT show Apple Sign-in (deferred to Phase 2)

### Requirement: Session Management
The system SHALL maintain secure user sessions across app lifecycle.

#### Scenario: Maintain session on app restart
- **WHEN** user closes and reopens app
- **THEN** restore authentication state (if token valid)
- **AND** skip login screen

#### Scenario: Session timeout
- **WHEN** user inactive for 30 minutes
- **THEN** require re-authentication
- **AND** do NOT lose app data

#### Scenario: Force logout
- **WHEN** user selects "Sign out" in settings
- **THEN** clear session
- **AND** reset to anonymous mode
- **AND** ask if user wants to keep local data

### Requirement: User Profile Management
The system SHALL provide user profile creation and management.

#### Scenario: Create profile on first login
- **WHEN** new user completes email signup
- **THEN** navigate to profile setup screen with:
  - Display name field (required)
  - Gender dropdown (optional)
  - Language preference (Spanish/English)
  - Agree to terms checkbox

#### Scenario: Edit profile
- **WHEN** user navigates to Settings > Profile
- **THEN** allow editing all profile fields
- **AND** save changes to Firestore

#### Scenario: MVP - No picture upload
- **WHEN** user views profile
- **THEN** do NOT show picture upload option
- **AND** deferred to Phase 2

#### Scenario: Delete account
- **WHEN** user selects "Delete account" in settings
- **THEN** show warning: "All data will be permanently deleted"
- **AND** require password confirmation
- **AND** delete user document from Firestore
- **AND** sign out user

### Requirement: Permission Management
The system SHALL request and manage necessary device permissions.

#### Scenario: Request location permission
- **WHEN** user first opens Pharmacies screen
- **THEN** show native permission request dialog
- **AND** explain: "Find nearby pharmacies"
- **AND** show Allow/Don't Allow options

#### Scenario: Permission denied
- **WHEN** user denies location permission
- **THEN** allow address search as alternative
- **AND** show Settings link if user wants to enable

#### Scenario: Request notification permission
- **WHEN** user creates first medication schedule
- **THEN** request notification permission
- **AND** explain: "Get reminders for medications"

#### Scenario: MVP - No health data access
- **WHEN** app runs
- **THEN** do NOT request HealthKit (iOS) or Google Fit (Android)
- **AND** deferred to Phase 2

### Requirement: Onboarding Flow
The system SHALL guide new users through app orientation.

#### Scenario: First time user experience
- **WHEN** new user (anonymous or just signed up) opens app
- **THEN** show onboarding carousel with screens:
  1. Welcome: "Find open pharmacies anytime"
  2. Pharmacy search: "Find nearby 24/7 pharmacies"
  3. Medication tracking: "Never miss a dose"
  4. Permissions: "Location + Notifications needed"

#### Scenario: Skip onboarding
- **WHEN** user taps "Skip" on any onboarding screen
- **THEN** jump directly to home screen
- **AND** set flag so onboarding doesn't repeat

#### Scenario: Completed onboarding
- **WHEN** user completes carousel or skips
- **THEN** navigate to Home screen
- **AND** show relevant empty state prompts

### Requirement: Settings and Preferences
The system SHALL provide comprehensive settings for app customization.

#### Scenario: Access settings
- **WHEN** user taps Settings tab
- **THEN** display sections:
  - Account (Profile, Change password, Sign out)
  - Notifications (toggle, quiet hours)
  - Appearance (Light/Dark theme, Language)
  - Privacy (Permissions, Delete account)
  - About (Version, Privacy policy, Terms)

#### Scenario: App theme
- **WHEN** user selects theme
- **THEN** offer: Light, Dark, System default
- **AND** apply immediately
- **AND** save to AsyncStorage and Firestore

#### Scenario: Language preference
- **WHEN** user selects language
- **THEN** offer: Spanish (Chile), English
- **AND** apply to entire UI immediately
- **AND** save preference

#### Scenario: Notification settings
- **WHEN** user configures notifications
- **THEN** allow:
  - Enable/disable reminder notifications
  - Advance notice time (5, 10, 15, 30 min)
  - Quiet hours start and end time
  - Sound on/off
  - Vibration on/off

#### Scenario: MVP - Limited privacy settings
- **WHEN** user opens Privacy settings
- **THEN** show:
  - Location permission status
  - Notification permission status
  - Delete account option
  - Privacy policy link
  - Terms link
- **AND** deferred: granular data sharing, analytics opt-out

### Requirement: Error Handling and Recovery
The system SHALL handle errors gracefully and provide recovery options.

#### Scenario: Network error
- **WHEN** network request fails (pharmacy list, sign-up, etc.)
- **THEN** show error message with:
  - Clear description ("Unable to load pharmacies")
  - Retry button
  - Alternative action ("Try different search")

#### Scenario: Application crash
- **WHEN** unexpected error occurs
- **THEN** catch before crash
- **AND** show error screen with:
  - Simple explanation
  - "Restart app" button
  - Contact support link

#### Scenario: Auth error (invalid token)
- **WHEN** Firebase returns invalid auth token
- **THEN** automatically sign out
- **AND** show login screen
- **AND** show message: "Session expired, please sign in again"

