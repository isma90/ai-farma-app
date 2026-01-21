# Implementation Tasks: MVP Foundation

## Phase 1: Project Setup & Infrastructure (Week 1-2)

### 1.1 Project Initialization
- [ ] 1.1.1 Initialize React Native project with TypeScript and Expo (or bare React Native)
- [ ] 1.1.2 Configure ESLint, Prettier, and pre-commit hooks (husky)
- [ ] 1.1.3 Set up project folder structure (src/, components/, screens/, etc. per project.md)
- [ ] 1.1.4 Configure absolute imports (@/ paths)
- [ ] 1.1.5 Set up .env files for API keys (Firebase, Google Maps, MINSAL APIs)

### 1.2 Build & Deployment Configuration
- [ ] 1.2.1 Configure EAS Build for iOS/Android builds
- [ ] 1.2.2 Set up app signing certificates (iOS provisioning, Android keystore)
- [ ] 1.2.3 Create build scripts for development/staging/production
- [ ] 1.2.4 Configure app versioning (package.json, Android manifest, iOS plist)

### 1.3 Firebase Setup
- [ ] 1.3.1 Create Firebase project for AI Farma (dev, staging, prod)
- [ ] 1.3.2 Configure Firebase Authentication (email/password + Google + Apple)
- [ ] 1.3.3 Create Firestore database with security rules:
  - [ ] 1.3.3a users/{userId}/profile (read/write to own)
  - [ ] 1.3.3b users/{userId}/medications (read/write to own)
  - [ ] 1.3.3c users/{userId}/adherence (read/write to own)
  - [ ] 1.3.3d pharmacy-ratings (read all, write authenticated)
- [ ] 1.3.4 Set up Firebase Cloud Storage for user uploads (future)
- [ ] 1.3.5 Configure Firebase Analytics
- [ ] 1.3.6 Set up Sentry for error monitoring

### 1.4 Development Environment
- [ ] 1.4.1 Install and configure React Native development tools (Xcode, Android Studio)
- [ ] 1.4.2 Set up iOS simulator and Android emulator with test devices
- [ ] 1.4.3 Configure Git workflow (branching strategy, commit hooks)
- [ ] 1.4.4 Set up GitHub Actions for CI/CD (run tests, build APK/IPA)

### 1.5 Core Dependencies Installation
- [ ] 1.5.1 Install React Navigation (bottom tabs, stack navigator)
- [ ] 1.5.2 Install React Query (TanStack Query) for API calls
- [ ] 1.5.3 Install Redux Toolkit for global state
- [ ] 1.5.4 Install AsyncStorage for local persistence
- [ ] 1.5.5 Install React Native Maps (with Google Maps integration)
- [ ] 1.5.6 Install React Native Geolocation Service
- [ ] 1.5.7 Install React Native Push Notifications
- [ ] 1.5.8 Install React Native Paper (UI components)
- [ ] 1.5.9 Install NativeWind for Tailwind styling

---

## Phase 2: Core Authentication & Navigation (Week 2-3)

### 2.1 Firebase Authentication Integration
- [ ] 2.1.1 Create AuthService class wrapping Firebase Auth
- [ ] 2.1.2 Implement anonymous authentication on app launch
- [ ] 2.1.3 Implement email signup with validation
- [ ] 2.1.4 Implement email login with error handling
- [ ] 2.1.5 Implement password reset flow
- [ ] 2.1.6 Implement Google OAuth (sign up + sign in)
- [ ] 2.1.7 Implement Apple OAuth (iOS only)
- [ ] 2.1.8 Create auth state management (Redux slice or custom hook)
- [ ] 2.1.9 Handle session persistence (restore auth on app restart)
- [ ] 2.1.10 Implement session timeout (30 min inactivity)

### 2.2 User Profile Management
- [ ] 2.2.1 Create useUserProfile hook
- [ ] 2.2.2 Implement profile creation screen (onboarding)
- [ ] 2.2.3 Implement profile editing screen
- [ ] 2.2.4 Create Firestore user document structure
- [ ] 2.2.5 Implement profile picture upload
- [ ] 2.2.6 Implement delete account flow

### 2.3 Core Navigation Structure
- [ ] 2.3.1 Create RootNavigator (auth vs authenticated stacks)
- [ ] 2.3.2 Create BottomTabNavigator with 5 tabs:
  - [ ] 2.3.2a Home/Dashboard
  - [ ] 2.3.2b Pharmacy Map
  - [ ] 2.3.2c AI Chat (placeholder)
  - [ ] 2.3.2d Medications
  - [ ] 2.3.2e Settings
- [ ] 2.3.3 Create HomeScreen with content placeholder
- [ ] 2.3.4 Create SettingsScreen with profile, preferences, logout
- [ ] 2.3.5 Implement deep linking support

### 2.4 Onboarding Flow
- [ ] 2.4.1 Create WelcomeScreen
- [ ] 2.4.2 Create OnboardingCarousel (swipeable, 4-5 screens)
- [ ] 2.4.3 Implement permission requests in onboarding context
- [ ] 2.4.4 Set onboarding completion flag

### 2.5 Settings & Preferences
- [ ] 2.5.1 Create settings reducer (Redux)
- [ ] 2.5.2 Implement theme (light/dark) toggle
- [ ] 2.5.3 Implement language preference (Spanish/English)
- [ ] 2.5.4 Implement notification preferences (toggle, quiet hours)
- [ ] 2.5.5 Implement about/help section

---

## Phase 3: Pharmacy Locator (Week 3-5)

### 3.1 Pharmacy Data Management
- [ ] 3.1.1 Create PharmacyService for API calls
- [ ] 3.1.2 Implement fetchPharmacies() (GET from MINSAL API)
- [ ] 3.1.3 Implement fetchOnDutyPharmacies(date) (GET from MINSAL Turnos API)
- [ ] 3.1.4 Create AsyncStorage cache layer:
  - [ ] 3.1.4a Save pharmacies with timestamp
  - [ ] 3.1.4b Save on-duty list with timestamp
  - [ ] 3.1.4c Load from cache if available
  - [ ] 3.1.4d Implement cache expiration (7 days for pharmacy list, 1 hour for on-duty)
- [ ] 3.1.5 Implement background sync (scheduled for 2 AM daily)
- [ ] 3.1.6 Create pharmacy reducer (Redux) for state management

### 3.2 Geolocation & Distance Calculation
- [ ] 3.2.1 Create LocationService for geolocation
- [ ] 3.2.2 Implement getLocation() with permission handling
- [ ] 3.2.3 Implement distance calculation (Haversine formula)
- [ ] 3.2.4 Create useUserLocation custom hook
- [ ] 3.2.5 Implement location watcher (updates when moving >500m)
- [ ] 3.2.6 Cache last known location to AsyncStorage

### 3.3 Pharmacy List Screen
- [ ] 3.3.1 Create PharmacyListScreen component
- [ ] 3.3.2 Create PharmacyCard component (distance, status, name, address)
- [ ] 3.3.3 Implement list loading state with skeleton
- [ ] 3.3.4 Implement list empty state
- [ ] 3.3.5 Implement pull-to-refresh to update pharmacy data
- [ ] 3.3.6 Implement infinite scroll (show 20 at a time, load more)
- [ ] 3.3.7 Implement sorting by distance
- [ ] 3.3.8 Show on-duty status indicator (green/gray badges)
- [ ] 3.3.9 Show distance and ETA to each pharmacy

### 3.4 Pharmacy Details Screen
- [ ] 3.4.1 Create PharmacyDetailScreen component
- [ ] 3.4.2 Display:
  - [ ] 3.4.2a Pharmacy name and chain
  - [ ] 3.4.2b Full address (clickable)
  - [ ] 3.4.2c Phone number (clickable to call)
  - [ ] 3.4.2d Distance and ETA
  - [ ] 3.4.2e Hours of operation
  - [ ] 3.4.2f Services offered (if available)
  - [ ] 3.4.2g On-duty status
  - [ ] 3.4.2h Mini map preview
- [ ] 3.4.3 Create navigation buttons (Google Maps, Waze, Apple Maps)
- [ ] 3.4.4 Create favorite button (heart icon)
- [ ] 3.4.5 Implement deep linking to open maps apps

### 3.5 Map View
- [ ] 3.5.1 Create PharmacyMapScreen component
- [ ] 3.5.2 Render Google Map centered on user location
- [ ] 3.5.3 Place pharmacy markers:
  - [ ] 3.5.3a Green for on-duty
  - [ ] 3.5.3b Gray for regular hours
  - [ ] 3.5.3c Blue for favorites
- [ ] 3.5.4 Implement marker clustering for >100 pharmacies
- [ ] 3.5.5 Show info window on marker tap (name, distance, "View Details" button)
- [ ] 3.5.6 Allow tapping info window to navigate to PharmacyDetailScreen
- [ ] 3.5.7 Implement map permissions handling

### 3.6 Search & Filter
- [ ] 3.6.1 Create SearchPharmacyBar component (search input + filters)
- [ ] 3.6.2 Implement search by pharmacy name:
  - [ ] 3.6.2a Text input with debouncing
  - [ ] 3.6.2b Fuzzy matching against cached data
  - [ ] 3.6.2c Show results in real-time
- [ ] 3.6.3 Implement search by address:
  - [ ] 3.6.3a Allow user to enter address
  - [ ] 3.6.3b Geocode address using Google Geocoding API
  - [ ] 3.6.3c Center map/list on that location
  - [ ] 3.6.3d Show pharmacies nearby
- [ ] 3.6.4 Implement filter by region (dropdown)
- [ ] 3.6.5 Implement "on-duty only" toggle
- [ ] 3.6.6 Implement distance radius filter (5km, 10km, 25km, 50km+)

### 3.7 Favorites Management
- [ ] 3.7.1 Create FavoritesScreen component
- [ ] 3.7.2 Implement addToFavorites() (save to AsyncStorage + Firestore)
- [ ] 3.7.3 Implement removeFromFavorites()
- [ ] 3.7.4 Show favorites list sorted by distance
- [ ] 3.7.5 Show count of favorites
- [ ] 3.7.6 Allow swipe-to-delete on favorites

### 3.8 Pharmacy List Performance Optimization
- [ ] 3.8.1 Implement virtual scrolling for large lists (FlashList)
- [ ] 3.8.2 Implement pagination (request 20 at a time)
- [ ] 3.8.3 Optimize map rendering (limit markers to visible bounds)
- [ ] 3.8.4 Implement React Query caching with stale-while-revalidate

---

## Phase 4: Medication Schedule MVP (Week 5-6)

### 4.1 Medication Management
- [ ] 4.1.1 Create MedicationService for Firestore operations
- [ ] 4.1.2 Create MedicationScheduleScreen
- [ ] 4.1.3 Create AddMedicationScreen with form:
  - [ ] 4.1.3a Medication name (text input)
  - [ ] 4.1.3b Dosage (text input)
  - [ ] 4.1.3c Frequency dropdown (once/twice/thrice/custom)
  - [ ] 4.1.3d Time picker(s) for each dose
  - [ ] 4.1.3e Start date picker
  - [ ] 4.1.3f End date picker (optional)
  - [ ] 4.1.3g Notes field
- [ ] 4.1.4 Create MedicationListItem component
- [ ] 4.1.5 Implement save medication to Firestore + local AsyncStorage
- [ ] 4.1.6 Implement edit medication screen
- [ ] 4.1.7 Implement delete medication (with confirmation)

### 4.2 Local Reminders
- [ ] 4.2.1 Create NotificationService wrapping React Native Notifications
- [ ] 4.2.2 Implement scheduleReminder(medication, time) → registers local notification
- [ ] 4.2.3 Implement background notification handling:
  - [ ] 4.2.3a Show notification on lock screen
  - [ ] 4.2.3b Allow "Took It" action from notification
  - [ ] 4.2.3c Dismiss notification after action
- [ ] 4.2.4 Implement notification permissions request
- [ ] 4.2.5 Implement rescheduling when medication times change
- [ ] 4.2.6 Implement cancellation when medication deleted

### 4.3 Adherence Tracking
- [ ] 4.3.1 Create adherence reducer (Redux)
- [ ] 4.3.2 Implement markMedicationTaken(medicationId, timestamp):
  - [ ] 4.3.2a Record in local AsyncStorage
  - [ ] 4.3.2b Record in Firestore (with sync queue if offline)
  - [ ] 4.3.2c Update UI immediately
- [ ] 4.3.3 Create TodaysMedicationsScreen:
  - [ ] 4.3.3a Show list of medications for today
  - [ ] 4.3.3b Show scheduled time for each
  - [ ] 4.3.3c Show status (taken/pending/overdue)
  - [ ] 4.3.3d Allow marking as taken with one tap
- [ ] 4.3.4 Create simple adherence calendar view (week view)
  - [ ] 4.3.4a Show days with color coding (green=100%, yellow=partial, red=missed)
  - [ ] 4.3.4b Show completion % for current week
  - [ ] 4.3.4c Click day to see details

### 4.4 Medication History & Archive
- [ ] 4.4.1 Implement logic to move completed medications to history
- [ ] 4.4.2 Show completed medications in separate section
- [ ] 4.4.3 Allow restoring archived medications

### 4.5 Notifications Settings
- [ ] 4.5.1 Add reminder advance time setting (default 15 min)
- [ ] 4.5.2 Add quiet hours setting (time range to skip)
- [ ] 4.5.3 Add sound/vibration preference for notifications

---

## Phase 5: Offline Support (Week 6-7)

### 5.1 Offline Data Access
- [ ] 5.1.1 Implement isOnline() detection using NetInfo
- [ ] 5.1.2 Show "Offline" indicator in UI when no internet
- [ ] 5.1.3 Allow loading cached pharmacy data when offline
- [ ] 5.1.4 Show cache age ("Data from [date]") in offline mode
- [ ] 5.1.5 Disable features that require internet (AI chat, Google Maps directions)
- [ ] 5.1.6 Implement fallback for offline (list view instead of map)

### 5.2 Offline Medication & Adherence
- [ ] 5.2.1 Ensure medication list works fully offline
- [ ] 5.2.2 Ensure reminders fire offline (local notifications)
- [ ] 5.2.3 Allow marking medication taken offline
- [ ] 5.2.4 Save adherence to AsyncStorage immediately
- [ ] 5.2.5 Queue adherence record for Firestore sync

### 5.3 Sync Queue Management
- [ ] 5.3.1 Create SyncService for managing offline operations
- [ ] 5.3.2 Implement addToSyncQueue(action, data) function
- [ ] 5.3.3 Implement processSyncQueue() on internet reconnection
- [ ] 5.3.4 Show sync progress indicator ("Syncing 3 items...")
- [ ] 5.3.5 Handle sync failures with retry logic (exponential backoff)
- [ ] 5.3.6 Show notification on sync completion
- [ ] 5.3.7 Allow manual sync trigger from settings

### 5.4 Offline Data Persistence
- [ ] 5.4.1 Ensure all critical data has local backup (AsyncStorage + optional Realm DB)
- [ ] 5.4.2 Implement periodic backup of Firestore data locally
- [ ] 5.4.3 Cache Google Maps API responses for addresses already searched
- [ ] 5.4.4 Test app functionality with WiFi disabled on device

---

## Phase 6: AI Chat Scaffold (Week 7)

### 6.1 Chat Interface Placeholder
- [ ] 6.1.1 Create ChatScreen with message list
- [ ] 6.1.2 Create message input field
- [ ] 6.1.3 Show loading state while waiting for response
- [ ] 6.1.4 Display error message for offline: "AI chat requires internet"
- [ ] 6.1.5 Show legal disclaimer on first chat open
- [ ] 6.1.6 Store conversation to local AsyncStorage

### 6.2 API Integration Scaffold
- [ ] 6.2.1 Create AIService class (placeholder for Claude/OpenAI)
- [ ] 6.2.2 Implement sendMessage() stub (currently returns error)
- [ ] 6.2.3 Handle API timeouts (8-second limit)
- [ ] 6.2.4 Log errors to Sentry

---

## Phase 7: Testing & Optimization (Week 7-8)

### 7.1 Unit Tests
- [ ] 7.1.1 Write tests for distance calculation utility
- [ ] 7.1.2 Write tests for medication schedule logic
- [ ] 7.1.3 Write tests for pharmacy filtering/search
- [ ] 7.1.4 Write tests for auth service
- [ ] 7.1.5 Write tests for offline sync logic
- [ ] 7.1.6 Achieve 70% code coverage

### 7.2 Integration Tests
- [ ] 7.2.1 Test pharmacy search → details flow
- [ ] 7.2.2 Test medication creation → reminder firing flow
- [ ] 7.2.3 Test offline medication adherence → online sync
- [ ] 7.2.4 Test authentication → profile creation flow

### 7.3 E2E Tests (Detox)
- [ ] 7.3.1 Test emergency pharmacy search flow
- [ ] 7.3.2 Test medication reminder flow
- [ ] 7.3.3 Test offline → online transition

### 7.4 Performance Testing
- [ ] 7.4.1 Measure app startup time (target <3s)
- [ ] 7.4.2 Measure map load time with 50+ markers (target <3s)
- [ ] 7.4.3 Measure search response time (target <500ms)
- [ ] 7.4.4 Measure pharmacy list scroll smoothness (FPS)
- [ ] 7.4.5 Check app bundle size (target <50MB download)

### 7.5 Manual Testing Checklist
- [ ] 7.5.1 Test on iOS simulator (latest iOS)
- [ ] 7.5.2 Test on Android emulator (API 30, 31, 32)
- [ ] 7.5.3 Test with slow network (3G simulation)
- [ ] 7.5.4 Test with location disabled
- [ ] 7.5.5 Test with notifications disabled
- [ ] 7.5.6 Test offline (WiFi + cellular disabled)
- [ ] 7.5.7 Test on real devices (iPhone, Android phone)
- [ ] 7.5.8 Test battery usage (long app usage session)

### 7.6 Crash & Error Handling
- [ ] 7.6.1 Ensure Sentry captures all unhandled errors
- [ ] 7.6.2 Test error screens for common crashes (no internet, API timeout, etc.)
- [ ] 7.6.3 Verify error recovery (user can retry operations)

---

## Phase 8: Closed Beta & Refinement (Week 8-9)

### 8.1 Beta Release Preparation
- [ ] 8.1.1 Write privacy policy and terms of service
- [ ] 8.1.2 Configure app store listings (iOS App Store, Google Play)
- [ ] 8.1.3 Create app icons and splash screen
- [ ] 8.1.4 Write release notes for v1.0.0
- [ ] 8.1.5 Create TestFlight build for iOS closed beta
- [ ] 8.1.6 Create Google Play internal testing build

### 8.2 Beta Testing
- [ ] 8.2.1 Recruit 50-100 internal testers
- [ ] 8.2.2 Distribute beta via TestFlight/Google Play
- [ ] 8.2.3 Collect feedback via in-app feedback form
- [ ] 8.2.4 Monitor crash reports (Sentry)
- [ ] 8.2.5 Fix critical bugs found by testers
- [ ] 8.2.6 Iterate on UI based on feedback

### 8.3 Pharmacy Data Validation
- [ ] 8.3.1 Verify pharmacy coordinates against real locations (spot check)
- [ ] 8.3.2 Verify on-duty data accuracy against MINSAL official list
- [ ] 8.3.3 Confirm pharmacy contact information is current
- [ ] 8.3.4 Test with various pharmacies in RM region

---

## Phase 9: Launch Preparation (Week 9-10)

### 9.1 App Store Submission
- [ ] 9.1.1 Ensure compliance with iOS App Store guidelines
- [ ] 9.1.2 Ensure compliance with Google Play guidelines
- [ ] 9.1.3 Submit iOS app to App Store for review
- [ ] 9.1.4 Submit Android app to Google Play
- [ ] 9.1.5 Monitor review process, respond to any questions

### 9.2 Infrastructure Scaling
- [ ] 9.2.1 Ensure Firebase quotas are sufficient for launch
- [ ] 9.2.2 Configure automatic scaling for Firestore
- [ ] 9.2.3 Set up monitoring dashboards (Firebase, Sentry)
- [ ] 9.2.4 Plan for API rate limiting (MINSAL APIs)

### 9.3 Documentation
- [ ] 9.3.1 Write user documentation (in-app help)
- [ ] 9.3.2 Write deployment documentation
- [ ] 9.3.3 Create troubleshooting guide
- [ ] 9.3.4 Document API integrations (for future developers)

### 9.4 Launch Day Preparation
- [ ] 9.4.1 Prepare launch announcement
- [ ] 9.4.2 Set up social media presence
- [ ] 9.4.3 Prepare support contact info (email, chat)
- [ ] 9.4.4 Brief support team on common issues

---

## Definition of Done for Each Task

Each task is considered complete when:
1. Code is written and committed to feature branch
2. Code follows project conventions (style, naming, structure)
3. Unit/integration tests written and passing
4. Code reviewed and approved by another team member
5. No console errors or warnings (allow approved exceptions)
6. Works on both iOS and Android
7. Documented in code comments where logic is non-obvious
8. PR created with clear description linking to OpenSpec

## Notes
- Timeline estimates: 1 day per major task (1.X.X), 0.5 days per subtask
- Parallel work possible: Phase 2 (auth) can start while Phase 1 (setup) still in progress
- Phase 3 (pharmacy) and Phase 4 (medications) can partially overlap
- Phase 5 (offline) pervasive throughout—add offline support in parallel with each feature
- Testing (Phase 7) should start early, not wait until end

