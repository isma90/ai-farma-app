# Medication Schedule Capability

## Purpose
The system SHALL help users manage medication schedules with automated reminders, adherence tracking, and integration with device calendars and notification systems.

## Requirements

### Requirement: Medication Schedule Creation
The system SHALL allow users to create and manage medication schedules from prescriptions.

#### Scenario: Create schedule from prescription
- **WHEN** user uploads prescription and confirms extracted medications
- **THEN** display schedule builder with:
  - Medication name and dosage
  - Recommended timing from AI advisor
  - Meal requirement indicator
  - Option to adjust timing

#### Scenario: Manual medication entry
- **WHEN** user selects "Add medication manually"
- **THEN** show form for:
  - Medication name (with autocomplete from ISP database)
  - Dosage and unit
  - Frequency (daily, twice daily, as needed, custom)
  - Preferred times
  - Start and end dates

#### Scenario: Save schedule
- **WHEN** user completes schedule configuration
- **THEN** save to Firestore with:
  - Medication details
  - Prescribed times
  - User's preferred times
  - Start and end dates
  - Any notes

#### Scenario: Schedule conflict warning
- **WHEN** user adds medication with conflicting time
- **THEN** highlight conflict
- **AND** suggest adjusting timing
- **AND** allow user to override if intentional

### Requirement: Medication Reminder Notifications
The system SHALL send timely reminders for medication doses.

#### Scenario: Create reminder
- **WHEN** medication scheduled for specific time
- **THEN** register local notification for device
- **AND** set notification 15 minutes before scheduled time (configurable)
- **AND** include medication name and dosage in notification

#### Scenario: Receive reminder notification
- **WHEN** reminder time arrives and device is unlocked
- **THEN** display notification with:
  - Medication name and dosage
  - Scheduled time
  - Quick actions: "Took It" or "Dismiss"
  - Tap-through to medication detail screen

#### Scenario: Snooze reminder
- **WHEN** user swipes or dismisses notification without taking medication
- **THEN** show reminder again in 10 minutes
- **AND** allow custom snooze duration (5, 15, 30 minutes)
- **AND** update notification count

#### Scenario: Mark as taken
- **WHEN** user taps "Took It" in notification
- **THEN** record timestamp in adherence log
- **AND** dismiss notification
- **AND** show confirmation: "Recorded at [time]"

#### Scenario: Background notifications
- **WHEN** app is closed and reminder time arrives
- **THEN** show notification on lock screen
- **AND** allow "Took It" action from notification without opening app
- **AND** maintain battery efficiency (no continuous background services)

#### Scenario: Quiet hours setting
- **WHEN** user sets quiet hours (e.g., 10 PM - 8 AM)
- **THEN** skip notifications during quiet hours
- **AND** accumulate as urgent reminders on app open
- **AND** still send critical medication notifications (user configurable)

### Requirement: Adherence Tracking
The system SHALL track medication adherence and display usage patterns.

#### Scenario: View today's adherence
- **WHEN** user opens Dashboard/Home screen
- **THEN** display today's medications with:
  - Medication name and scheduled time
  - Status: "Taken" (checkmark), "Pending", "Overdue"
  - Time taken (if recorded)
  - Option to mark as taken manually

#### Scenario: Weekly adherence summary
- **WHEN** user views Adherence screen
- **THEN** display:
  - Weekly calendar view
  - Color coding: green (100% adherence day), yellow (partial), red (missed doses)
  - Completion percentage for the week
  - Trend graph (last 4 weeks)

#### Scenario: Detailed adherence history
- **WHEN** user taps on specific day in calendar
- **THEN** show list of medications and whether taken
- **AND** display times taken with accuracy indicator
- **AND** allow retroactive changes with note option

#### Scenario: Adherence goals
- **WHEN** user sets adherence goal (e.g., 95% weekly)
- **THEN** track against goal
- **AND** show progress indicator
- **AND** send encouragement notification when goal met

#### Scenario: Low adherence alert
- **WHEN** user misses 2+ consecutive doses
- **THEN** send alert notification
- **AND** offer reasons/barriers prompt: "Why did you miss?"
- **AND** suggest solutions based on user response

### Requirement: Medication End Date Management
The system SHALL handle medication discontinuation and schedule cleanup.

#### Scenario: Set medication end date
- **WHEN** user edits medication schedule
- **THEN** allow setting end date
- **AND** show warning if end date is past or very soon
- **AND** offer "end immediately" quick action

#### Scenario: Automatic discontinuation
- **WHEN** medication end date passes
- **THEN** remove from active schedules
- **AND** move to historical medications list
- **AND** stop sending reminders

#### Scenario: View historical medications
- **WHEN** user accesses medication history
- **THEN** display previously taken medications with:
  - Date range when taken
  - Final adherence percentage
  - Option to restore schedule if restarting

### Requirement: Medication Notes and Refill Tracking
The system SHALL help users manage prescription refills and add personal notes.

#### Scenario: Add medication note
- **WHEN** user taps notes icon on medication
- **THEN** show text editor for:
  - Side effects observed
  - Meal impacts
  - Time adjustments that worked
  - Doctor's instructions

#### Scenario: View notes on reminder
- **WHEN** medication notification shows
- **THEN** include note preview
- **AND** allow full view from notification

#### Scenario: Refill tracking
- **WHEN** user sets prescription refill date
- **THEN** calculate days remaining based on:
  - Start date
  - Dosage frequency
  - Tablet count

#### Scenario: Refill reminder
- **WHEN** 3 days before refill needed
- **THEN** send notification: "Time to refill [medication] - [pharmacy]"
- **AND** link to pharmacy search for prescription fulfillment
- **AND** allow quick refill at saved pharmacy

### Requirement: Calendar Integration
The system SHALL integrate with device calendar systems for multi-app coordination.

#### Scenario: Sync to device calendar
- **WHEN** user enables calendar sync
- **THEN** request calendar permission
- **AND** create recurring calendar event for each medication
- **AND** use color coding for medication types

#### Scenario: Calendar event details
- **WHEN** medication appears in device calendar
- **THEN** show in calendar event:
  - Medication name and dosage
  - Meal requirement
  - Notes field with link back to app

#### Scenario: Keep calendar in sync
- **WHEN** user modifies medication schedule in app
- **THEN** automatically update corresponding calendar event
- **AND** maintain bidirectional sync if possible

### Requirement: Multiple Schedule Profiles
The system SHALL support different medication schedules for different situations.

#### Scenario: Create travel schedule
- **WHEN** user taps "Create Travel Plan"
- **THEN** allow creating alternate schedule with:
  - Time zone adjustment
  - Modified timing for traveling
  - Name (e.g., "USA Trip", "Office Hours")
  - Activation period

#### Scenario: Switch between profiles
- **WHEN** user selects active profile
- **THEN** switch all reminders and tracking to that schedule
- **AND** show current profile name in header
- **AND** display warning when profile expires

#### Scenario: Timezone handling
- **WHEN** user enters new timezone
- **THEN** automatically adjust medication times
- **AND** show affected medications
- **AND** ask for confirmation of timing changes

### Requirement: Family/Caregiver Sharing
The system SHALL optionally share medication schedules with family members.

#### Scenario: Invite caregiver
- **WHEN** user enables caregiver sharing
- **THEN** generate shareable link with:
  - Limited sharing token
  - Medication list visibility
  - Adherence tracking read-only
  - Expiration option

#### Scenario: Caregiver views adherence
- **WHEN** caregiver opens shared link
- **THEN** display medication schedule and adherence
- **AND** not allow modifications
- **AND** show summary reports

#### Scenario: Caregiver reminders
- **WHEN** caregiver enabled
- **THEN** option to send reminders to caregiver
- **AND** alert if user misses doses
- **AND** maintain privacy settings per medication

### Requirement: Medication Export
The system SHALL allow exporting medication schedules for healthcare providers.

#### Scenario: Export medication list
- **WHEN** user taps "Export" button
- **THEN** generate PDF with:
  - Current medications and dosages
  - Schedule and timing
  - Adherence summary (last 4 weeks)
  - Any special notes

#### Scenario: Share with doctor
- **WHEN** user selects "Share with doctor"
- **THEN** generate shareable link (temporary)
- **AND** allow sending via email or messaging
- **AND** show warning about sharing medical information

