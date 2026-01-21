# Change: Implement MVP Foundation for AI Farma App

## Why
The AI Farma app requires foundational infrastructure and MVP features to provide immediate value to Chilean users seeking emergency pharmacy access. Phase 1 focuses on core functionality: pharmacy locator, basic medication tracking, and authentication. This enables real-world use within 2-3 months.

## What Changes
- Implement foundational project structure (folder architecture, build configuration)
- Build core authentication system (anonymous + email/Google login)
- Implement pharmacy locator with geolocation and real-time status filtering
- Create basic medication schedule management with local reminders
- Establish offline support for critical features
- Set up CI/CD pipeline, error monitoring, and analytics

### Non-Breaking
- All changes are initial implementations
- No existing code affected (greenfield project)

## Impact
- **Affected specs**: All five core capabilities (pharmacy-locator, ai-medication-advisor*, core-navigation, medication-schedule, offline-support)
- **Affected code**: New files across entire codebase
- **Dependencies**: React Native, Firebase, Google Maps, MINSAL APIs
- **Timeline**: 8-12 weeks for MVP completion
- *Note: AI Medication Advisor intentionally limited to scaffold in Phase 1, full implementation in Phase 2

## Scope Definition

### Phase 1 MVP Includes (This Change)
1. **Pharmacy Locator** - Full implementation
   - Real-time geolocation with permission handling
   - Pharmacy data management (cache from MINSAL)
   - On-duty filtering
   - Distance calculation and sorting
   - Map view with markers
   - Search by name/address
   - Favorites management
   - Navigation integration (Google Maps/Waze)

2. **Core Navigation & Auth** - Full implementation
   - Bottom tab navigation (5 screens)
   - Anonymous access on first load
   - Email signup/login with Firebase Auth
   - Google/Apple OAuth
   - User profile creation
   - Settings management
   - Permission handling
   - Onboarding flow

3. **Medication Schedule** - Limited MVP
   - Manual medication entry
   - Local reminder scheduling
   - Simple adherence tracking (mark as taken)
   - Basic calendar view
   - Medication list display

4. **Offline Support** - Limited MVP
   - AsyncStorage caching for pharmacies and medications
   - Offline pharmacy list access
   - Offline medication viewing and adherence recording
   - Basic sync queueing for when online

5. **AI Medication Advisor** - Scaffold only (Phase 2)
   - Chat UI placeholder
   - Basic error handling for future API integration

### Phase 2+ Deferred
- Advanced AI features (interaction detection, OCR, prescription analysis)
- Prescription image upload and processing
- Detailed adherence analytics
- Family/caregiver sharing
- Advanced offline features (map tiles, full database sync)
- Performance optimizations beyond MVP

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| MINSAL API rate limits (100 req/min) | Pharmacy data fetching slow | Implement aggressive local caching, batch updates at 2 AM |
| GPS accuracy issues in dense urban areas | Users confused by distances | Display accuracy margin, allow address search as fallback |
| Notification delivery unreliability | Users miss medication reminders | Use multiple notification channels, implement badge counts |
| Firebase quota overages | Unexpected costs | Set up billing alerts, implement request throttling |
| React Native ecosystem fragility | Build breaks on dependency updates | Pin minor versions, run integration tests before updates |

## Success Criteria
- [ ] App launches and authenticates user (anonymous or email)
- [ ] Find pharmacies within 5 seconds by location
- [ ] Show on-duty status with <1 min cache age
- [ ] Create medication reminder that fires at scheduled time
- [ ] Mark medication as taken and persist offline
- [ ] All critical flows testable offline
- [ ] No crashes in first week of testing
- [ ] App bundle <50MB, installed <150MB

## Open Questions
- Should bioequivalent database be pre-bundled or fetched? (Deferred to Phase 2)
- Rate limiting strategy for free tier Google Maps? (Answer: Use distance filter to reduce requests)
- Which regional on-duty data formats are supported? (Answer: Start with MINSAL format, extend in Phase 2)

