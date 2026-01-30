# Medication Schedule Management Capability

## Purpose

The system SHALL help users manage medication schedules, track adherence to their treatment regimen, and receive timely reminders. Integration with AI provides intelligent schedule optimization based on pharmacological principles.

## Requirements

### Requirement: Medication Management

The system SHALL allow users to add, edit, and delete medications.

#### Scenario: Add medication manually
- **GIVEN** user is on Medications tab
- **WHEN** user taps "Add Medication" button
- **THEN** navigate to AddMedicationScreen
- **AND** show form with fields:
  - Medication name (text input, autocomplete from database)
  - Dosage (text input, e.g., "500mg")
  - Frequency (dropdown: once daily, twice daily, thrice daily, every 6h, custom)
  - Start date (date picker)
  - End date (date picker, optional)
  - Notes/instructions (text area, optional)

#### Scenario: Add medication via chat
- **GIVEN** user is in Chat
- **WHEN** user describes medications and gets schedule suggestion
- **AND** confirms schedule
- **THEN** create_medication_schedule tool invoked
- **AND** medications added to MedicationScreen automatically
- **AND** show confirmation: "Added to your medications"

#### Scenario: Medication validation
- **GIVEN** user is adding medication
- **WHEN** user enters name
- **THEN** validate against medication database
- **AND** show suggestions if available
- **AND** prevent adding invalid medications

#### Scenario: Save medication
- **GIVEN** user has filled form
- **WHEN** user taps "Save"
- **THEN** validate all required fields
- **AND** save to Firestore + local AsyncStorage
- **AND** trigger notification scheduling
- **AND** return to MedicationScreen
- **AND** show new medication in list

#### Scenario: Edit medication
- **GIVEN** user is viewing medication
- **WHEN** user taps edit button
- **THEN** navigate to edit screen with current values
- **AND** allow changing any field
- **AND** save changes
- **AND** update reminders if times changed

#### Scenario: Delete medication
- **GIVEN** user is viewing medication
- **WHEN** user taps delete button
- **THEN** show confirmation: "Remove [Medication] from schedule?"
- **AND** if confirmed, delete from Firestore + local storage
- **AND** cancel associated reminders
- **AND** move to medication history
- **AND** show undo option for 5 seconds

### Requirement: Medication Schedule Optimization

The system SHALL suggest optimal times for taking medications.

#### Scenario: AI schedule generation
- **GIVEN** user provides medications with frequencies
- **WHEN** using chat flow and selecting schedule option
- **THEN** backend analyzes:
  - Each medication's peak absorption time
  - Food interaction requirements
  - Half-life duration
  - Optimal spacing between doses
  - Interaction avoidance

#### Scenario: Example schedule generation
- **GIVEN** user provides: Enalapril 10mg once daily, Atorvastatin 20mg once daily, Omeprazol 20mg once daily
- **WHEN** system generates schedule
- **THEN** suggest:
  - 7:30 AM - Omeprazol (30 min before breakfast)
  - 8:00 AM - Enalapril with breakfast
  - 10:00 PM - Atorvastatin (optimal nighttime absorption)
- **AND** display with meal timing requirements

#### Scenario: Conflict resolution
- **GIVEN** two medications have conflicting optimal times
- **WHEN** system detects conflict
- **THEN** suggest safe compromise
- **AND** explain trade-off: "Enalapril works better at 8 AM, but taking with Aspirin is safe at 8 AM"
- **AND** recommend discussing timing optimization with doctor

#### Scenario: Medication interaction optimization
- **GIVEN** multiple medications scheduled
- **WHEN** generating schedule
- **THEN** minimize interactions by spacing doses
- **AND** never schedule known dangerous combinations together
- **AND** flag serious interactions that require medical attention

### Requirement: Local Reminder Scheduling

The system SHALL send local notifications for medication reminders.

#### Scenario: Schedule reminder
- **GIVEN** user adds medication with time 8:00 AM
- **WHEN** medication is saved
- **THEN** schedule local notification:
  - Time: 8:00 AM (or 15 minutes before if set)
  - Title: "Time to take [Medication]"
  - Body: "[Dosage] - [Instructions if any]"
  - Action button: "Took it" and "Snooze"

#### Scenario: Notification permissions
- **GIVEN** first medication is added
- **WHEN** app needs to schedule notification
- **THEN** request notification permission if not granted
- **AND** explain: "We'll send reminders when it's time to take medications"
- **AND** allow user to skip for now

#### Scenario: Notification delivery
- **GIVEN** reminder is scheduled
- **WHEN** scheduled time arrives
- **THEN** show notification on lock screen
- **AND** notification sound/vibration based on user settings
- **AND** notification persists until dismissed

#### Scenario: Notification action - Took it
- **GIVEN** user sees notification
- **WHEN** user taps "Took it" action
- **THEN** mark medication as taken
- **AND** record timestamp
- **AND** dismiss notification
- **AND** update adherence tracking

#### Scenario: Notification action - Snooze
- **GIVEN** user sees notification
- **WHEN** user taps "Snooze"
- **THEN** reschedule notification for 15 minutes later
- **AND** show "Snoozed until [time]"
- **AND** allow snoozing multiple times

#### Scenario: Modify reminder timing
- **GIVEN** user has reminder configured
- **WHEN** user changes advance reminder setting (default 15 min before)
- **THEN** reschedule all existing reminders
- **AND** apply new timing to future medications

#### Scenario: Quiet hours
- **GIVEN** user configures quiet hours (e.g., 22:00 - 08:00)
- **WHEN** reminder is scheduled during quiet hours
- **THEN** skip notification sound
- **AND** show silent notification only
- **AND** send notification at quiet hours end if needed

### Requirement: Adherence Tracking

The system SHALL track whether user took medications as scheduled.

#### Scenario: Mark medication taken
- **GIVEN** user is on Medications screen
- **WHEN** user taps "Took it" button for today's medication
- **THEN** mark as taken
- **AND** record timestamp
- **AND** save to local AsyncStorage + Firestore
- **AND** update visual status (checkmark)
- **AND** show confirmation

#### Scenario: Today's medications view
- **GIVEN** user is on Medications tab
- **WHEN** tab loads
- **THEN** show "Today's Medications" section with:
  - List of medications scheduled for today
  - Scheduled time for each
  - Status: "Taken" (✓), "Pending" (⏰), "Overdue" (⚠️)
  - Mark as taken button for pending/overdue

#### Scenario: Medication status colors
- **THEN** use color coding:
  - Green ✓: Taken at scheduled time
  - Blue ⏰: Pending (not yet time or not taken)
  - Orange ⚠️: Overdue (scheduled time passed)
  - Gray X: Skipped/missed

#### Scenario: Mark late medication
- **GIVEN** medication scheduled time has passed
- **WHEN** user taps "Took it" (overdue)
- **THEN** record as taken with actual timestamp
- **AND** show "Taken late at [time]"
- **AND** still count toward adherence but flag as delayed

#### Scenario: Adherence calendar view
- **GIVEN** user is on Medications tab
- **WHEN** user scrolls down
- **THEN** show weekly adherence calendar:
  - 7 days shown
  - Color coding: Green (100% adherence), Yellow (partial), Red (low), Gray (no meds)
  - Current week highlighted
  - Completion percentage: "78% this week"

#### Scenario: Adherence history
- **GIVEN** user taps on calendar date
- **WHEN** date is selected
- **THEN** show details for that day:
  - Medications scheduled
  - Times and whether taken
  - Late/missed medications
  - Completion % for day

#### Scenario: Offline adherence tracking
- **GIVEN** user is offline
- **WHEN** user marks medication taken
- **THEN** save locally to AsyncStorage
- **AND** queue for Firestore sync
- **AND** sync when connection restored

### Requirement: Medication History and Archive

The system SHALL manage completed and past medications.

#### Scenario: Medication completion
- **GIVEN** medication has end date
- **WHEN** end date is reached
- **THEN** automatically move to history
- **AND** archive adherence data
- **AND** remove from active Medications tab

#### Scenario: View medication history
- **GIVEN** user is on Medications tab
- **WHEN** user scrolls to bottom or taps history section
- **THEN** show archived medications:
  - List of completed medications
  - End date of treatment
  - Final adherence % for that medication
  - Restore button

#### Scenario: Restore archived medication
- **GIVEN** user is viewing history
- **WHEN** user taps restore on archived medication
- **THEN** move back to active medications
- **AND** restart schedule from current date
- **AND** ask for new end date

#### Scenario: Medication timeline
- **GIVEN** user views detailed medication history
- **WHEN** viewing past medications
- **THEN** show timeline:
  - Start date → End date
  - Duration (X days/weeks/months)
  - Total doses taken
  - Overall adherence %

### Requirement: Notification Settings

The system SHALL allow customization of reminder behavior.

#### Scenario: Reminder advance time
- **GIVEN** user is in Settings
- **WHEN** user taps "Medication Reminders"
- **THEN** show advance reminder options:
  - 5 minutes before
  - 15 minutes before (default)
  - 30 minutes before
  - 1 hour before
  - At time (no advance)
- **AND** update all existing reminders

#### Scenario: Quiet hours configuration
- **GIVEN** user is in Settings
- **WHEN** user taps "Quiet Hours"
- **THEN** show time pickers:
  - Start time (e.g., 22:00)
  - End time (e.g., 08:00)
- **AND** notifications silent during this period
- **AND** save setting

#### Scenario: Sound and vibration
- **GIVEN** user is in Settings
- **WHEN** user taps "Notification Sound"
- **THEN** show options:
  - Sound enabled/disabled (with preview button)
  - Vibration enabled/disabled (with test button)
  - Sound volume (if enabled)

#### Scenario: Test notification
- **GIVEN** user taps test button
- **WHEN** button tapped
- **THEN** send test notification immediately
- **AND** show "Test notification sent"
- **AND** allow user to verify sound/vibration works

### Requirement: Drug Interaction Checking

The system SHALL warn about dangerous medication combinations.

#### Scenario: Check interactions on add
- **GIVEN** user adds medication to schedule
- **WHEN** medication is saved
- **THEN** analyze against existing medications
- **AND** check for:
  - Serious interactions (e.g., Warfarin + Aspirin)
  - Moderate interactions (e.g., SSRI + Tramadol)
  - Food interactions

#### Scenario: Display interaction warning
- **GIVEN** serious interaction detected
- **WHEN** medication added
- **THEN** show red warning dialog:
  - "⚠️ SERIOUS INTERACTION DETECTED"
  - Explain interaction mechanism
  - Recommend "Consult pharmacist or doctor before proceeding"
  - Option to edit dosage/time or cancel

#### Scenario: Moderate interaction warning
- **GIVEN** moderate interaction detected
- **WHEN** medication added
- **THEN** show yellow warning:
  - "Potential interaction: [Med A] + [Med B]"
  - Explanation and mitigation (e.g., "Monitor for dizziness")
  - Allow proceeding but recommend discussion with doctor

#### Scenario: Safe combination confirmation
- **GIVEN** no interactions detected
- **WHEN** medication added
- **THEN** show green confirmation:
  - "✓ No known interactions with current medications"
  - "It's safe to take these together"

### Requirement: Medication Information

The system SHALL provide information about scheduled medications.

#### Scenario: View medication details
- **GIVEN** user taps on active medication
- **WHEN** detail screen opens
- **THEN** show:
  - Medication name and active ingredient
  - Current dosage
  - Frequency
  - How to take (with/without food, spacing, etc.)
  - Common side effects (if available)
  - When started
  - When ends (if applicable)
  - Edit and delete buttons

#### Scenario: Medication info from chat
- **GIVEN** user asks about medication in chat
- **WHEN** user asks "Tell me about [Medication]"
- **THEN** backend provides:
  - Uses and indications
  - How to take it
  - Common and serious side effects
  - Food/drug interactions
  - When to contact doctor

#### Scenario: Side effect timeline
- **GIVEN** user views medication details
- **WHEN** user taps "Side Effects"
- **THEN** show:
  - Common side effects (>5% occurrence)
  - When they typically start (immediately, days, weeks)
  - How long they usually last
  - Which are temporary vs concerning

### Requirement: Medication Synchronization

Medication data SHALL sync between local and cloud.

#### Scenario: Add medication offline
- **GIVEN** user is offline
- **WHEN** user adds medication
- **THEN** save locally to AsyncStorage
- **AND** show "Syncing..." indicator (not "Saved")
- **AND** queue for sync

#### Scenario: Sync when reconnected
- **GIVEN** changes made while offline
- **WHEN** internet connection restored
- **THEN** automatically sync to Firestore
- **AND** show "Syncing..." briefly
- **AND** resolve conflicts if edits on both sides
- **AND** show "Synced" confirmation

#### Scenario: Multi-device sync
- **GIVEN** user logs in on another device
- **WHEN** second device launches
- **THEN** fetch medications from Firestore
- **AND** show current medications on new device
- **AND** maintain adherence history across devices

