# Pharmacy Locator Capability

## Purpose

The system SHALL help users find nearby pharmacies, identify which are open (on-duty), and provide navigation to selected pharmacies. Integration with Chilean MINSAL (Ministry of Health) APIs provides real-time pharmacy information.

## Requirements

### Requirement: Pharmacy Data Management

The system SHALL fetch and cache pharmacy data from MINSAL APIs.

#### Scenario: Initial pharmacy data load
- **GIVEN** app launches for first time
- **WHEN** user navigates to Pharmacy tab
- **THEN** fetch complete pharmacy list from MINSAL API
- **AND** cache locally with timestamp
- **AND** show loading indicator while fetching

#### Scenario: On-duty pharmacy data
- **GIVEN** app is running
- **WHEN** user views pharmacy list
- **THEN** fetch daily on-duty list from MINSAL API
- **AND** mark which pharmacies are on-duty (24h available)
- **AND** cache with 1-hour expiration

#### Scenario: Cache expiration
- **GIVEN** cached pharmacy data exists
- **WHEN** 7 days have passed (for full list) or 1 hour (for on-duty)
- **THEN** refresh from API on next app launch
- **AND** show "updating" indicator if user is viewing
- **AND** maintain local cache as fallback

#### Scenario: Background sync
- **GIVEN** app is running in background
- **WHEN** scheduled background task runs (2 AM daily)
- **THEN** fetch latest pharmacy and on-duty lists
- **AND** update local cache silently
- **AND** prepare notifications for any changes

### Requirement: Geolocation and Distance

The system SHALL determine user location and calculate distances to pharmacies.

#### Scenario: Request location permission
- **GIVEN** user first accesses Pharmacy tab
- **WHEN** app needs user location
- **THEN** request permission: "Allow AI Farma to access your location?"
- **AND** explain: "We use this to show nearby pharmacies"
- **AND** allow user to skip and use manual search instead

#### Scenario: Get current location
- **GIVEN** user grants location permission
- **WHEN** user opens Pharmacy tab
- **THEN** get current GPS coordinates
- **AND** show accuracy (e.g., "Accurate to 50m")
- **AND** refresh location every 30 seconds while viewing

#### Scenario: Calculate distances
- **GIVEN** user location is known
- **WHEN** displaying pharmacy list or map
- **THEN** calculate distance from user to each pharmacy
- **AND** use Haversine formula for accuracy
- **AND** display in km (e.g., "2.3 km away")

#### Scenario: Location tracking for navigation
- **GIVEN** user is navigating to pharmacy
- **WHEN** user moves >500m
- **THEN** detect movement
- **AND** recalculate distance
- **AND** update ETA if navigating

#### Scenario: Location denied
- **GIVEN** user denies location permission
- **WHEN** user tries to use Pharmacy features
- **THEN** show message: "Location required to show nearby pharmacies"
- **AND** allow searching by address instead
- **AND** provide link to enable location in Settings

### Requirement: Pharmacy List View

The system SHALL display pharmacies in a scrollable, sortable list.

#### Scenario: Display pharmacy list
- **GIVEN** user is on Pharmacy tab
- **WHEN** list loads
- **THEN** show list of pharmacies with:
  - Pharmacy name
  - Address (clickable)
  - Distance from user (if location available)
  - ETA to reach by car
  - On-duty status (badge: "24H" or "Cerrado")
  - Color code: Green for on-duty, Gray for closed

#### Scenario: List sorting
- **GIVEN** user is viewing pharmacy list
- **WHEN** user taps sort button
- **THEN** show options:
  - By distance (nearest first) [DEFAULT]
  - By name (A-Z)
  - On-duty first
- **AND** re-sort list based on selection

#### Scenario: Pull-to-refresh
- **GIVEN** user is viewing pharmacy list
- **WHEN** user pulls down to refresh
- **THEN** fetch latest on-duty data from API
- **AND** show "Refreshing..." indicator
- **AND** update list with latest info
- **AND** show "Last updated: 2 minutes ago"

#### Scenario: Infinite scroll
- **GIVEN** pharmacy list shows 20 items
- **WHEN** user scrolls to bottom
- **THEN** load next 20 pharmacies
- **AND** show loading spinner
- **AND** append to list without jumping

#### Scenario: Empty list
- **GIVEN** no pharmacies available
- **WHEN** user views pharmacy list
- **THEN** show empty state: "No pharmacies found"
- **AND** suggest checking filters or location
- **AND** provide option to manually search by address

### Requirement: Pharmacy Map View

The system SHALL display pharmacies on an interactive map.

#### Scenario: Display map with markers
- **GIVEN** user taps Map button in Pharmacy tab
- **WHEN** map loads
- **THEN** show Google Map centered on user location
- **AND** place pharmacy markers:
  - Green marker: On-duty pharmacies
  - Gray marker: Closed pharmacies
  - Blue marker: Favorite pharmacies
- **AND** map loads within 3 seconds

#### Scenario: Marker clustering
- **GIVEN** >100 pharmacies visible on map
- **WHEN** map displays markers
- **THEN** cluster nearby markers
- **AND** show cluster count (e.g., "45")
- **AND** uncluster on zoom-in
- **AND** maintain performance

#### Scenario: Info window on marker tap
- **GIVEN** marker is displayed on map
- **WHEN** user taps marker
- **THEN** show info window with:
  - Pharmacy name
  - Distance
  - "View Details" button
  - "Call" button
- **AND** info window disappears on tap outside

#### Scenario: Navigate to detail from map
- **GIVEN** info window is open
- **WHEN** user taps "View Details"
- **THEN** push PharmacyDetailScreen
- **AND** show full pharmacy information
- **AND** allow navigation actions

#### Scenario: Map permissions
- **GIVEN** app requests map display
- **WHEN** location permission not granted
- **THEN** ask for permission again
- **AND** show map centered on default city (Santiago)
- **AND** allow searching by address

### Requirement: Pharmacy Detail Screen

The system SHALL display comprehensive information about a selected pharmacy.

#### Scenario: Display pharmacy details
- **GIVEN** user navigates to PharmacyDetailScreen
- **WHEN** screen loads
- **THEN** display:
  - Pharmacy name and chain logo
  - Full address (clickable → Google Maps)
  - Phone number (clickable → call)
  - Distance and ETA from user
  - Hours of operation (if available)
  - On-duty status (24H or current hours)
  - Available services (if provided)
  - Mini map preview
  - Favorite button (heart icon)
  - Navigation buttons (Google Maps, Waze, Apple Maps)

#### Scenario: Navigation button taps
- **GIVEN** user is viewing PharmacyDetailScreen
- **WHEN** user taps Google Maps button
- **THEN** open Google Maps app
- **AND** start navigation to pharmacy coordinates
- **AND** show ETA and route

#### Scenario: Waze integration
- **GIVEN** user taps Waze button
- **WHEN** Waze app installed
- **THEN** open Waze with destination
- **AND** start navigation
- **WHEN** Waze not installed
- **THEN** show AppStore/PlayStore link

#### Scenario: Call pharmacy
- **GIVEN** user taps phone number
- **WHEN** phone number available
- **THEN** initiate phone call
- **AND** show call in progress
- **WHEN** phone number not available
- **THEN** disable phone button
- **AND** show "No phone available"

#### Scenario: Add to favorites
- **GIVEN** user is viewing pharmacy
- **WHEN** user taps heart icon
- **THEN** add to favorites list
- **AND** heart becomes filled
- **AND** save to AsyncStorage + Firestore
- **AND** show "Added to favorites"

#### Scenario: Remove from favorites
- **GIVEN** pharmacy is favorited
- **WHEN** user taps filled heart
- **THEN** remove from favorites
- **AND** heart becomes unfilled
- **AND** remove from AsyncStorage + Firestore
- **AND** show "Removed from favorites"

### Requirement: Pharmacy Search and Filter

The system SHALL allow users to search and filter pharmacies.

#### Scenario: Search by name
- **GIVEN** user is on Pharmacy tab
- **WHEN** user taps search bar
- **THEN** show search input
- **AND** allow typing pharmacy name
- **AND** apply debouncing (300ms)
- **AND** show matching pharmacies in real-time
- **AND** use fuzzy matching for typos

#### Scenario: Search by address
- **GIVEN** user wants to search by location
- **WHEN** user taps address search
- **THEN** show address input
- **AND** allow typing address
- **AND** geocode address using Google API
- **AND** center map/list on that location
- **AND** show pharmacies nearby (default 10km radius)

#### Scenario: Filter by region
- **GIVEN** user is viewing pharmacy list
- **WHEN** user taps region filter
- **THEN** show dropdown with:
  - All regions
  - Metropolitana (default if in RM)
  - Valparaiso
  - Biobio
  - etc.
- **AND** filter list to selected region

#### Scenario: Filter on-duty only
- **GIVEN** user is viewing pharmacy list
- **WHEN** user taps "On-duty only" toggle
- **THEN** show only 24h pharmacies
- **AND** hide closed/regular hours pharmacies
- **AND** persist filter while on Pharmacy tab

#### Scenario: Distance radius filter
- **GIVEN** user is viewing pharmacy list
- **WHEN** user taps distance filter
- **THEN** show options:
  - 5 km
  - 10 km (default)
  - 25 km
  - 50 km
  - 100+ km
- **AND** filter pharmacies within selected radius
- **AND** show filtered count

### Requirement: Favorites Management

The system SHALL allow saving and managing favorite pharmacies.

#### Scenario: View favorites list
- **GIVEN** user is on Pharmacy tab
- **WHEN** user taps favorites button/tab
- **THEN** show list of favorited pharmacies
- **AND** sorted by distance from user
- **AND** show count (e.g., "5 favorites")
- **AND** show empty state if none favorited

#### Scenario: Swipe to delete favorite
- **GIVEN** user is viewing favorites list
- **WHEN** user swipes left on favorite item
- **THEN** show delete button
- **AND** tapping delete removes from favorites
- **AND** show undo option for 3 seconds
- **AND** update list immediately

#### Scenario: Quick access to favorites
- **GIVEN** user has favorite pharmacies
- **WHEN** user is on Home screen
- **THEN** show "Nearby favorites" section
- **AND** list 2-3 closest favorites
- **AND** allow tapping to view details

### Requirement: Performance Optimization

Pharmacy features SHALL be performant and responsive.

#### Scenario: Virtual scrolling
- **GIVEN** pharmacy list has >1000 items
- **WHEN** user scrolls list
- **THEN** use virtual scrolling
- **AND** only render visible items
- **AND** maintain 60 FPS scroll performance

#### Scenario: Map optimization
- **GIVEN** map displays many markers
- **WHEN** map is visible
- **THEN** limit visible markers to screen bounds
- **AND** cluster off-screen markers
- **AND** update clusters only on pan/zoom
- **AND** maintain 60 FPS

#### Scenario: API rate limiting
- **GIVEN** user searches frequently
- **WHEN** making requests to MINSAL APIs
- **THEN** respect rate limits (100 req/min for pharmacy list)
- **AND** queue requests if needed
- **AND** show user if waiting

### Requirement: Offline Pharmacy Access

Pharmacy data SHALL be accessible offline.

#### Scenario: View cached pharmacies offline
- **GIVEN** user is offline
- **WHEN** user navigates to Pharmacy tab
- **THEN** load cached pharmacy list
- **AND** show "Offline mode" indicator
- **AND** show data age ("Last updated 2 hours ago")
- **AND** disable refresh button

#### Scenario: Offline map view
- **GIVEN** user is offline
- **WHEN** user tries to view map
- **THEN** show message: "Map requires internet connection"
- **AND** offer list view as alternative
- **AND** show user location from cached GPS

#### Scenario: Distance calculation offline
- **GIVEN** user location is known
- **WHEN** viewing pharmacies offline
- **THEN** calculate distances using cached location
- **AND** show distances as usual
- **AND** note that distances may be old

