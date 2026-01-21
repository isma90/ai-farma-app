# Core Navigation and Authentication Capability

## Purpose
The system SHALL provide core application navigation, user authentication, and session management with support for anonymous and authenticated users.

## Requirements

### Requirement: Application Navigation Structure
The system SHALL provide a clear, logical navigation structure for the mobile app.

#### Scenario: Bottom tab navigation
- **WHEN** app launches after authentication
- **THEN** display bottom tab bar with:
  - Home/Dashboard (pill, location, medication icons)
  - Pharmacy Map (map icon)
  - AI Assistant (chat icon)
  - Medications (pill bottle icon)
  - Settings/Profile (gear icon)

#### Scenario: Screen hierarchy
- **WHEN** user navigates through app
- **THEN** maintain stack navigation for detail screens
- **AND** allow back navigation from detail to list
- **AND** preserve state when switching tabs and returning

#### Scenario: Deep linking
- **WHEN** app receives deep link (e.g., from notification)
- **THEN** navigate directly to referenced screen
- **AND** maintain proper navigation stack
- **AND** show appropriate back button behavior

#### Scenario: Modal dialogs
- **WHEN** non-critical actions triggered (e.g., confirm medication taken)
- **THEN** show as slide-up bottom sheet modal
- **AND** allow dismissal by swiping down or tapping outside
- **AND** prevent background interaction

### Requirement: User Authentication
The system SHALL provide authentication with anonymous and account options.

#### Scenario: Anonymous user access
- **WHEN** user opens app for first time
- **THEN** allow immediate access without login
- **AND** create anonymous Firebase session
- **AND** store data locally in AsyncStorage
- **AND** display "Sign in to sync across devices" prompt

#### Scenario: Sign up with email
- **WHEN** user selects "Create account"
- **THEN** show form with:
  - Email field with validation
  - Password field (minimum 8 chars, 1 uppercase, 1 number)
  - Confirm password
  - Agree to terms checkbox
  - Sign up button

#### Scenario: Email validation
- **WHEN** user enters email
- **THEN** validate format
- **AND** check for existing account
- **AND** show error if already registered

#### Scenario: Create account success
- **WHEN** user completes sign up
- **THEN** send verification email
- **AND** request email verification
- **AND** show timer for resend link (5 minutes)
- **AND** migrate anonymous data to account on verification

#### Scenario: Sign in with email
- **WHEN** user selects "Sign in"
- **THEN** show form with email and password
- **AND** include "Forgot password?" link
- **AND** support biometric login if device supports (Face ID, Touch ID)

#### Scenario: Invalid credentials
- **WHEN** user enters wrong email/password
- **THEN** show error: "Email or password incorrect"
- **AND** do NOT reveal which field is wrong (security)
- **AND** allow retries without lockout (for first 5 attempts)

#### Scenario: Account lockout
- **WHEN** user fails login 6+ times in 15 minutes
- **THEN** temporarily lock account (15 minutes)
- **AND** show: "Too many login attempts, try again later"
- **AND** offer password reset as alternative

#### Scenario: Password reset
- **WHEN** user selects "Forgot password?"
- **THEN** request email
- **AND** send reset link if account exists
- **AND** show: "Check your email for reset instructions"
- **AND** link expires after 24 hours

#### Scenario: Reset password via link
- **WHEN** user opens password reset link
- **THEN** allow entering new password
- **AND** validate password requirements
- **AND** confirm reset success
- **AND** return to login screen

#### Scenario: Google Sign-in (OAuth)
- **WHEN** user selects "Sign in with Google"
- **THEN** open Google OAuth flow
- **AND** request Google account permission
- **AND** create/link Firebase account automatically
- **AND** return to app with authenticated session

#### Scenario: Apple Sign-in (iOS)
- **WHEN** user on iOS selects "Sign in with Apple"
- **THEN** open Apple OAuth flow
- **AND** handle email visibility options (Apple can hide email)
- **AND** create/link Firebase account
- **AND** return to app with session

### Requirement: Session Management
The system SHALL maintain secure user sessions across app lifecycle.

#### Scenario: Maintain session on app restart
- **WHEN** user closes and reopens app
- **THEN** restore previous authentication state
- **AND** skip login if token still valid
- **AND** refresh token silently if expired

#### Scenario: Session timeout
- **WHEN** user inactive for 30 minutes
- **THEN** invalidate session
- **AND** require re-authentication on next action
- **AND** preserve unsaved data where possible

#### Scenario: Force logout
- **WHEN** user selects "Sign out" in settings
- **THEN** invalidate current session
- **AND** clear sensitive cached data
- **AND** return to authentication screen
- **AND** ask if user wants to keep local data as anonymous

#### Scenario: Concurrent login from other device
- **WHEN** user authenticates on different device
- **THEN** maintain both sessions independently
- **AND** sync data between devices via Firestore
- **AND** do NOT force logout existing session

### Requirement: User Profile Management
The system SHALL provide user profile creation and management.

#### Scenario: Create profile on first login
- **WHEN** new user completes authentication
- **THEN** show onboarding with:
  - Display name field
  - Date of birth (optional, for age-specific medication guidance)
  - Gender (optional, for drug interaction calculation)
  - Allergies/sensitivities list
  - Preferred language (Spanish/English)
  - Health conditions (optional, for interaction screening)

#### Scenario: Save profile
- **WHEN** user completes onboarding
- **THEN** save profile to Firestore
- **AND** use information for personalized recommendations
- **AND** show success message

#### Scenario: Edit profile
- **WHEN** user navigates to Settings > Profile
- **THEN** allow editing all fields
- **AND** show current values pre-filled
- **AND** validate required fields
- **AND** save changes with confirmation

#### Scenario: Profile picture
- **WHEN** user selects "Add photo"
- **THEN** show camera/gallery options
- **AND** compress image before uploading
- **AND** store in Firebase Storage
- **AND** display in profile header

#### Scenario: Delete account
- **WHEN** user selects "Delete account"
- **THEN** show strong warning:
  - "All data will be permanently deleted"
  - "This cannot be undone"
- **AND** require password re-entry for confirmation
- **AND** delete user document and associated data from Firestore
- **AND** sign out user after deletion

### Requirement: Permission Management
The system SHALL request and manage necessary device permissions.

#### Scenario: Request location permission
- **WHEN** user first opens Pharmacy Map screen
- **THEN** show native permission request dialog
- **AND** explain why location needed ("Find nearby pharmacies")
- **AND** offer "Allow" or "Don't Allow" options

#### Scenario: Permission denied
- **WHEN** user denies location permission
- **THEN** show explanation screen with:
  - Why permission needed
  - How to enable in Settings
  - Option to search by address instead

#### Scenario: Request camera permission
- **WHEN** user attempts to upload prescription image
- **THEN** request camera/photo library permission
- **AND** explain why needed

#### Scenario: Request notification permission
- **WHEN** user creates first medication schedule
- **THEN** request notification permission
- **AND** explain that reminders need this permission

#### Scenario: Permission status check
- **WHEN** app launches
- **THEN** check granted permissions
- **AND** show subtle reminders for denied but important permissions
- **AND** link to device settings when needed

### Requirement: Onboarding Flow
The system SHALL guide new users through app orientation.

#### Scenario: First time user experience
- **WHEN** new user completes authentication
- **THEN** show onboarding screens:
  1. Welcome screen with app purpose
  2. Pharmacy search feature overview
  3. AI assistant capabilities
  4. Medication schedule setup
  5. Privacy and permissions explanation

#### Scenario: Onboarding permissions
- **DURING** onboarding
- **THEN** request critical permissions in context:
  - Location (during pharmacy feature intro)
  - Notifications (during medication feature intro)
  - Health data access (if applicable)

#### Scenario: Skip onboarding
- **WHEN** user taps "Skip" on onboarding screen
- **THEN** show shortened version
- **AND** allow full access to app
- **AND** offer "Help" option to re-show onboarding

#### Scenario: Completed onboarding
- **WHEN** user completes onboarding or skips all screens
- **THEN** set flag in user profile
- **AND** navigate to home screen
- **AND** show relevant empty state prompts (e.g., "No medications yet")

### Requirement: Settings and Preferences
The system SHALL provide comprehensive settings for app customization.

#### Scenario: Access settings
- **WHEN** user taps Settings tab
- **THEN** display organized settings sections:
  - Account (profile, password, logout)
  - Notifications (reminder timing, quiet hours)
  - Privacy (permissions, data sharing)
  - Appearance (theme, language, font size)
  - Advanced (cache, data sync, debug info)

#### Scenario: App theme
- **WHEN** user selects theme in Appearance settings
- **THEN** offer options: Light, Dark, System default
- **AND** apply theme immediately
- **AND** save preference to Firestore

#### Scenario: Language preference
- **WHEN** user selects language
- **THEN** offer: Spanish (Chile), English
- **AND** apply to entire app interface
- **AND** preserve medication/dosage names in original

#### Scenario: Notification settings
- **WHEN** user configures notification preferences
- **THEN** allow:
  - Enable/disable each notification type
  - Quiet hours (time range to skip notifications)
  - Sound preference (on/off)
  - Vibration preference (on/off)

#### Scenario: Data and Privacy
- **WHEN** user opens Privacy settings
- **THEN** display:
  - Data access permissions status
  - Option to export personal data
  - Option to clear cache
  - Privacy policy link
  - Terms of service link

### Requirement: Error Handling and Recovery
The system SHALL handle errors gracefully and provide recovery options.

#### Scenario: Network error
- **WHEN** network request fails
- **THEN** show error message with:
  - Clear description ("Unable to load pharmacies")
  - Retry button
  - Alternative action ("Search offline", "Try different search")

#### Scenario: Application crash
- **WHEN** unexpected error occurs
- **THEN** catch error before crash
- **AND** show error screen with:
  - Simple explanation
  - "Report error" button (sends to Sentry)
  - "Restart app" button
  - Email support link

#### Scenario: Data sync conflict
- **WHEN** offline changes conflict with server
- **THEN** show resolution dialog:
  - "Keep local changes"
  - "Use server version"
  - "Keep both versions"
  - Manual merge option

