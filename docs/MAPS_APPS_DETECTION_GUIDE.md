# Detecting and Opening Multiple Maps Applications in React Native/Expo

## Overview

This document provides a comprehensive guide for detecting which maps applications are installed on iOS and Android devices, and how to open them with navigation requests. This is particularly useful for the AI Farma pharmacy locator app to provide users with multiple navigation options.

## Table of Contents

1. [Current Implementation](#current-implementation)
2. [URL Schemes and Deep Links](#url-schemes-and-deep-links)
3. [Detection Methods](#detection-methods)
4. [iOS Configuration](#ios-configuration)
5. [Android Configuration](#android-configuration)
6. [Recommended Solution: react-native-map-link](#recommended-solution-react-native-map-link)
7. [Implementation Example](#implementation-example)
8. [Error Handling & Best Practices](#error-handling--best-practices)
9. [Testing Checklist](#testing-checklist)

---

## Current Implementation

The AI Farma app currently has a basic maps implementation in `PharmacyDetailScreen.tsx`:

```typescript
const handleOpenMap = () => {
  if (!pharmacy) return;

  const url =
    Platform.OS === 'ios'
      ? `maps://maps.apple.com/?q=${pharmacy.nombre}&address=${pharmacy.direccion}`
      : `geo:${pharmacy.latitud},${pharmacy.longitud}?q=${pharmacy.nombre}`;

  Linking.openURL(url).catch(() => {
    console.error('Failed to open maps');
  });
};
```

**Limitations:**
- Only opens the default maps app (Apple Maps on iOS, Google Maps on Android)
- No detection of which apps are installed
- No fallback if the maps app fails to open
- No option for users to choose between available maps apps
- No distinction between showing location vs. starting navigation

---

## URL Schemes and Deep Links

### Supported Maps Applications

The following maps applications can be opened via URL schemes from React Native:

| App | iOS Scheme | Android | Notes |
|-----|-----------|---------|-------|
| **Apple Maps** | `maps://` or `http(s)://maps.apple.com` | N/A | Default on iOS |
| **Google Maps** | `comgooglemaps://` | `geo:` or intent | Can use `comgooglemapsurl://` |
| **Waze** | `waze://` | `waze://` | Web fallback: `https://waze.com/ul` |
| **Uber** | `uber://` | `uber://` | Ride-sharing integration |
| **Lyft** | `lyft://` | `lyft://` | Ride-sharing integration |
| **Citymapper** | `citymapper://` | Available | City transit info |
| **Yandex Maps** | `yandexmaps://` | `yandexmaps://` | Popular in Russia/CIS |
| **Kakao Map** | `kakaomap://` | `kakaomap://` | Popular in Korea |

### Detailed URL Scheme Format

#### Apple Maps

**View a location:**
```
maps://maps.apple.com/?ll=40.75889500,-73.98513100
maps://maps.apple.com/?q=Pizza
maps://maps.apple.com/?address=1600%20Pennsylvania%20Avenue,Washington,DC
```

**Get directions:**
```
maps://maps.apple.com/?saddr=40.7580,-73.9855&daddr=40.7489,-73.9680
```

**Parameters:**
- `ll` - Latitude and longitude (required for location, in decimal format)
- `q` - Query for search (address or place name)
- `address` - Specific address
- `saddr` - Starting address for directions
- `daddr` - Destination address for directions
- `maptype` - `standard` or `satellite`
- `z` - Zoom level

#### Google Maps (iOS - `comgooglemaps://`)

**View a location:**
```
comgooglemaps://?center=40.75889500,-73.98513100&zoom=15&views=satellite
```

**Search:**
```
comgooglemaps://?q=Pizza+restaurants
```

**Get directions:**
```
comgooglemaps://?saddr=40.7580,-73.9855&daddr=40.7489,-73.9680&directionsmode=driving
```

**Parameters:**
- `center` - Map center coordinates (latitude,longitude)
- `zoom` - Zoom level (0-21)
- `views` - `satellite`, `traffic`, `transit` (comma-separated for multiple)
- `mapmode` - `standard` or `streetview`
- `q` - Search query
- `saddr` - Starting point for directions
- `daddr` - Destination point for directions
- `directionsmode` - `driving`, `transit`, `bicycling`, `walking`

**Android fallback via URL intent:**
```
intent://maps.google.com/maps?q=40.75889500,-73.98513100#Intent;scheme=https;package=com.google.android.apps.maps;end
```

#### Waze

**View a location:**
```
https://waze.com/ul?ll=40.75889500,-73.98513100&navigate=no
waze://ul?ll=40.75889500,-73.98513100
```

**Start navigation:**
```
https://waze.com/ul?ll=40.75889500,-73.98513100&navigate=yes
waze://ul?ll=40.75889500,-73.98513100&navigate=yes
```

**Search with navigation:**
```
https://waze.com/ul?q=Pizza&navigate=yes
```

**Parameters:**
- `ll` - Latitude,longitude coordinates
- `q` - Search query (must be URL-encoded)
- `navigate` - `yes` for navigation, `no` for viewing
- `z` or `zoom` - Zoom level (6-8192)
- `favorite` - `home` or `work` to navigate to saved locations
- `utm_source` - Your app identifier for tracking

**Important Notes:**
- Use `https://waze.com/ul` as base URL for better fallback support
- Only use `waze://` if you've verified the app is installed
- Coordinates must be URL-encoded (spaces become `%20`, commas become `%2C`)

---

## Detection Methods

### Method 1: Using Linking.canOpenURL (Native React)

**Pros:**
- Built into React Native
- No additional dependencies
- Lightweight

**Cons:**
- Requires Info.plist configuration on iOS
- Requires AndroidManifest.xml configuration on Android 11+
- Manual app detection needed
- No UI helper (action sheet/modal)

**Code Example:**

```typescript
import { Linking, Platform } from 'react-native';

const mapsApps = [
  { id: 'apple-maps', scheme: 'maps://', name: 'Apple Maps', isDefault: Platform.OS === 'ios' },
  { id: 'google-maps', scheme: 'comgooglemaps://', name: 'Google Maps' },
  { id: 'waze', scheme: 'waze://', name: 'Waze' },
];

async function getInstalledMapsApps() {
  const installed = [];

  for (const app of mapsApps) {
    try {
      const canOpen = await Linking.canOpenURL(app.scheme);
      if (canOpen) {
        installed.push(app);
      }
    } catch (error) {
      console.error(`Error checking ${app.name}:`, error);
    }
  }

  return installed;
}
```

### Method 2: Using react-native-map-link (Recommended)

**Pros:**
- Detects apps automatically via `getApps()`
- Auto-generates action sheet/alert UI
- Handles URL encoding automatically
- Extensive app support (20+)
- Cross-platform consistency
- Returns app icons and metadata
- Advanced filtering options

**Cons:**
- Additional dependency
- Requires native configuration for iOS/Android
- May need development build (not Expo Go on iOS)

**Code Example:**

```typescript
import { getApps, showLocation } from 'react-native-map-link';

// Option 1: Simple - Show built-in action sheet
const handleOpenMaps = async () => {
  try {
    await showLocation({
      latitude: pharmacy.latitud,
      longitude: pharmacy.longitud,
      title: pharmacy.nombre,
      sourceLatitude: userLocation.latitude, // For directions
      sourceLongitude: userLocation.longitude,
      directionsMode: 'driving',
    });
  } catch (error) {
    console.error('Error opening maps:', error);
  }
};

// Option 2: Advanced - Custom UI with getApps
const handleOpenMapsCustom = async () => {
  try {
    const availableApps = await getApps({
      latitude: pharmacy.latitud,
      longitude: pharmacy.longitud,
      title: pharmacy.nombre,
      address: pharmacy.direccion,
      // Filter to show only specific apps
      appsWhiteList: ['google-maps', 'apple-maps', 'waze'],
    });

    // Display custom menu (e.g., bottom sheet modal)
    setAvailableApps(availableApps);
    setShowMapsMenu(true);
  } catch (error) {
    console.error('Error getting available maps apps:', error);
  }
};

// When user selects an app from menu:
const selectMapApp = (app: GetAppResult) => {
  app.open(); // Built-in function to open the app
};
```

---

## iOS Configuration

### Requirement 1: Info.plist Configuration

On iOS, you must declare which URL schemes your app is allowed to query in `Info.plist`. This is a security/privacy requirement added in iOS 9+.

**Two Configuration Options:**

#### Option A: Expo app.json (Recommended)

Update `/app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "LSApplicationQueriesSchemes": [
          "maps",
          "comgooglemaps",
          "waze",
          "citymapper",
          "uber",
          "lyft",
          "yandexmaps",
          "kakaomap"
        ]
      }
    }
  }
}
```

#### Option B: Direct Info.plist

If you have an `Info.plist` file:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <item>maps</item>
  <item>comgooglemaps</item>
  <item>waze</item>
  <item>citymapper</item>
  <item>uber</item>
  <item>lyft</item>
  <item>yandexmaps</item>
  <item>kakaomap</item>
</array>
```

**Important Notes:**
- Do NOT include `://` in the scheme names (just `waze`, not `waze://`)
- Each app URL you want to check must be listed
- Omitting a scheme will make `canOpenURL` return false for that app
- This is a privacy feature to prevent apps from silently enumerating installed apps
- Changes require rebuild/eas build (cannot test in Expo Go)

### Requirement 2: Deployment Target

Ensure your iOS deployment target supports the maps features:

```json
{
  "expo": {
    "ios": {
      "deploymentTarget": "13.4"
    }
  }
}
```

### Testing on iOS

- Use a development build: `eas build --platform ios`
- Cannot test in Expo Go (Info.plist not supported)
- Test on real device or simulator with development build
- Verify permission with: `canOpenURL('maps://')`

---

## Android Configuration

### Requirement 1: AndroidManifest.xml (Android 11+)

Starting with Android 11 (SDK 30), the `<queries>` element must be added to declare which apps you want to interact with.

If using Expo with a development build, update your `app.json`:

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "maps.google.com"
            },
            {
              "scheme": "geo"
            }
          ]
        }
      ]
    }
  }
}
```

Or update `AndroidManifest.xml` directly:

```xml
<manifest>
  ...
  <queries>
    <intent>
      <action android:name="android.intent.action.VIEW" />
      <data android:scheme="geo" />
    </intent>
    <intent>
      <action android:name="android.intent.action.VIEW" />
      <data
        android:scheme="https"
        android:host="maps.google.com" />
    </intent>
    <intent>
      <action android:name="android.intent.action.VIEW" />
      <data
        android:scheme="https"
        android:host="waze.com" />
    </intent>
    <!-- Package names for specific apps -->
    <package android:name="com.google.android.apps.maps" />
    <package android:name="com.waze" />
  </queries>
  ...
</manifest>
```

### Requirement 2: Android URL Intent

For Android, Google Maps uses different URL schemes:

**Standard geo URI (works with any maps app):**
```
geo:40.75889500,-73.98513100
geo:40.75889500,-73.98513100?q=Pizza
```

**Google Maps intent:**
```
intent://maps.google.com/maps?q=40.75889500,-73.98513100#Intent;scheme=https;package=com.google.android.apps.maps;end;
```

**Waze URL:**
```
https://waze.com/ul?ll=40.75889500,-73.98513100&navigate=yes
waze://ul?ll=40.75889500,-73.98513100&navigate=yes
```

### Testing on Android

- Works in Expo Go
- Test with: `adb shell am start -a android.intent.action.VIEW "geo:..."`
- Verify app is installed: `adb shell pm list packages | grep maps`

---

## Recommended Solution: react-native-map-link

### Installation

```bash
npm install react-native-map-link
# or
yarn add react-native-map-link
```

**For Expo apps:**
```bash
expo install react-native-map-link
```

### Setup

#### iOS Setup

1. **Update app.json with Info.plist:**

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "LSApplicationQueriesSchemes": [
          "maps",
          "comgooglemaps",
          "citymapper",
          "waze",
          "yandexmaps",
          "kakaomap",
          "lyft",
          "uber"
        ]
      }
    }
  }
}
```

2. **Build development version:**

```bash
eas build --platform ios
```

#### Android Setup

1. **Update app.json with queries:**

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "geo"
            },
            {
              "scheme": "https",
              "host": "maps.google.com"
            },
            {
              "scheme": "https",
              "host": "waze.com"
            }
          ]
        }
      ]
    }
  }
}
```

2. **Rebuild if using development build:**

```bash
eas build --platform android
```

### Basic Usage

```typescript
import { showLocation } from 'react-native-map-link';

const openMapForPharmacy = async () => {
  try {
    await showLocation({
      latitude: pharmacy.latitud,
      longitude: pharmacy.longitud,
      title: pharmacy.nombre,
      address: pharmacy.direccion,
      sourceLatitude: userLocation.latitude,
      sourceLongitude: userLocation.longitude,
      directionsMode: 'driving',
      alwaysIncludeGoogle: true, // Always show Google Maps on Android
    });
  } catch (error) {
    console.error('Error opening maps:', error);
    // Fallback: open in browser
    Linking.openURL(`https://maps.google.com/?q=${pharmacy.latitud},${pharmacy.longitud}`);
  }
};
```

### Advanced Usage with Custom UI

```typescript
import { getApps, GetAppResult } from 'react-native-map-link';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';

const openMapsWithCustomUI = async (pharmacy: IPharmacy) => {
  try {
    const availableApps = await getApps({
      latitude: pharmacy.latitud,
      longitude: pharmacy.longitud,
      address: pharmacy.direccion,
      title: pharmacy.nombre,
      appsWhiteList: ['google-maps', 'apple-maps', 'waze'],
      // Filter apps
    });

    if (availableApps.length === 0) {
      showNoAppsAlert();
      return;
    }

    if (availableApps.length === 1) {
      // Only one app, open it directly
      availableApps[0].open();
      return;
    }

    // Multiple apps, show custom menu
    setAvailableMapsApps(availableApps);
    setShowMapsSelector(true);
  } catch (error) {
    console.error('Error getting maps apps:', error);
    fallbackToWebMaps(pharmacy);
  }
};

// Custom Maps Selector Component
const MapsSelector = ({ apps, onSelect, onClose }) => (
  <Modal visible={true} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Abrir en mapa</Text>

        <FlatList
          data={apps}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.appButton}
              onPress={() => {
                item.open();
                onClose();
              }}
            >
              {item.icon && (
                <Image source={item.icon} style={styles.appIcon} />
              )}
              <Text style={styles.appName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  appButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 4,
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
```

---

## Implementation Example

### Complete Service Implementation

Here's how to implement a `MapsService` for the AI Farma app:

```typescript
// src/services/MapsService.ts

import { Linking, Platform, Alert } from 'react-native';
import { getApps, showLocation, GetAppResult } from 'react-native-map-link';

interface MapLocation {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
}

interface NavigationOptions {
  sourceLatitude?: number;
  sourceLongitude?: number;
  directionsMode?: 'driving' | 'walking' | 'transit' | 'bicycling';
}

class MapsService {
  /**
   * Get all installed maps apps available for the current location
   */
  async getAvailableMapsApps(
    location: MapLocation,
    filterApps?: string[]
  ): Promise<GetAppResult[]> {
    try {
      const options: any = {
        latitude: location.latitude,
        longitude: location.longitude,
        title: location.title,
      };

      if (location.address) {
        options.address = location.address;
      }

      if (filterApps && filterApps.length > 0) {
        options.appsWhiteList = filterApps;
      }

      const apps = await getApps(options);
      return apps;
    } catch (error) {
      console.error('[MapsService] Error getting available apps:', error);
      return [];
    }
  }

  /**
   * Open maps with built-in action sheet (simplest method)
   */
  async openMapsActionSheet(
    location: MapLocation,
    options?: NavigationOptions
  ): Promise<void> {
    try {
      const mapOptions: any = {
        latitude: location.latitude,
        longitude: location.longitude,
        title: location.title,
      };

      if (location.address) {
        mapOptions.address = location.address;
      }

      if (options?.sourceLatitude && options?.sourceLongitude) {
        mapOptions.sourceLatitude = options.sourceLatitude;
        mapOptions.sourceLongitude = options.sourceLongitude;
      }

      if (options?.directionsMode) {
        mapOptions.directionsMode = options.directionsMode;
      }

      // Try react-native-map-link first
      await showLocation(mapOptions);
    } catch (error) {
      console.error('[MapsService] Error opening maps:', error);
      // Fallback to default maps app
      this.openDefaultMapsApp(location);
    }
  }

  /**
   * Open specific maps app
   */
  async openSpecificMapsApp(
    appId: string,
    location: MapLocation
  ): Promise<void> {
    try {
      const apps = await this.getAvailableMapsApps(location);
      const selectedApp = apps.find((app) => app.id === appId);

      if (!selectedApp) {
        throw new Error(`Maps app ${appId} not available`);
      }

      selectedApp.open();
    } catch (error) {
      console.error(`[MapsService] Error opening ${appId}:`, error);
      Alert.alert(
        'Error',
        'No se pudo abrir la aplicación de mapas seleccionada'
      );
      // Fallback to web maps
      this.openWebMaps(location);
    }
  }

  /**
   * Open default maps app for the platform
   */
  async openDefaultMapsApp(location: MapLocation): Promise<void> {
    try {
      const { latitude, longitude } = location;

      if (Platform.OS === 'ios') {
        const url = `maps://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(location.title)}`;
        await Linking.openURL(url);
      } else {
        const url = `geo:${latitude},${longitude}?q=${encodeURIComponent(location.title)}`;
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('[MapsService] Error opening default maps app:', error);
      this.openWebMaps(location);
    }
  }

  /**
   * Fallback: Open web maps
   */
  async openWebMaps(location: MapLocation): Promise<void> {
    try {
      const { latitude, longitude } = location;
      const url = `https://maps.google.com/?q=${latitude},${longitude}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error('[MapsService] Error opening web maps:', error);
      Alert.alert(
        'Error',
        'No se pudo abrir ninguna aplicación de mapas. Por favor, intente más tarde.'
      );
    }
  }

  /**
   * Check if a specific maps app is installed
   */
  async isAppInstalled(appId: string): Promise<boolean> {
    try {
      const apps = await this.getAvailableMapsApps({
        latitude: 0,
        longitude: 0,
        title: 'test',
      });

      return apps.some((app) => app.id === appId);
    } catch (error) {
      console.error('[MapsService] Error checking app installation:', error);
      return false;
    }
  }
}

export const mapsService = new MapsService();
```

### Updated PharmacyDetailScreen

```typescript
// src/screens/app/PharmacyDetailScreen.tsx

import { mapsService } from '@services/MapsService';
import { useUserLocation } from '@hooks/useUserLocation';

const handleOpenMapsActionSheet = async () => {
  if (!pharmacy) return;

  try {
    await mapsService.openMapsActionSheet(
      {
        latitude: pharmacy.latitud,
        longitude: pharmacy.longitud,
        title: pharmacy.nombre,
        address: pharmacy.direccion,
      },
      {
        sourceLatitude: location?.latitude,
        sourceLongitude: location?.longitude,
        directionsMode: 'driving',
      }
    );
  } catch (error) {
    console.error('Error opening maps:', error);
  }
};

// In render:
<TouchableOpacity
  style={[styles.actionButton, styles.mapButton]}
  onPress={handleOpenMapsActionSheet}
>
  <MaterialCommunityIcons name="directions" size={24} color={COLORS.WHITE} />
  <Text style={styles.actionButtonText}>Ir al mapa</Text>
</TouchableOpacity>
```

---

## Error Handling & Best Practices

### 1. Graceful Degradation

Always provide fallback options:

```typescript
async function openMaps(location: MapLocation) {
  try {
    // Try 1: Preferred library (react-native-map-link)
    await mapsService.openMapsActionSheet(location);
  } catch (error1) {
    try {
      // Try 2: Default platform maps app
      await mapsService.openDefaultMapsApp(location);
    } catch (error2) {
      try {
        // Try 3: Web maps fallback
        await mapsService.openWebMaps(location);
      } catch (error3) {
        // Try 4: Show error dialog
        Alert.alert(
          'Error',
          'No se pudo abrir ninguna aplicación de mapas'
        );
      }
    }
  }
}
```

### 2. User Feedback

Provide clear feedback when opening maps:

```typescript
const handleOpenMaps = async () => {
  setIsOpeningMaps(true);
  try {
    await mapsService.openMapsActionSheet(location);
    // Optional: Toast notification
    Toast.show('Abriendo mapas...');
  } catch (error) {
    Toast.show('Error abriendo mapas');
  } finally {
    setIsOpeningMaps(false);
  }
};
```

### 3. Validation

Always validate location data:

```typescript
function isValidLocation(location: MapLocation): boolean {
  if (!location.latitude || !location.longitude) return false;
  if (location.latitude < -90 || location.latitude > 90) return false;
  if (location.longitude < -180 || location.longitude > 180) return false;
  if (!location.title || location.title.trim() === '') return false;
  return true;
}
```

### 4. URL Encoding

Properly encode special characters:

```typescript
// DO:
const url = `maps://maps.apple.com/?q=${encodeURIComponent(title)}`;

// DON'T:
const url = `maps://maps.apple.com/?q=${title}`; // Breaks with spaces/special chars
```

### 5. Platform-Specific Handling

Handle iOS and Android differences:

```typescript
if (Platform.OS === 'ios') {
  // Use Apple Maps first on iOS
  url = `maps://...`;
} else {
  // Use geo: intent on Android
  url = `geo:...`;
}
```

### 6. Testing Strategy

```typescript
// Test helper
async function testMapsIntegration() {
  const testLocation: MapLocation = {
    latitude: -36.6021,
    longitude: -71.9451,
    title: 'Farmacia Test',
    address: 'Test Address',
  };

  console.log('Available apps:', await mapsService.getAvailableMapsApps(testLocation));
  console.log('Is Google Maps installed?', await mapsService.isAppInstalled('google-maps'));

  // Don't actually open in tests
  // await mapsService.openMapsActionSheet(testLocation);
}
```

---

## Testing Checklist

### iOS Testing

- [ ] Build development version with `eas build --platform ios`
- [ ] Verify Info.plist includes `LSApplicationQueriesSchemes`
- [ ] Test on real device (simulator doesn't have maps apps)
- [ ] Test with Apple Maps installed (default)
- [ ] Test with Google Maps installed
- [ ] Test with Waze installed
- [ ] Test with multiple apps installed
- [ ] Test without any third-party maps apps
- [ ] Verify action sheet appears with correct apps
- [ ] Verify coordinates are passed correctly
- [ ] Test with and without source location
- [ ] Verify error handling when app closes unexpectedly
- [ ] Test Spanish text encoding in pharmacy names

### Android Testing

- [ ] Verify `<queries>` element in AndroidManifest.xml
- [ ] Test in Expo Go
- [ ] Test with development build
- [ ] Test with Google Maps installed
- [ ] Test with Waze installed
- [ ] Test without any third-party maps apps
- [ ] Verify geo: intent works
- [ ] Test SMS/deep link intent encoding
- [ ] Verify coordinates passed correctly
- [ ] Test address-based navigation
- [ ] Test error handling

### Cross-Platform

- [ ] Verify fallback chain works
- [ ] Test with invalid coordinates
- [ ] Test with special characters in pharmacy name
- [ ] Test with very long addresses
- [ ] Test offline (should gracefully handle)
- [ ] Test with location permission denied
- [ ] Verify no crashes on app close
- [ ] Test performance (multiple opens)

---

## Migration Path

### Phase 1: Basic Implementation (Recommended First)

1. Install `react-native-map-link`
2. Update `app.json` with Info.plist configuration
3. Create `MapsService`
4. Update `PharmacyDetailScreen` to use action sheet
5. Test on iOS and Android

### Phase 2: Enhanced UX

1. Implement custom maps selector modal
2. Add app filtering options
3. Show app icons in selection UI
4. Add analytics tracking for which apps users choose
5. Remember user's preference

### Phase 3: Advanced Features

1. Deep linking to specific maps features
2. Direction mode selection (driving, walking, transit)
3. Time-based ETA calculation
4. Integration with saved locations
5. Support for multiple pharmacy chains with different requirements

---

## Resources & References

- [Expo Linking Documentation](https://docs.expo.dev/versions/latest/sdk/linking/)
- [React Native Linking API](https://reactnative.dev/docs/linking)
- [react-native-map-link GitHub](https://github.com/tschoffelen/react-native-map-link)
- [Apple Maps URL Scheme](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html)
- [Google Maps iOS URL Scheme](https://developers.google.com/maps/documentation/urls/ios-urlscheme)
- [Google Maps Android Intents](https://developers.google.com/maps/documentation/urls/android-intents)
- [Waze Deep Links](https://developers.google.com/waze/deeplinks)
- [Expo Development Builds](https://docs.expo.dev/development/setup/)
- [Android Package Visibility](https://developer.android.com/training/basics/intents/package-visibility)

---

## Summary

For the AI Farma pharmacy locator app, the recommended approach is:

1. **Use `react-native-map-link`** - It handles all the complexity and provides:
   - Automatic detection of installed maps apps
   - Built-in action sheet UI (consistent with iOS/Android patterns)
   - Support for 20+ maps applications
   - Proper URL encoding and parameter handling
   - Fallback mechanisms

2. **Configure Info.plist** - Add `LSApplicationQueriesSchemes` in app.json for iOS

3. **Update AndroidManifest** - Add `<queries>` element for Android 11+

4. **Implement MapsService** - Create a service layer for:
   - Consistent maps opening logic
   - Error handling and fallbacks
   - Analytics (optional)
   - Testing

5. **Test thoroughly** - Both on iOS and Android with various maps apps installed

This approach will provide users with the ability to navigate to pharmacies using their preferred maps application, significantly improving the user experience.
