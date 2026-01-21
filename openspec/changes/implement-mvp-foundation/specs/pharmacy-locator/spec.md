## MODIFIED Requirements

### Requirement: Real-time Geolocation
The system SHALL obtain and track the user's current geographic position with the user's explicit permission.

#### Scenario: User grants location permission
- **WHEN** user opens app for the first time
- **THEN** the app requests location permission
- **AND** stores the permission status locally

#### Scenario: Location available
- **WHEN** user grants permission and location services are enabled
- **THEN** the app retrieves and maintains current GPS coordinates with ±100m accuracy

#### Scenario: Location denied
- **WHEN** user denies location permission
- **THEN** the app displays a request to enable location and allows manual search by address

#### Scenario: MVP - One-time location request
- **WHEN** user opens Pharmacy List or Map screen
- **THEN** request location once and cache for session
- **AND** refresh location when user manually pulls down (not continuous)
- **AND** do NOT request location every time app opens (reduce permission spam)

### Requirement: Pharmacy Data Management
The system SHALL maintain a local database of pharmacies updated from official Chilean health ministry sources.

#### Scenario: Initial database load
- **WHEN** app launches for the first time
- **THEN** download complete list of pharmacies from MINSAL API
- **AND** cache in AsyncStorage (not database, keep MVP simple)
- **AND** store timestamp of last update

#### Scenario: Daily batch update
- **WHEN** background sync runs daily at 2:00 AM (adjustable in settings)
- **THEN** fetch updated pharmacy list from MINSAL API
- **AND** merge with local cache
- **AND** update last modified timestamp

#### Scenario: MVP - Manual refresh
- **WHEN** user pulls to refresh on pharmacy list
- **THEN** immediately fetch fresh pharmacy list from MINSAL API
- **AND** update AsyncStorage cache
- **AND** show loading indicator during fetch

#### Scenario: Offline access
- **WHEN** network is unavailable
- **THEN** display cached pharmacy data
- **AND** show "Data from [date]" timestamp
- **AND** show "Offline" indicator at top

### Requirement: On-Duty Pharmacy Filtering
The system SHALL identify and filter pharmacies operating under the mandatory on-duty rotation system.

#### Scenario: Current on-duty list
- **WHEN** user opens app or refreshes pharmacy list
- **THEN** fetch today's on-duty list from MINSAL Turnos API
- **AND** cache with 1-hour expiration
- **AND** filter main pharmacy list to show only on-duty locations by default
- **AND** show "on-duty" badge on pharmacy cards

#### Scenario: MVP - No future date selection
- **WHEN** user is on pharmacy list
- **THEN** only show on-duty for today
- **AND** allow filter toggle for "All Pharmacies" vs "On-duty Only"
- **AND** future date selection deferred to Phase 2

#### Scenario: API failure graceful degradation
- **WHEN** on-duty API is unavailable
- **THEN** show all pharmacies with "On-duty status unavailable" notice
- **AND** recommend checking MINSAL website directly

### Requirement: Distance Calculation and Sorting
The system SHALL calculate distances to pharmacies and provide sorted results based on proximity.

#### Scenario: Calculate distance to single pharmacy
- **WHEN** user views pharmacy in list or opens details
- **THEN** calculate distance using Haversine formula (client-side)
- **AND** display distance in kilometers with 1 decimal place
- **AND** show driving time estimate from Google Maps Directions API if available

#### Scenario: Sort by proximity
- **WHEN** user views pharmacy list
- **THEN** sort pharmacies by distance from user location (ascending)
- **AND** display only pharmacies within 50km by default
- **AND** allow filter to expand search radius (5km, 10km, 25km, 50km, all)

#### Scenario: Limited GPS accuracy
- **WHEN** GPS accuracy worse than 500m
- **THEN** show distance ranges ("8-9 km") instead of exact distance
- **AND** display "Low GPS accuracy" warning tooltip

#### Scenario: MVP - No real-time refresh
- **WHEN** user moves more than 500m
- **THEN** do NOT automatically refresh list
- **AND** user must manually pull to refresh
- **AND** continuous tracking deferred to Phase 2

### Requirement: Pharmacy Details Display
The system SHALL show comprehensive pharmacy information to aid user decision-making.

#### Scenario: View pharmacy card
- **WHEN** user views pharmacy in list
- **THEN** display:
  - Pharmacy name
  - Distance (or range if low accuracy)
  - On-duty status (green badge if yes)
  - Save favorite button (heart icon)

#### Scenario: View full details screen
- **WHEN** user taps on pharmacy card
- **THEN** navigate to detailed screen showing:
  - Pharmacy name
  - Full address (formatted)
  - Phone number (clickable to call)
  - Distance and driving time (if available)
  - Hours of operation (displayed as returned by API)
  - On-duty status
  - Navigation buttons (Google Maps, Waze)
  - Save favorite button

#### Scenario: MVP - Limited details
- **WHEN** user views pharmacy details
- **THEN** do NOT show:
  - Services list (deferred)
  - Photos (deferred)
  - Reviews (deferred)
- **AND** keep details screen simple and fast-loading

### Requirement: Map View
The system SHALL provide interactive map visualization of nearby pharmacies.

#### Scenario: Display map with markers
- **WHEN** user opens map view
- **THEN** render map centered on user location
- **AND** display markers for up to 50 nearest pharmacies
- **AND** color code: green (on-duty), gray (regular hours)

#### Scenario: MVP - Limited map features
- **WHEN** more than 100 pharmacies in view
- **THEN** cluster markers (show count badge on cluster)
- **AND** uncluster when zoomed in
- **AND** do NOT allow following user location (static centered view)

#### Scenario: Select pharmacy from map
- **WHEN** user taps on pharmacy marker
- **THEN** show popup with pharmacy name, distance, "View Details" button
- **AND** tapping "View Details" navigates to details screen

### Requirement: Search and Filter
The system SHALL allow users to find pharmacies by address, name, or specific criteria.

#### Scenario: Search by pharmacy name
- **WHEN** user types in search box
- **THEN** filter cached pharmacy list in real-time
- **AND** show results matching pharmacy name
- **AND** highlight matching text

#### Scenario: Search by address
- **WHEN** user enters address in search box
- **THEN** use Google Geocoding API to convert to coordinates
- **AND** show pharmacies near that location
- **AND** this becomes the new reference point for distances

#### Scenario: MVP - No region filter yet
- **WHEN** user views pharmacy list
- **THEN** do NOT show region dropdown (deferred)
- **AND** rely on search and distance filters

#### Scenario: Distance filter
- **WHEN** user selects distance filter (5km, 10km, 25km, 50km)
- **THEN** show only pharmacies within that radius
- **AND** update list in real-time

### Requirement: Navigation Integration
The system SHALL provide direct navigation to selected pharmacies using third-party apps.

#### Scenario: Navigate with Google Maps
- **WHEN** user taps "Navigate" button
- **THEN** open Google Maps using deep link with pharmacy coordinates
- **AND** set to driving mode
- **AND** do NOT wait for return (user navigates independently)

#### Scenario: Navigate with Waze
- **WHEN** user selects Waze
- **THEN** open Waze deep link if app installed on device
- **AND** fall back to Google Maps if Waze not available

#### Scenario: MVP - Single app preference
- **WHEN** user taps "Navigate"
- **THEN** show sheet with options: Google Maps, Waze, Cancel
- **AND** do NOT remember preference (deferred)

### Requirement: Favorite Pharmacies
The system SHALL allow users to save preferred pharmacies for quick access.

#### Scenario: Save favorite
- **WHEN** user taps heart icon on pharmacy card
- **THEN** save pharmacy ID to AsyncStorage
- **AND** also sync to Firestore if authenticated
- **AND** show filled heart icon (feedback)

#### Scenario: View favorites
- **WHEN** user navigates to Favorites screen
- **THEN** display list of saved pharmacies sorted by distance
- **AND** allow removing with heart-tap toggle

#### Scenario: MVP - No shortcuts
- **WHEN** user adds first favorite
- **THEN** do NOT create home screen shortcuts (deferred)
- **AND** access via dedicated Favorites tab instead

