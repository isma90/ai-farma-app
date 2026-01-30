# Maps Apps Detection Research - Complete Index

Comprehensive research on detecting and opening multiple maps applications (Apple Maps, Google Maps, Waze) from React Native/Expo for the AI Farma pharmacy locator app.

## Document Organization

This research is organized into 5 comprehensive documents:

### 1. MAPS_APPS_DETECTION_GUIDE.md (28 KB)
**Complete Technical Reference**

The most comprehensive guide covering:
- Current implementation analysis
- All URL schemes and deep links (Apple Maps, Google Maps, Waze, Uber, Lyft, etc.)
- Detection methods (canOpenURL vs react-native-map-link)
- iOS configuration details with Info.plist setup
- Android configuration details with AndroidManifest.xml
- Complete MapsService implementation example
- Error handling best practices
- Testing checklist

**Best for:** Understanding the full technical landscape, implementation decisions

**Read time:** 20-30 minutes

---

### 2. MAPS_APPS_CODE_EXAMPLES.md (25 KB)
**Practical Implementation Code**

Ready-to-use code examples:
- Quick start (30 minutes to working solution)
- Step-by-step installation and configuration
- Complete MapsService class
- Example 1: Simple action sheet implementation
- Example 2: Custom maps selector modal with icons
- Example 3: Error handling with fallback chain
- Example 4: Pharmacy card integration
- Configuration file templates (app.json)
- Unit test examples
- Common issues and solutions
- Deployment checklist

**Best for:** Copy-paste code, implementation, testing

**Read time:** 15-20 minutes

---

### 3. MAPS_APPS_QUICK_REFERENCE.md (8.6 KB)
**Cheat Sheet & Quick Lookup**

Quick reference organized by:
- Installation command
- Configuration snippets (iOS & Android)
- URL scheme table
- Basic service code
- Common parameters
- Platform detection
- App IDs for filtering
- Debugging commands
- Full working example

**Best for:** Quick lookups while coding, refresher on specifics

**Read time:** 5-10 minutes

---

### 4. MAPS_APPS_DECISION_SUMMARY.md (11 KB)
**Implementation Decision & Recommendation**

Strategic overview including:
- Research findings summary
- Solution comparison (3 options: Native API, Library, Custom Native)
- Recommended approach: react-native-map-link
- Implementation roadmap (3 phases)
- Required configuration
- Testing strategy
- Success criteria
- Risk analysis and mitigations
- Dependencies and compatibility
- Migration plan from current code
- Rollback plan

**Best for:** Decision-making, stakeholder communication, project planning

**Read time:** 10-15 minutes

---

### 5. MAPS_APPS_RESEARCH_INDEX.md (This file)
**Navigation and Overview**

Quick navigation guide to all research documents.

---

## Quick Start Path

**If you want to implement this immediately:**

1. Read: [MAPS_APPS_DECISION_SUMMARY.md](MAPS_APPS_DECISION_SUMMARY.md) (10 min)
2. Follow: [MAPS_APPS_CODE_EXAMPLES.md](MAPS_APPS_CODE_EXAMPLES.md) - Quick Start section (30 min)
3. Reference: [MAPS_APPS_QUICK_REFERENCE.md](MAPS_APPS_QUICK_REFERENCE.md) while coding

**Total time to working implementation: ~1-2 hours**

---

## By Role

### Product Manager
1. [MAPS_APPS_DECISION_SUMMARY.md](MAPS_APPS_DECISION_SUMMARY.md) - Understand recommendation
2. Success criteria section - Define launch metrics
3. Rollback plan section - Risk management

### Developer (Implementation)
1. [MAPS_APPS_QUICK_REFERENCE.md](MAPS_APPS_QUICK_REFERENCE.md) - Understand what you're building
2. [MAPS_APPS_CODE_EXAMPLES.md](MAPS_APPS_CODE_EXAMPLES.md) - Implementation steps
3. [MAPS_APPS_DETECTION_GUIDE.md](MAPS_APPS_DETECTION_GUIDE.md) - Deep technical reference

### QA/Tester
1. [MAPS_APPS_CODE_EXAMPLES.md](MAPS_APPS_CODE_EXAMPLES.md) - Common issues section
2. [MAPS_APPS_DETECTION_GUIDE.md](MAPS_APPS_DETECTION_GUIDE.md) - Testing checklist
3. [MAPS_APPS_QUICK_REFERENCE.md](MAPS_APPS_QUICK_REFERENCE.md) - Debugging section

### Architect
1. [MAPS_APPS_DECISION_SUMMARY.md](MAPS_APPS_DECISION_SUMMARY.md) - Solution comparison
2. [MAPS_APPS_DETECTION_GUIDE.md](MAPS_APPS_DETECTION_GUIDE.md) - All technical details
3. [MAPS_APPS_CODE_EXAMPLES.md](MAPS_APPS_CODE_EXAMPLES.md) - Example service architecture

---

## Key Findings Summary

### 1. How to Detect Installed Maps Apps

**Two Approaches:**

**A. Using React Native Linking.canOpenURL (Native)**
- Lightweight, no dependencies
- Requires Info.plist configuration on iOS
- Requires AndroidManifest.xml config on Android 11+
- Manual implementation needed

**B. Using react-native-map-link Library (RECOMMENDED)**
- Automatic detection via `getApps()`
- Built-in UI (action sheet)
- Supports 20+ maps apps
- Automatic URL encoding
- Cross-platform consistency
- More maintainable code

### 2. Deep Links for Each Maps App

| App | Display Location | Navigation |
|-----|-----------------|------------|
| **Apple Maps** | `maps://maps.apple.com/?ll=lat,lng` | `maps://maps.apple.com/?saddr=a&daddr=b` |
| **Google Maps** | `comgooglemaps://?center=lat,lng` | `comgooglemaps://?saddr=a&daddr=b` |
| **Waze** | `https://waze.com/ul?ll=lat,lng` | `https://waze.com/ul?ll=lat,lng&navigate=yes` |
| **Fallback** | `geo:lat,lng` | `https://maps.google.com/?q=lat,lng` |

### 3. Standard Menu for Available Options

**Built-in Solution:**
```typescript
import { showLocation } from 'react-native-map-link';

await showLocation({
  latitude, longitude, title,
  sourceLatitude, sourceLongitude // for directions
});
```

This automatically shows an action sheet (iOS) or alert (Android) with available apps.

**Custom Solution:**
```typescript
import { getApps } from 'react-native-map-link';

const apps = await getApps({ latitude, longitude, title });
// Display custom modal with apps from this array
apps.forEach(app => {
  // app.name, app.icon, app.open()
});
```

### 4. Handling When Apps Are Not Installed

**Fallback Chain:**
```
Try 1: react-native-map-link →
Try 2: Default platform maps →
Try 3: Web Google Maps →
Try 4: Show error dialog
```

Always provide a web fallback so users can navigate even if no native apps installed.

### 5. Existing Libraries & Resources

**Recommended:** `react-native-map-link`
- GitHub: https://github.com/tschoffelen/react-native-map-link
- NPM: https://www.npmjs.com/package/react-native-map-link
- Active maintenance
- ~4k weekly downloads
- Proven in production apps

**Alternatives:**
- `react-native-launch-navigator` - More complex, less maintained
- `react-native-open-maps` - Simpler, fewer features
- Native React Linking - Lightweight but requires more code

---

## iOS Specific Details

### Info.plist Configuration (Required)

Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "LSApplicationQueriesSchemes": [
          "maps",           // Apple Maps
          "comgooglemaps",  // Google Maps
          "waze",           // Waze
          "citymapper",     // Citymapper
          "uber",           // Uber
          "lyft"            // Lyft
        ]
      }
    }
  }
}
```

**Critical:**
- Do NOT include `://` in scheme names
- Each scheme must be individually listed
- Changes require `eas build --platform ios`
- Cannot test in Expo Go, need development build

### Testing on iOS

- Requires real device or simulator with development build
- `eas build --platform ios --profile preview`
- Multiple maps apps needed to test full functionality
- Verify Info.plist properly configured

---

## Android Specific Details

### AndroidManifest.xml Configuration

Add to `app.json`:
```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {"scheme": "geo"},
            {"scheme": "https", "host": "maps.google.com"},
            {"scheme": "https", "host": "waze.com"}
          ]
        }
      ]
    }
  }
}
```

**Required for:** Android 11+ (SDK 30+) due to package visibility requirements

### Testing on Android

- Works in Expo Go (no build needed)
- Test with: `npx expo start`
- Multiple apps can be tested easily
- Geo URI is universal fallback

---

## Current App Integration Points

### Files to Modify

**Primary:**
- `src/services/MapsService.ts` (create new)
- `src/screens/app/PharmacyDetailScreen.tsx` (update `handleOpenMap`)

**Secondary (Optional):**
- `src/components/PharmacyCard.tsx` (add navigation button)
- `src/components/pharmacy/PharmacyMapView.tsx` (add map controls)
- `app.json` (configuration)

### Current Implementation Issues

Located in `PharmacyDetailScreen.tsx` lines 93-104:

```typescript
// CURRENT: Simple, only default maps app
const handleOpenMap = () => {
  const url =
    Platform.OS === 'ios'
      ? `maps://maps.apple.com/?q=${pharmacy.nombre}&address=${pharmacy.direccion}`
      : `geo:${pharmacy.latitud},${pharmacy.longitud}?q=${pharmacy.nombre}`;
  Linking.openURL(url).catch(() => {
    console.error('Failed to open maps');
  });
};
```

**Problems:**
- No user choice of maps app
- Fragile error handling
- No validation
- Limited functionality

**Replacement:**
```typescript
// IMPROVED: Multiple options, robust error handling
const handleOpenMap = async () => {
  try {
    await mapsService.openMapsActionSheet({
      latitude: pharmacy.latitud,
      longitude: pharmacy.longitud,
      title: pharmacy.nombre,
      address: pharmacy.direccion,
    });
  } catch (error) {
    Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
  }
};
```

---

## Implementation Phases

### Phase 1: Basic (1 week)
- Install react-native-map-link
- Update app.json
- Create MapsService
- Update PharmacyDetailScreen
- Test on iOS and Android

### Phase 2: Enhanced (1 week, optional)
- Custom maps selector modal
- App icons display
- User preference tracking
- Analytics

### Phase 3: Advanced (2+ weeks, optional)
- Direction mode selection
- ETA integration
- Saved locations
- Advanced features

---

## Validation & Testing

### Must-Test Scenarios

**iOS:**
- [ ] Apple Maps only
- [ ] Google Maps only
- [ ] Waze only
- [ ] Multiple apps
- [ ] No maps apps installed
- [ ] Spanish pharmacy names
- [ ] Special characters in address
- [ ] Invalid coordinates

**Android:**
- [ ] Google Maps installed
- [ ] Waze installed
- [ ] Geo URI fallback
- [ ] Web maps fallback
- [ ] No maps apps

### Success Metrics

- Users can select between available maps apps
- App handles missing maps gracefully
- Works on iOS 13.4+, Android 9+
- Spanish text displays correctly
- No crashes or hangs
- Response time < 1 second

---

## Resources & Links

### Official Documentation
- [Expo Linking](https://docs.expo.dev/versions/latest/sdk/linking/)
- [React Native Linking](https://reactnative.dev/docs/linking)
- [Apple Maps URL Scheme](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html)
- [Google Maps iOS URL Scheme](https://developers.google.com/maps/documentation/urls/ios-urlscheme)
- [Google Maps Android Intents](https://developers.google.com/maps/documentation/urls/android-intents)
- [Waze Deep Links](https://developers.google.com/waze/deeplinks)

### Key Library
- [react-native-map-link GitHub](https://github.com/tschoffelen/react-native-map-link)
- [react-native-map-link npm](https://www.npmjs.com/package/react-native-map-link)

### Security & Privacy
- [iOS 9 LSApplicationQueriesSchemes](https://useyourloaf.com/blog/querying-url-schemes-with-canopenurl/)
- [Android 11 Package Visibility](https://developer.android.com/training/basics/intents/package-visibility)

---

## Navigation Quick Links

📄 **[MAPS_APPS_DETECTION_GUIDE.md](MAPS_APPS_DETECTION_GUIDE.md)**
   → Complete technical reference with all details

📄 **[MAPS_APPS_CODE_EXAMPLES.md](MAPS_APPS_CODE_EXAMPLES.md)**
   → Implementation code ready to use

📄 **[MAPS_APPS_QUICK_REFERENCE.md](MAPS_APPS_QUICK_REFERENCE.md)**
   → Quick lookup while coding

📄 **[MAPS_APPS_DECISION_SUMMARY.md](MAPS_APPS_DECISION_SUMMARY.md)**
   → Why this solution, roadmap, risks

---

## Recommendation

**Use `react-native-map-link` with custom MapsService wrapper**

- Minimal implementation effort (2-3 hours)
- Significantly improves user experience
- Provides multiple maps app choices
- Robust error handling
- Cross-platform consistency
- Easy to maintain and extend

---

## Document Statistics

| Document | Size | Read Time | Type |
|----------|------|-----------|------|
| MAPS_APPS_DETECTION_GUIDE.md | 28 KB | 20-30 min | Technical |
| MAPS_APPS_CODE_EXAMPLES.md | 25 KB | 15-20 min | Implementation |
| MAPS_APPS_QUICK_REFERENCE.md | 8.6 KB | 5-10 min | Reference |
| MAPS_APPS_DECISION_SUMMARY.md | 11 KB | 10-15 min | Strategy |
| **Total** | **~72 KB** | **1-1.5 hours** | **Complete** |

---

## Questions & Answers

**Q: Do we need to modify native code?**
A: No. react-native-map-link handles everything. Only app.json configuration needed.

**Q: Will this work in Expo Go?**
A: Android yes, iOS no (needs development build due to Info.plist requirements).

**Q: What if user has no maps apps installed?**
A: Fallback to Google Maps web URL, user can navigate in browser.

**Q: How long to implement?**
A: Phase 1 (basic): 2-3 hours. Phase 2 (enhanced): 4-6 hours additional.

**Q: Will this increase app size?**
A: Minimal. react-native-map-link is ~50KB minified.

**Q: Is the library actively maintained?**
A: Yes. Last update January 2025. ~4k weekly downloads.

**Q: Can we roll back if needed?**
A: Yes. Rollback takes <15 minutes (remove dependency, revert files).

---

## Next Steps

1. **Review** [MAPS_APPS_DECISION_SUMMARY.md](MAPS_APPS_DECISION_SUMMARY.md) for approval
2. **Follow** [MAPS_APPS_CODE_EXAMPLES.md](MAPS_APPS_CODE_EXAMPLES.md) quick start
3. **Test** on iOS and Android devices
4. **Deploy** to production
5. **Monitor** user engagement and analytics

---

*Research completed: January 28, 2026*
*Last updated: January 28, 2026*
*Status: Complete and ready for implementation*
