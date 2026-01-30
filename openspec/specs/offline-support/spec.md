# Offline Support Capability

## Purpose

The system SHALL provide essential functionality when internet connection is unavailable, ensuring users can continue accessing critical features, taking reminders, and managing medications without connectivity.

## Requirements

### Requirement: Offline Data Access

Critical data SHALL be accessible when offline.

#### Scenario: View cached pharmacies offline
- **GIVEN** pharmacies have been fetched previously
- **WHEN** user loses internet connection
- **WHEN** user navigates to Pharmacy tab
- **THEN** load pharmacies from local AsyncStorage cache
- **AND** display "Offline mode" indicator at top
- **AND** show data age: "Last updated 2 hours ago"
- **AND** disable "Refresh" button
- **AND** allow normal list/map viewing (map is cached)

#### Scenario: View medication list offline
- **GIVEN** medications exist locally
- **WHEN** user is offline
- **WHEN** user navigates to Medications tab
- **THEN** display all medications normally
- **AND** show today's scheduled medications
- **AND** allow marking as taken
- **AND** function completely without internet

#### Scenario: View conversation history offline
- **GIVEN** conversations exist locally
- **WHEN** user is offline
- **WHEN** user navigates to Chat tab
- **THEN** show cached conversation list
- **AND** allow viewing previous conversations
- **AND** show "Offline mode" - Cannot send new messages
- **AND** disable message input

#### Scenario: View user profile offline
- **GIVEN** profile info was loaded previously
- **WHEN** user is offline
- **WHEN** user opens Settings
- **THEN** display profile information
- **AND** prevent editing (requires sync)
- **AND** show read-only mode

#### Scenario: Cache size management
- **GIVEN** offline cache accumulates data
- **WHEN** cache exceeds 50MB
- **THEN** automatically clean old data
- **AND** keep newest pharmacies, conversations, medications
- **AND** show notification: "Cleared old cached data"

### Requirement: Offline Medication Management

Medications and reminders SHALL function offline.

#### Scenario: Local reminder firing
- **GIVEN** medications scheduled with reminders
- **WHEN** device goes offline
- **AND** scheduled reminder time arrives
- **THEN** trigger local notification normally
- **AND** notification works even if app backgrounded
- **AND** user can mark as taken from notification

#### Scenario: Mark medication taken offline
- **GIVEN** user is offline
- **WHEN** user marks medication taken (via app or notification)
- **THEN** save locally to AsyncStorage immediately
- **AND** record timestamp
- **AND** show confirmation
- **AND** queue for Firestore sync when online

#### Scenario: Add medication offline
- **GIVEN** user is offline
- **WHEN** user adds new medication
- **THEN** save to local AsyncStorage
- **AND** show "Queued for sync" message
- **AND** display medication immediately in list
- **AND** schedule local reminders

#### Scenario: Edit medication offline
- **GIVEN** medication exists locally
- **WHEN** user edits medication
- **THEN** save changes locally
- **AND** queue edit for sync
- **AND** update reminders immediately
- **AND** show "Queued for sync"

#### Scenario: Delete medication offline
- **GIVEN** medication exists locally
- **WHEN** user deletes medication
- **THEN** remove from local list immediately
- **AND** cancel associated reminders
- **AND** queue deletion for sync
- **AND** show undo option (works offline too)

### Requirement: Offline Adherence Tracking

Adherence data SHALL persist through offline periods.

#### Scenario: Record adherence offline
- **GIVEN** user is offline
- **WHEN** user marks medications taken
- **THEN** save adherence records locally
- **AND** maintain timestamp accuracy
- **AND** update calendar/statistics immediately
- **AND** persist if app crashes

#### Scenario: Sync adherence when online
- **GIVEN** adherence recorded while offline
- **WHEN** internet connection restored
- **THEN** automatically send all offline adherence to Firestore
- **AND** show "Syncing adherence..." briefly
- **AND** confirm sync completion
- **AND** resolve conflicts (keep latest timestamp if both sides changed)

#### Scenario: Calculate statistics offline
- **GIVEN** adherence records exist locally
- **WHEN** user views adherence calendar
- **AND** user is offline
- **THEN** calculate statistics from local data
- **AND** show weekly/monthly adherence %
- **AND** show calendar view correctly
- **AND** note that data may be incomplete if offline long

### Requirement: Network Status Detection

The system SHALL detect and indicate network connectivity.

#### Scenario: Detect connection loss
- **GIVEN** app is running with internet
- **WHEN** connection drops (WiFi off, cellular disabled)
- **THEN** detect immediately (<2 second delay)
- **AND** show "Offline mode" indicator
- **AND** update UI to disable online features

#### Scenario: Detect connection restored
- **GIVEN** app is in offline mode
- **WHEN** internet connection restored
- **THEN** detect within 5 seconds
- **AND** hide "Offline mode" indicator
- **AND** begin sync of queued changes
- **AND** enable online features

#### Scenario: Offline indicator placement
- **GIVEN** user is offline
- **THEN** show clear visual indicator:
  - Top banner: "Offline - Limited functionality"
  - Color: Red/orange
  - Always visible at top
  - Disappear when back online

#### Scenario: Feature availability messaging
- **GIVEN** user tries feature requiring internet
- **WHEN** offline
- **THEN** show toast message:
  - "Chat requires internet connection"
  - "This requires sync. Check connection."
  - "Can't download. You're offline."

### Requirement: Offline Sync Queue

Pending changes SHALL be queued and synced when online.

#### Scenario: Queue offline changes
- **GIVEN** user makes changes offline
- **WHEN** medication added/edited/deleted
- **THEN** add to sync queue with:
  - Action type (ADD, UPDATE, DELETE)
  - Entity ID
  - Data snapshot
  - Timestamp
  - Retry count (starts at 0)

#### Scenario: Process sync queue
- **GIVEN** sync queue has pending items
- **WHEN** internet reconnected
- **THEN** begin processing queue:
  - Send items in order (respecting dependencies)
  - Retry failed items with exponential backoff
  - Update UI with sync progress

#### Scenario: Sync progress indicator
- **GIVEN** syncing queue items
- **WHEN** multiple items queued
- **THEN** show progress: "Syncing 3 of 7 items..."
- **AND** show each completed item with checkmark
- **AND** allow user to view sync status

#### Scenario: Sync failure retry
- **GIVEN** sync attempt fails
- **WHEN** error occurs (e.g., 500 error)
- **THEN** retry automatically:
  - First retry: 1 second delay
  - Second: 2 seconds
  - Third: 4 seconds
  - Fourth: 8 seconds
  - Max 4 retries, then show error

#### Scenario: Manual sync trigger
- **GIVEN** sync queue has items
- **WHEN** user opens Settings → Sync
- **THEN** show "Sync now" button
- **AND** tapping manually triggers sync
- **AND** show real-time progress
- **AND** show "All synced ✓" when complete

#### Scenario: Sync completion notification
- **GIVEN** queued items synced successfully
- **WHEN** sync completes
- **THEN** show notification: "Changes synced"
- **AND** dismiss after 3 seconds
- **AND** show completion count: "Synced 3 changes"

#### Scenario: Sync conflict resolution
- **GIVEN** local and cloud changes conflict
- **WHEN** both sides modified same medication
- **THEN** resolve with:
  - Keep latest timestamp version
  - Cloud version preferred if same timestamp
  - Show user notification: "Conflict: Cloud version kept"
  - Allow manual review if critical

### Requirement: Offline-First Data Architecture

Data storage SHALL prioritize offline access.

#### Scenario: Dual storage model
- **GIVEN** user saves data
- **THEN** save to BOTH:
  - AsyncStorage (local, immediate, offline-accessible)
  - Firestore (cloud, sync when online, authoritative)
- **AND** local is source of truth until synced
- **AND** conflict resolution prefers cloud if synced

#### Scenario: Data consistency
- **GIVEN** same data on local and cloud
- **WHEN** viewed on different devices
- **THEN** eventually consistent (within 5 minutes after sync)
- **AND** offline device shows local version
- **AND** other device shows cloud version
- **AND** both converge after sync

#### Scenario: Storage optimization
- **GIVEN** local AsyncStorage has limited space (50MB typical)
- **WHEN** app uses storage
- **THEN** compress/cleanup periodically:
  - Remove attachments >30 days old
  - Archive conversations older than 90 days
  - Keep last 12 months of adherence data
  - Alert user if space critical

### Requirement: Critical Feature Offline Support

Essential features must work offline.

#### Scenario: Offline chat history
- **GIVEN** conversations exist locally
- **WHEN** user is offline
- **WHEN** user opens Chat tab
- **THEN** display all cached conversations
- **AND** allow reading full conversation history
- **AND** prevent sending new messages
- **AND** show "Offline - Cannot send messages" message

#### Scenario: Offline medication reminder
- **GIVEN** medication scheduled for offline time
- **WHEN** device is offline
- **AND** reminder time arrives
- **THEN** local notification fires normally
- **AND** works even if app not open
- **AND** persists through app restart

#### Scenario: Offline adherence
- **GIVEN** user is offline
- **WHEN** medication reminder time arrives
- **THEN** allow user to mark as taken
- **AND** record to local storage
- **AND** no internet required
- **AND** full workflow works without network

#### Scenario: Offline pharmacy access
- **GIVEN** pharmacy data cached
- **WHEN** user is offline
- **WHEN** user opens Pharmacy tab
- **THEN** show cached pharmacies
- **AND** allow searching cached data
- **AND** show distance to pharmacies
- **AND** disable features requiring online (refresh, live on-duty status)

#### Scenario: Offline home screen
- **GIVEN** medications and adherence cached
- **WHEN** user is offline
- **WHEN** user opens Home tab
- **THEN** show:
  - Today's medications
  - Adherence % for current week
  - Favorite pharmacies (cached)
  - Quick stats (all from local data)

### Requirement: Offline Limitations

Clear messaging about what requires internet.

#### Scenario: Chat offline limitation
- **GIVEN** user is offline
- **WHEN** user tries to send chat message
- **THEN** show error: "Internet connection required for AI assistant"
- **AND** show option to use cached FAQs instead
- **AND** suggest: "Will retry when connection restored"

#### Scenario: Pharmacy refresh offline
- **GIVEN** user is offline
- **WHEN** user taps "Refresh" on pharmacy list
- **THEN** show: "Cannot refresh offline. Showing cached data."
- **AND** disable refresh button
- **AND** show last updated time

#### Scenario: Map offline
- **GIVEN** user is offline
- **WHEN** user taps Pharmacy Map
- **THEN** show message: "Maps require internet connection"
- **AND** offer list view instead
- **AND** show list with cached pharmacies

#### Scenario: Backend features offline
- **GIVEN** features require server computation
- **WHEN** offline
- **THEN** disable:
  - AI medication schedule optimization (from chat)
  - OCR for prescription images
  - Bioequivalent lookup
  - Interaction analysis from new medications
- **AND** show appropriate offline messages

### Requirement: Offline Testing and Verification

Offline functionality must be testable.

#### Scenario: Enable offline mode (development)
- **GIVEN** developer wants to test offline
- **WHEN** app is in development mode
- **WHEN** developer toggles "Offline mode" in settings
- **THEN** simulate offline:
  - Block all network requests
  - Show offline indicator
  - Allow testing without disabling WiFi/cellular

#### Scenario: Offline duration testing
- **GIVEN** in offline mode
- **WHEN** testing long offline periods
- **WHEN** user adds/edits medications for 2+ hours
- **THEN** ensure all changes persist
- **AND** allow switching back online
- **AND** sync all changes correctly

#### Scenario: Network toggle testing
- **GIVEN** network detection implemented
- **WHEN** rapidly toggling WiFi on/off
- **THEN** handle state transitions smoothly
- **AND** not lose data
- **AND** queue/sync properly
- **AND** not crash or hang

