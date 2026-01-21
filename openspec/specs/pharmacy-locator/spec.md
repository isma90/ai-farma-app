# Pharmacy Locator Capability

## Purpose
The system SHALL provide intelligent pharmacy location services with real-time geolocation, on-duty status filtering, and distance calculation to help users find open pharmacies during emergencies.

## Requirements

### Requirement: Real-time Geolocation
The system SHALL obtain and track the user's current geographic position with the user's explicit permission.

#### Scenario: User grants location permission
- **WHEN** user opens the app for the first time
- **THEN** the app requests location permission
- **AND** stores the permission status locally

#### Scenario: Location available
- **WHEN** user grants permission and location services are enabled
- **THEN** the app retrieves and maintains current GPS coordinates with ±100m accuracy

#### Scenario: Location denied
- **WHEN** user denies location permission
- **THEN** the app displays a request to enable location and allows manual search by address

### Requirement: Pharmacy Data Management
The system SHALL maintain a local database of pharmacies updated from official Chilean health ministry sources.

#### Scenario: Initial database load
- **WHEN** app launches for the first time
- **THEN** download complete list of pharmacies from MINSAL API
- **AND** cache in local AsyncStorage
- **AND** store timestamp of last update

#### Scenario: Daily batch update
- **WHEN** background sync runs daily at 2:00 AM (adjustable)
- **THEN** fetch updated pharmacy list from MINSAL API
- **AND** merge with local cache
- **AND** update last modified timestamp

#### Scenario: Offline access
- **WHEN** network is unavailable
- **THEN** display cached pharmacy data
- **AND** show "Data may be outdated" warning if cache older than 7 days

### Requirement: On-Duty Pharmacy Filtering
The system SHALL identify and filter pharmacies operating under the mandatory on-duty rotation system.

#### Scenario: Current on-duty list
- **WHEN** user requests on-duty pharmacies
- **THEN** fetch today's on-duty list from MINSAL Turnos API
- **AND** cache for minimum 1 hour
- **AND** filter main pharmacy list to show only on-duty locations

#### Scenario: Future date on-duty search
- **WHEN** user searches for on-duty pharmacies on a specific date
- **THEN** fetch on-duty list for that date from MINSAL API
- **AND** display applicable pharmacies

#### Scenario: API failure graceful degradation
- **WHEN** on-duty API is unavailable
- **THEN** show all pharmacies with "On-duty status unavailable" notice
- **AND** recommend contacting MINSAL directly

### Requirement: Distance Calculation and Sorting
The system SHALL calculate distances to pharmacies and provide sorted results based on proximity.

#### Scenario: Calculate distance to single pharmacy
- **WHEN** user views pharmacy details
- **THEN** calculate distance using Haversine formula
- **AND** display distance in kilometers with 2 decimal places
- **AND** estimate driving time using Google Maps Directions API

#### Scenario: Sort by proximity
- **WHEN** user views pharmacy list
- **THEN** sort pharmacies by distance from user location (ascending)
- **AND** display only pharmacies within 50km by default
- **AND** allow filter to expand search radius

#### Scenario: Limited GPS accuracy
- **WHEN** GPS accuracy worse than 500m
- **THEN** display accuracy warning
- **AND** show search radius expanded by accuracy margin

### Requirement: Pharmacy Details Display
The system SHALL show comprehensive pharmacy information to aid user decision-making.

#### Scenario: View pharmacy card
- **WHEN** user views pharmacy in list
- **THEN** display:
  - Pharmacy name and chain affiliation
  - Distance and estimated drive time
  - Full address with clickable address
  - Current status (open/on-duty/closed)
  - Phone number (clickable for direct call)
  - Hours of operation
  - Any special notes (24/7, delivery available, etc.)

#### Scenario: View full details screen
- **WHEN** user taps on pharmacy card
- **THEN** navigate to detailed screen with:
  - Address with map preview
  - Complete hours for entire week
  - List of available services (delivery, home consultation)
  - Save as favorite option
  - Navigation buttons (Google Maps, Waze, Apple Maps)

### Requirement: Map View
The system SHALL provide interactive map visualization of nearby pharmacies.

#### Scenario: Display map with markers
- **WHEN** user opens map view
- **THEN** render map centered on user location
- **AND** display markers for up to 50 nearest pharmacies
- **AND** color code markers: green (on-duty), gray (closed), blue (regular hours)

#### Scenario: Select pharmacy from map
- **WHEN** user taps on pharmacy marker
- **THEN** display popup with:
  - Pharmacy name
  - Distance
  - "Navigate" button
  - Link to detailed view

#### Scenario: Map performance optimization
- **WHEN** more than 100 pharmacies in map bounds
- **THEN** cluster markers automatically
- **AND** show count badge on cluster
- **AND** uncluster when zoomed in

### Requirement: Search and Filter
The system SHALL allow users to find pharmacies by address, name, or specific criteria.

#### Scenario: Search by pharmacy name
- **WHEN** user enters pharmacy name in search
- **THEN** filter list to matching pharmacies
- **AND** highlight matching text
- **AND** show results in order of relevance + distance

#### Scenario: Search by address
- **WHEN** user enters address or street name
- **THEN** use geocoding to convert to coordinates
- **AND** show pharmacies near that location
- **AND** allow user to confirm or adjust location

#### Scenario: Filter by region
- **WHEN** user selects a region from dropdown
- **THEN** show only pharmacies in selected region
- **AND** maintain distance sorting

### Requirement: Navigation Integration
The system SHALL provide direct navigation to selected pharmacies using third-party apps.

#### Scenario: Navigate with Google Maps
- **WHEN** user taps "Navigate" button
- **THEN** open Google Maps deep link with pharmacy coordinates
- **AND** set travel mode to driving
- **AND** return to app on back button

#### Scenario: Navigate with Waze
- **WHEN** user selects Waze as navigation app
- **THEN** open Waze deep link if app installed
- **AND** fall back to Maps if Waze not available

#### Scenario: Navigation app selection
- **WHEN** user has not selected default navigation app
- **THEN** show bottom sheet with available options
- **AND** remember user's choice for future sessions

### Requirement: Favorite Pharmacies
The system SHALL allow users to save preferred pharmacies for quick access.

#### Scenario: Save favorite
- **WHEN** user taps heart icon on pharmacy card
- **THEN** save pharmacy to favorites list in AsyncStorage
- **AND** show confirmation toast
- **AND** fill heart icon to indicate saved status

#### Scenario: View favorites
- **WHEN** user navigates to Favorites screen
- **THEN** display list of saved pharmacies sorted by distance
- **AND** show count of favorites
- **AND** allow removal with swipe gesture

#### Scenario: Quick access to favorite
- **WHEN** user adds first favorite
- **THEN** create shortcut on home screen offering quick access
- **AND** show notification preference for nearest saved pharmacy

