## MODIFIED Requirements

### Requirement: Medication Schedule Creation
The system SHALL allow users to create and manage medication schedules from prescriptions.

#### Scenario: Create schedule manually
- **WHEN** user taps "Add Medication" button
- **THEN** navigate to form with fields:
  - Medication name (text input with no autocomplete, MVP)
  - Dosage (text input, e.g., "500mg")
  - Frequency (dropdown: Once, Twice, Thrice, Custom)
  - Time(s) (time pickers for each dose)
  - Start date (date picker, default today)
  - End date (date picker, optional)
  - Notes (text field, optional)

#### Scenario: Save medication schedule
- **WHEN** user completes form and taps Save
- **THEN** validate required fields (name, dosage, frequency, time)
- **AND** save to AsyncStorage (local persistence)
- **AND** sync to Firestore if authenticated
- **AND** return to medication list

#### Scenario: MVP - No prescription upload
- **WHEN** user views Add Medication screen
- **THEN** do NOT show camera/upload button for prescription images
- **AND** deferred to Phase 2

### Requirement: Medication Reminder Notifications
The system SHALL send timely reminders for medication doses.

#### Scenario: Register local reminder
- **WHEN** user saves medication with scheduled time (e.g., 8:00 AM)
- **THEN** register local notification for that time
- **AND** set to repeat daily (or until end date if specified)
- **AND** store notification ID in local record

#### Scenario: Receive reminder
- **WHEN** reminder time arrives
- **THEN** show native notification with:
  - Medication name and dosage
  - Scheduled time
  - "Took It" button (quick action)

#### Scenario: Mark as taken from notification
- **WHEN** user taps "Took It" on notification (without opening app)
- **THEN** record adherence in AsyncStorage
- **AND** dismiss notification
- **AND** add to sync queue for Firestore (if offline)

#### Scenario: Snooze reminder
- **WHEN** user dismisses notification without taking medication
- **THEN** re-show notification in 10 minutes
- **AND** allow user to snooze again or mark as taken

#### Scenario: MVP - No quiet hours yet
- **WHEN** user views notification settings
- **THEN** do NOT show quiet hours option (deferred)
- **AND** all reminders fire at scheduled times

#### Scenario: Edit reminder time
- **WHEN** user edits medication schedule and changes time
- **THEN** cancel old notification
- **AND** register new notification at updated time

### Requirement: Adherence Tracking
The system SHALL track medication adherence and display usage patterns.

#### Scenario: Mark medication taken
- **WHEN** user taps "Took It" on notification OR in app
- **THEN** record timestamp (or use current time)
- **AND** show checkmark on medication in list
- **AND** update adherence history in AsyncStorage

#### Scenario: View today's medications
- **WHEN** user navigates to Medications tab
- **THEN** show list of today's scheduled medications with:
  - Medication name and dosage
  - Scheduled time
  - Status: ✓ (taken) or ○ (pending) or ⏰ (overdue if past time)
  - Tap to mark taken

#### Scenario: Manual marking
- **WHEN** user taps medication in today's list
- **THEN** toggle taken/not taken status
- **AND** record timestamp
- **AND** show confirmation

#### Scenario: Adherence calendar
- **WHEN** user navigates to Adherence tab (or section)
- **THEN** show weekly calendar view:
  - 7-day grid
  - Green background for day where 100% of meds taken
  - Yellow for partial adherence
  - Red for day where no medications taken
  - Weekly percentage (e.g., "71% adherence this week")

#### Scenario: MVP - No detailed history view
- **WHEN** user taps on calendar day
- **THEN** do NOT show detailed medication-by-medication history (deferred)

### Requirement: Medication End Date Management
The system SHALL handle medication discontinuation and schedule cleanup.

#### Scenario: Set end date
- **WHEN** user edits medication or marks as completed
- **THEN** allow setting end date
- **AND** default to today if user selects "Stop now"

#### Scenario: Automatic discontinuation
- **WHEN** medication end date passes
- **THEN** remove from active list
- **AND** move to "Past medications" section
- **AND** stop sending reminders

### Requirement: Medication Notes and Refill Tracking
The system SHALL help users manage prescription refills and add personal notes.

#### Scenario: Add notes to medication
- **WHEN** user taps notes icon on medication card
- **THEN** show text editor where user can enter:
  - Side effects observed
  - Notes for doctor
  - Personal reminders

#### Scenario: View notes
- **WHEN** user views medication details
- **THEN** display notes below medication info

#### Scenario: MVP - No refill tracking
- **WHEN** user views medication
- **THEN** do NOT show refill date or tablet count tracking
- **AND** deferred to Phase 2

### Requirement: Calendar Integration
The system SHALL integrate with device calendar systems for multi-app coordination.

#### Scenario: MVP - No calendar sync
- **WHEN** app runs
- **THEN** do NOT sync to device calendar
- **AND** use local notifications only
- **AND** calendar integration deferred to Phase 2

### Requirement: Multiple Schedule Profiles
The system SHALL support different medication schedules for different situations.

#### Scenario: MVP - Single schedule only
- **WHEN** user uses app
- **THEN** do NOT allow creating multiple profiles/schedules
- **AND** single active medication list only
- **AND** travel profiles deferred to Phase 2

### Requirement: Family/Caregiver Sharing
The system SHALL optionally share medication schedules with family members.

#### Scenario: MVP - No sharing
- **WHEN** user views medication settings
- **THEN** do NOT show caregiver sharing option
- **AND** deferred to Phase 2

### Requirement: Medication Export
The system SHALL allow exporting medication schedules for healthcare providers.

#### Scenario: MVP - No export
- **WHEN** user views medication list
- **THEN** do NOT show export button
- **AND** deferred to Phase 2

