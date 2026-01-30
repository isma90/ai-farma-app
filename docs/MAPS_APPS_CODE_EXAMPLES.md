# Maps Apps Integration - Practical Code Examples

This document provides copy-paste ready code examples for integrating multiple maps applications detection and opening in the AI Farma app.

## Quick Start (30 minutes)

### Step 1: Install Dependencies

```bash
npm install react-native-map-link
# or
yarn add react-native-map-link
```

### Step 2: Update app.json

```json
{
  "expo": {
    "ios": {
      "deploymentTarget": "13.4",
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
    },
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

### Step 3: Create MapsService

Create `/src/services/MapsService.ts`:

```typescript
import { Linking, Platform, Alert } from 'react-native';
import { getApps, showLocation, GetAppResult } from 'react-native-map-link';

export interface MapLocation {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
}

export interface NavigationOptions {
  sourceLatitude?: number;
  sourceLongitude?: number;
  directionsMode?: 'driving' | 'walking' | 'transit' | 'bicycling';
  alwaysIncludeGoogle?: boolean;
}

class MapsService {
  /**
   * Get all installed maps apps
   * @returns Array of available maps apps
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

      if (filterApps?.length) {
        options.appsWhiteList = filterApps;
      }

      const apps = await getApps(options);
      console.log('[MapsService] Available apps:', apps.map(a => a.name));
      return apps;
    } catch (error) {
      console.error('[MapsService] Error getting available apps:', error);
      return [];
    }
  }

  /**
   * Open maps with action sheet (simplest method)
   * Shows user options to choose which maps app to use
   */
  async openMapsActionSheet(
    location: MapLocation,
    options?: NavigationOptions
  ): Promise<void> {
    try {
      if (!this.isValidLocation(location)) {
        throw new Error('Invalid location coordinates');
      }

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
        mapOptions.directionsMode = options.directionsMode || 'driving';
      }

      if (options?.alwaysIncludeGoogle) {
        mapOptions.alwaysIncludeGoogle = true;
      }

      await showLocation(mapOptions);
    } catch (error) {
      console.error('[MapsService] Error opening maps action sheet:', error);
      throw error;
    }
  }

  /**
   * Open a specific maps app
   * @param appId - App ID like 'google-maps', 'apple-maps', 'waze'
   */
  async openSpecificMapsApp(
    appId: string,
    location: MapLocation,
    options?: NavigationOptions
  ): Promise<void> {
    try {
      const apps = await this.getAvailableMapsApps(location);
      const selectedApp = apps.find(app => app.id === appId);

      if (!selectedApp) {
        throw new Error(`${appId} not installed`);
      }

      selectedApp.open?.();
    } catch (error) {
      console.error(`[MapsService] Error opening ${appId}:`, error);
      throw error;
    }
  }

  /**
   * Fallback: Open default maps app
   */
  async openDefaultMapsApp(location: MapLocation): Promise<void> {
    try {
      if (!this.isValidLocation(location)) {
        throw new Error('Invalid location');
      }

      const { latitude, longitude } = location;
      const title = encodeURIComponent(location.title);

      if (Platform.OS === 'ios') {
        const url = `maps://maps.apple.com/?ll=${latitude},${longitude}&q=${title}`;
        await Linking.openURL(url);
      } else {
        const url = `geo:${latitude},${longitude}?q=${title}`;
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('[MapsService] Error opening default maps:', error);
      throw error;
    }
  }

  /**
   * Final fallback: Open Google Maps in browser
   */
  async openWebMaps(location: MapLocation): Promise<void> {
    try {
      const { latitude, longitude } = location;
      const url = `https://maps.google.com/?q=${latitude},${longitude}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error('[MapsService] Error opening web maps:', error);
      throw error;
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
      return apps.some(app => app.id === appId);
    } catch (error) {
      console.error('[MapsService] Error checking app:', error);
      return false;
    }
  }

  /**
   * Validate location coordinates
   */
  private isValidLocation(location: MapLocation): boolean {
    if (location.latitude < -90 || location.latitude > 90) return false;
    if (location.longitude < -180 || location.longitude > 180) return false;
    if (!location.title?.trim()) return false;
    return true;
  }
}

export const mapsService = new MapsService();
```

### Step 4: Update PharmacyDetailScreen

Replace the `handleOpenMap` function in `/src/screens/app/PharmacyDetailScreen.tsx`:

```typescript
import { mapsService } from '@services/MapsService';
import { useUserLocation } from '@hooks/useUserLocation';

// In component:
const { location: userLocation } = useUserLocation();

const handleOpenMap = async () => {
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
        sourceLatitude: userLocation?.latitude,
        sourceLongitude: userLocation?.longitude,
        directionsMode: 'driving',
        alwaysIncludeGoogle: true,
      }
    );
  } catch (error) {
    console.error('Error opening maps:', error);
    Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
  }
};
```

---

## Complete Working Examples

### Example 1: Simple Action Sheet

**File:** `src/screens/app/PharmacyDetailScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mapsService } from '@services/MapsService';
import { IPharmacy } from '@types/index';
import { COLORS } from '@constants/app';

export const PharmacyDetailScreen = ({ route, navigation }) => {
  const { pharmacyId } = route.params;
  const [pharmacy, setPharmacy] = useState<IPharmacy | null>(null);
  const [isOpeningMaps, setIsOpeningMaps] = useState(false);

  const handleOpenMap = async () => {
    if (!pharmacy) return;

    setIsOpeningMaps(true);
    try {
      await mapsService.openMapsActionSheet({
        latitude: pharmacy.latitud,
        longitude: pharmacy.longitud,
        title: pharmacy.nombre,
        address: pharmacy.direccion,
      });
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert(
        'Error',
        'No se pudo abrir la aplicación de mapas. Por favor intente más tarde.'
      );
    } finally {
      setIsOpeningMaps(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* ... other content ... */}

      <TouchableOpacity
        style={[styles.actionButton, styles.mapButton]}
        onPress={handleOpenMap}
        disabled={isOpeningMaps}
      >
        <MaterialCommunityIcons
          name="directions"
          size={24}
          color={COLORS.WHITE}
        />
        <Text style={styles.actionButtonText}>
          {isOpeningMaps ? 'Abriendo...' : 'Ir al mapa'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  mapButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
```

---

### Example 2: Custom Maps Selector Modal

**File:** `src/components/MapsSelector.tsx`

```typescript
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GetAppResult } from 'react-native-map-link';
import { COLORS } from '@constants/app';

interface MapsSelectorProps {
  visible: boolean;
  apps: GetAppResult[];
  isLoading?: boolean;
  onSelectApp: (app: GetAppResult) => void;
  onClose: () => void;
}

export const MapsSelector: React.FC<MapsSelectorProps> = ({
  visible,
  apps,
  isLoading,
  onSelectApp,
  onClose,
}) => {
  const renderAppItem = ({ item }: { item: GetAppResult }) => (
    <TouchableOpacity
      style={styles.appButton}
      onPress={() => {
        onSelectApp(item);
        onClose();
      }}
    >
      {item.icon ? (
        <Image source={item.icon} style={styles.appIcon} />
      ) : (
        <View style={styles.appIconPlaceholder}>
          <MaterialCommunityIcons name="map" size={24} color={COLORS.PRIMARY} />
        </View>
      )}
      <Text style={styles.appName}>{item.name}</Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={COLORS.LIGHT_GRAY}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Abrir en mapa</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.DARK_GRAY}
              />
            </TouchableOpacity>
          </View>

          {/* Apps List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={COLORS.PRIMARY}
              />
              <Text style={styles.loadingText}>
                Buscando aplicaciones...
              </Text>
            </View>
          ) : apps.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="map-search"
                size={48}
                color={COLORS.LIGHT_GRAY}
              />
              <Text style={styles.emptyTitle}>
                Sin aplicaciones de mapas
              </Text>
              <Text style={styles.emptyText}>
                Instala Google Maps, Apple Maps o Waze
              </Text>
            </View>
          ) : (
            <FlatList
              data={apps}
              renderItem={renderAppItem}
              keyExtractor={item => item.id}
              scrollEnabled={apps.length > 3}
              style={styles.appsList}
            />
          )}

          {/* Cancel Button */}
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
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_GRAY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.DARK_GRAY,
  },
  closeButton: {
    padding: 8,
  },
  appsList: {
    flexGrow: 0,
  },
  appButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  appIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.DARK_GRAY,
  },
  chevron: {
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.MEDIUM_GRAY,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.DARK_GRAY,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.LIGHT_GRAY,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 12,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.DARK_GRAY,
  },
});
```

**Usage in PharmacyDetailScreen:**

```typescript
const [showMapsSelector, setShowMapsSelector] = useState(false);
const [availableMapsApps, setAvailableMapsApps] = useState<GetAppResult[]>([]);
const [isLoadingApps, setIsLoadingApps] = useState(false);

const handleOpenMap = async () => {
  if (!pharmacy) return;

  setIsLoadingApps(true);
  try {
    const apps = await mapsService.getAvailableMapsApps({
      latitude: pharmacy.latitud,
      longitude: pharmacy.longitud,
      title: pharmacy.nombre,
      address: pharmacy.direccion,
    });

    if (apps.length === 0) {
      Alert.alert(
        'Sin aplicaciones',
        'Por favor instala Google Maps, Apple Maps o Waze'
      );
      return;
    }

    if (apps.length === 1) {
      // Only one app, open it directly
      apps[0].open?.();
      return;
    }

    // Multiple apps, show selector
    setAvailableMapsApps(apps);
    setShowMapsSelector(true);
  } catch (error) {
    Alert.alert('Error', 'No se pudo obtener las aplicaciones de mapas');
  } finally {
    setIsLoadingApps(false);
  }
};

// In render:
<MapsSelector
  visible={showMapsSelector}
  apps={availableMapsApps}
  isLoading={isLoadingApps}
  onSelectApp={(app) => app.open?.()}
  onClose={() => setShowMapsSelector(false)}
/>
```

---

### Example 3: Error Handling with Fallback Chain

**File:** `src/services/MapsService.ts` (Enhanced)

```typescript
async function openMapsWithFallback(
  location: MapLocation,
  options?: NavigationOptions
): Promise<void> {
  const fallbacks = [
    // Level 1: Try react-native-map-link with options
    async () => {
      console.log('[MapsService] Trying react-native-map-link...');
      await mapsService.openMapsActionSheet(location, options);
    },

    // Level 2: Try default maps app
    async () => {
      console.log('[MapsService] Falling back to default maps app...');
      await mapsService.openDefaultMapsApp(location);
    },

    // Level 3: Try web maps
    async () => {
      console.log('[MapsService] Falling back to web maps...');
      await mapsService.openWebMaps(location);
    },

    // Level 4: Show error
    async () => {
      throw new Error(
        'All maps options failed. Please try again or install a maps app.'
      );
    },
  ];

  let lastError: Error | null = null;

  for (const fallback of fallbacks) {
    try {
      await fallback();
      console.log('[MapsService] Successfully opened maps');
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[MapsService] Fallback failed: ${lastError.message}`);
      continue;
    }
  }

  // All fallbacks failed
  if (lastError) {
    throw lastError;
  }
}
```

---

### Example 4: Using with Pharmacy List

**File:** `src/components/PharmacyCard.tsx`

```typescript
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mapsService } from '@services/MapsService';
import { IPharmacy } from '@types/index';

interface PharmacyCardProps {
  pharmacy: IPharmacy;
  onNavigate?: () => void;
}

export const PharmacyCard: React.FC<PharmacyCardProps> = ({
  pharmacy,
  onNavigate,
}) => {
  const handleNavigate = async () => {
    try {
      await mapsService.openMapsActionSheet({
        latitude: pharmacy.latitud,
        longitude: pharmacy.longitud,
        title: pharmacy.nombre,
        address: pharmacy.direccion,
      });
      onNavigate?.();
    } catch (error) {
      console.error('Error opening maps:', error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{pharmacy.nombre}</Text>
        {pharmacy.isOnDutyToday && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>De turno</Text>
          </View>
        )}
      </View>

      <Text style={styles.address}>{pharmacy.direccion}</Text>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={handleNavigate}
        >
          <MaterialCommunityIcons
            name="directions"
            size={18}
            color="#fff"
          />
          <Text style={styles.buttonText}>Navegar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.callButton}>
          <MaterialCommunityIcons
            name="phone"
            size={18}
            color="#fff"
          />
          <Text style={styles.buttonText}>Llamar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

---

## Configuration Files Reference

### app.json (Complete)

```json
{
  "expo": {
    "name": "AI Farma",
    "slug": "ai-farma-app",
    "version": "1.0.0",
    "entryPoint": "index.js",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.aifarma.app",
      "newArchEnabled": false,
      "deploymentTarget": "13.4",
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
        ],
        "NSLocationWhenInUseUsageDescription": "We need your location to find nearby pharmacies",
        "NSLocalNetworkUsageDescription": "We need access to your local network for optimal performance"
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.aifarma.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
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
      ],
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": []
  }
}
```

---

## Testing Examples

### Unit Tests

**File:** `src/services/__tests__/MapsService.test.ts`

```typescript
import { mapsService } from '../MapsService';

describe('MapsService', () => {
  const testLocation = {
    latitude: -36.6021,
    longitude: -71.9451,
    title: 'Farmacia Test',
    address: 'Test Address',
  };

  describe('Location Validation', () => {
    it('should validate correct coordinates', () => {
      expect(() => {
        mapsService['isValidLocation'](testLocation);
      }).not.toThrow();
    });

    it('should reject invalid latitude', () => {
      const invalid = { ...testLocation, latitude: 91 };
      // This would fail validation
      expect(mapsService['isValidLocation'](invalid)).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const invalid = { ...testLocation, longitude: 181 };
      expect(mapsService['isValidLocation'](invalid)).toBe(false);
    });

    it('should reject missing title', () => {
      const invalid = { ...testLocation, title: '' };
      expect(mapsService['isValidLocation'](invalid)).toBe(false);
    });
  });

  describe('App Detection', () => {
    it('should return array of installed apps', async () => {
      const apps = await mapsService.getAvailableMapsApps(testLocation);
      expect(Array.isArray(apps)).toBe(true);
    });
  });

  // More tests...
});
```

---

## Common Issues & Solutions

### Issue: `canOpenURL` always returns false on iOS

**Solution:**
- Add scheme to `LSApplicationQueriesSchemes` in Info.plist
- Don't include `://` in the scheme name (use `waze`, not `waze://`)
- Rebuild with `eas build --platform ios`
- Test on real device (simulator may not have all apps)

### Issue: Waze URLs don't work on Android

**Solution:**
```typescript
// Use web URL as fallback
const url = Platform.OS === 'android'
  ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
  : `waze://ul?ll=${lat},${lng}&navigate=yes`;
```

### Issue: Special characters break the URL

**Solution:**
```typescript
// Always URL-encode parameters
const title = encodeURIComponent(pharmacy.nombre);
const address = encodeURIComponent(pharmacy.direccion);
```

### Issue: App closes when opening maps on iOS

**Solution:**
- This is normal - the app backgrounding
- Use error boundary if needed
- Test that app returns to normal state after user navigates

---

## Deployment Checklist

- [ ] Install `react-native-map-link`
- [ ] Update `app.json` with iOS Info.plist
- [ ] Update `app.json` with Android queries
- [ ] Create `MapsService` with proper error handling
- [ ] Test on iOS with development build
- [ ] Test on Android with Expo Go
- [ ] Test with multiple maps apps installed
- [ ] Test without any maps apps
- [ ] Add Spanish translations for all UI text
- [ ] Verify encoding for addresses with special characters
- [ ] Test on real devices (iOS especially)
- [ ] Verify fallback chain works
- [ ] Add error handling in screens
- [ ] Test with location permission denied
- [ ] Update documentation
- [ ] Create PR and get code review

---

## Next Steps

1. **Immediate (Phase 1):**
   - Follow the Quick Start section
   - Implement MapsService
   - Update PharmacyDetailScreen

2. **Short-term (Phase 2):**
   - Implement custom MapsSelector modal
   - Add analytics tracking
   - Optimize performance

3. **Long-term (Phase 3):**
   - Add user preference storage
   - Implement direction mode selection
   - Add more maps app support
