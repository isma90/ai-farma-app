# Design: MVP Foundation Architecture

## Context
The AI Farma app must serve Chilean users in both urban and rural areas with potentially unreliable connectivity. The architecture prioritizes local-first data, efficient caching, and graceful degradation. React Native enables single codebase for iOS/Android, Firebase provides backend with offline support, and MINSAL public APIs provide pharmacy/on-duty data.

## Goals
- Enable immediate pharmacy locator functionality with real-world data
- Support users who open app without login (anonymous access)
- Handle offline scenarios gracefully
- Build scalable foundation for AI features in Phase 2
- Comply with MINSAL regulations (no diagnosis, education only)

## Non-Goals
- AI-powered features (Phase 2)
- Advanced medication interaction analysis
- OCR prescription processing
- Performance optimization beyond MVP thresholds
- Multi-language support beyond Spanish/English

## Architecture Decisions

### Decision 1: Local-First Data Model
**What**: Keep complete pharmacy/on-duty data in local AsyncStorage cache. Sync from APIs periodically.
**Why**:
- MINSAL APIs lack guaranteed uptime (documented in project.md)
- Chilean users experience frequent connectivity drops
- Pharmacy locations change infrequently (weekly updates sufficient)
- Reduces API load and dependency on external services
**Alternatives Considered**:
- Server-side database (Firebase Firestore): Adds latency, costs, complexity
- Network-only (no cache): Fails in many Chilean rural areas
- Hybrid (query server first): Falls back to cache after timeout—selected

**Implementation**:
```typescript
// Data flow:
App Start → Check AsyncStorage for cache
         → If cache <7 days old: use it
         → If cache older/missing: fetch from API (show cached while loading)
         → If API fails: use cache or "no data" state

Scheduled (2 AM): Fetch fresh pharmacy list → Update AsyncStorage
                  Fetch fresh on-duty list → Update AsyncStorage
```

### Decision 2: Anonymous-First Authentication
**What**: Allow full app access without login. Users can "continue later" to sync across devices.
**Why**:
- Reduces signup friction for emergency scenarios
- Complies with offline requirement (local data independent of account)
- Enables quick user testing
**Alternatives Considered**:
- Require login: Too many users abandon before getting value
- No authentication: Cannot persist data to cloud, limits Phase 2

**Implementation**:
```typescript
Firebase Auth:
  - Anonymous user created on app launch
  - Email/Google OAuth allows login without losing local data
  - Merge anonymous data to authenticated account automatically
  - AsyncStorage + Firestore both store data (sync when possible)
```

### Decision 3: Real-Time Geolocation with Privacy-First Permissions
**What**: Request location permission once per session, allow address search as fallback.
**Why**:
- Privacy-sensitive health data requires explicit control
- Some users may disable location (valid use case with address search)
- Reduces battery drain (one-time request, not continuous tracking)
**Alternatives Considered**:
- Always-on GPS: Battery drain, privacy concerns, unnecessary
- Never request: Cannot show distances

**Implementation**:
```typescript
// Permission flow:
App Launch → Check AsyncStorage for stored preference
         → If not stored: show system dialog once
         → If denied: show address search form
         → If granted: fetch location, show map with distances

// Location refresh:
When user opens Pharmacy List → fetch fresh location
When location changes >500m → refresh pharmacy list sorting
```

### Decision 4: Offline Medication Adherence Tracking
**What**: Record medication adherence locally, sync to Firestore when online.
**Why**:
- Reminders must work offline (required feature)
- Adherence data is critical—cannot lose it
- Sync queue prevents data loss on connectivity gaps
**Alternatives Considered**:
- Cloud-only adherence: Requires always-online (invalid for Chile)
- No syncing: Creates data islands (cannot analyze trends)
- Selective sync: Complex conflict resolution

**Implementation**:
```typescript
Medication Reminder Fired:
  → Local notification (handled by React Native)
  → User taps "Took It"
  → Record to AsyncStorage + Realm DB (with timestamp)
  → Add to sync queue

When Online:
  → Check sync queue
  → POST adherence records to Firestore
  → Clear queue on success
  → On conflict: keep local timestamp, let server win (user truth)
```

### Decision 5: Pharmacy Data Structure
**What**: Store MINSAL pharmacy data locally with specific schema matching API format.
**Why**:
- Direct mapping to MINSAL API reduces transformation overhead
- Supports filtering/search without network
- Clear upgrade path for new MINSAL fields
**Alternatives Considered**:
- Normalized relational schema: Over-engineered for MVP
- Firebase Firestore directly: Incurs read costs, latency

**Implementation**:
```typescript
// Local AsyncStorage structure:
{
  "pharmacies": {
    "data": [
      {
        id: "...",
        nombre: "...",
        direccion: "...",
        comuna: "...",
        latitud: number,
        longitud: number,
        telefono: "...",
        horario: "...",
        servicios: [...]
      }
    ],
    "lastUpdated": ISO timestamp,
    "version": 1
  },
  "onDuty": {
    "date": ISO date (YYYY-MM-DD),
    "farmacyIds": ["id1", "id2", ...],
    "lastUpdated": ISO timestamp
  }
}
```

### Decision 6: Notification Strategy (Reminders)
**What**: Use React Native Push Notifications for local reminders, Firebase Cloud Messaging for future push.
**Why**:
- Local notifications work offline
- FCM enables future push from backend (e.g., refill reminders)
- Both support Android & iOS
**Alternatives Considered**:
- Native only: More complex setup per platform
- Firebase Realtime Database: Over-complicated for MVP

**Implementation**:
```typescript
// Reminder setup:
When user creates schedule: Register local notification for each dose
                            Configure 15-min advance notice (configurable)
                            Store notification IDs in AsyncStorage

// Fire sequence:
Notification triggers → React Native handler fires
                     → Check if app in foreground/background
                     → Show native notification
                     → Allow "Took It" action from notification
```

## Data Models

### User Profile
```typescript
interface IUserProfile {
  uid: string;                    // Firebase UID
  displayName: string;
  email?: string;                 // Optional if anonymous
  photoURL?: string;
  dateOfBirth?: Date;             // For age-specific guidance
  gender?: 'M' | 'F' | 'Other';
  allergies?: string[];           // User-entered
  conditions?: string[];          // User-entered health conditions
  preferredLanguage: 'es' | 'en';
  createdAt: Date;
  updatedAt: Date;

  // Offline flags
  lastSyncedAt?: Date;
  hasPendingChanges?: boolean;
}
```

### Medication Schedule
```typescript
interface IMedicationSchedule {
  id: string;                     // Local UUID or Firestore doc ID
  userId: string;
  medicationName: string;         // Must match ISP database
  dosage: string;                 // e.g., "500mg"
  frequency: 'once' | 'twice' | 'thrice' | 'custom';
  times: string[];                // ["08:00", "20:00"]
  mealRequirement?: 'fasting' | 'with-food' | 'any';
  startDate: Date;
  endDate?: Date;
  notes?: string;

  // Adherence
  adherenceHistory: {
    date: Date;
    taken: boolean;
    takenAt?: Time;
    skippedReason?: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;                // For offline tracking
}
```

### Pharmacy (Local Schema)
```typescript
interface IPharmacy {
  id: string;                     // MINSAL ID
  nombre: string;
  direccion: string;
  comuna: string;
  region: string;
  latitud: number;
  longitud: number;
  telefono?: string;
  horario?: string;               // Free text for now
  servicios?: string[];

  // Local enrichment
  distanceKm?: number;            // Calculated from user location
  isOnDutyToday?: boolean;
  isFavorite?: boolean;           // Stored in separate favorites list
  lastUpdated?: Date;
}
```

## Compliance & Security

### MINSAL Regulatory Compliance
- ✅ No diagnosis capability (AI placeholder, feature adds in Phase 2)
- ✅ No prescription capability (app only tracks user data)
- ✅ Educational information only (all responses prefaced with disclaimers)
- ✅ Health data encrypted at rest (Firebase + Firestore security rules)
- ✅ User data deletion available (Settings > Privacy > Delete Account)

### Data Protection (Ley 19.628)
- Location data: Explicit permission per session
- Health data: Encrypted with Firestore security rules (users/{uid}/medications)
- Consent model: Explicit opt-in for notifications, analytics
- Right to delete: Implement account deletion that cascades to all user docs

### Performance Constraints (from project.md)
- **AI response time**: Max 8 sec (Phase 2, not MVP)
- **Map loading**: Max 3 sec for 50 markers → AsyncStorage cache ensures this
- **App size**: Max 50MB download / 150MB installed → Monitor with EAS builds
- **GPS background**: Limited to 15 min max → Use one-time location request
- **Offline**: Basic features must work → Medication view, map, search all work offline

## Risks & Mitigations

### Risk: Pharmacy Data Inconsistency
Scenario: User caches pharmacy list Tuesday, opens app Friday offline seeing old data.
**Mitigation**:
- Store last update timestamp
- Show "Data from [date]" warning if >7 days old
- Sync on app launch if online
- Clear indication in UI when viewing stale data

### Risk: Notification Delivery Failures
Scenario: User scheduled medication reminder but never receives notification.
**Mitigation**:
- Store adherence state with badge count showing pending doses
- Show "Pending medications" on home screen
- Allow manual marking as taken
- Retry notification registration on app restart

### Risk: Firebase Quota Overages
Scenario: Unexpected Firestore write spikes due to adherence sync.
**Mitigation**:
- Implement batch writes (sync every 5 reminders taken, not each)
- Set billing alerts at $50/month
- Paginate sync to respect rate limits
- Monitor Firestore dashboard weekly

### Risk: Location Permission Denial
Scenario: User denies location, then cannot find pharmacies.
**Mitigation**:
- Address search form as primary fallback
- Manual location entry (region + postal code)
- Pre-populate regions if user grants coarse location only
- Document in onboarding

## Migration / Rollout Plan

### Phase 1 Release Strategy
1. **Closed Beta**: 100-200 internal testers + friends (2 weeks)
   - Verify pharmacy API accuracy (compare against known MINSAL data)
   - Test on various network conditions (WiFi, 3G, offline)
   - Collect crash reports via Sentry
   - User feedback on pharmacy search flow

2. **Regional Soft Launch**: Deploy to RM (Santiago region) only (1 week)
   - Monitor usage patterns
   - Confirm MINSAL API reliability
   - Gather user feedback on location accuracy
   - Fix any critical bugs before wider rollout

3. **National Launch**: Roll out to all regions
   - Scale Firebase capacity as needed
   - Monitor costs and performance

### Rollback Plan
- Keep previous Firebase schema version (add versioning flag)
- If critical pharmacy data corruption: restore AsyncStorage backup
- If notification system breaks: disable reminders, show manual checklist
- If maps crash: show list view with distance sorting

## AI Scope Enforcement Strategy (Phase 2)

Per project.md constraint (line 516), when Phase 2 implements the full AI medication advisor, the system MUST limit the AI to medication/pharmacy topics only.

### Implementation Approach

**1. System Prompt Design**
```
You are an expert medication and pharmacy assistant for Chilean users.

Your role:
- Answer questions about medications, dosages, frequencies, and side effects
- Provide information about nearby pharmacies, on-duty status, and locations
- Suggest bioequivalent alternatives when available
- Explain medication interactions and food interactions
- Help users understand optimal medication timing

Your boundaries:
- You ONLY answer questions about medications and pharmacies
- Do NOT provide general medical diagnosis or treatment advice
- Do NOT answer questions unrelated to medications or pharmacies
- If a user asks an out-of-scope question, politely decline and redirect

Example of OUT-OF-SCOPE: nutrition advice, exercise routines, mental health, general health conditions not related to medication
Example of IN-SCOPE: "Can I take this medication with food?", "What are side effects of X?", "Where's the nearest pharmacy?"
```

**2. Out-of-Scope Detection (Layered)**
- Layer 1 (Client-side): Pre-flight topic classification before sending to API
  - Keywords: medication, dosage, interaction, pharmacy, side effect, bioequivalent, contraindication
  - If query lacks medication/pharmacy keywords, show warning: "This question is outside my scope"
  - Allow user to refine query or proceed

- Layer 2 (API Response): Parse Claude response for rejection signals
  - Detect patterns: "I can't answer that", "outside my scope", "not about medications"
  - Flag response and show scope limitation message

- Layer 3 (Analytics): Log all out-of-scope attempts
  - Track patterns of off-topic queries
  - Use for future scope expansion decisions

**3. Rejection Message UI**
```
┌─────────────────────────────────────────┐
│ Outside My Scope                        │
├─────────────────────────────────────────┤
│ I can only help with medication and     │
│ pharmacy questions.                     │
│                                         │
│ Try asking me about:                    │
│ • Check medication interactions         │
│ • Find nearby pharmacy                  │
│ • Understand side effects               │
│                                         │
│ [Ask medication question] [Search Map]  │
└─────────────────────────────────────────┘
```

**4. Edge Cases & Handling**
- Borderline health queries (e.g., "I have a headache"): Redirect to medication scope
  - Show: "Ask me about medications to treat this condition"
- Medical emergencies (chest pain, difficulty breathing): Show warning
  - "If this is an emergency, call 911 immediately"
- Diagnosis requests: Gently redirect to healthcare provider
  - "Only a doctor can diagnose. Ask me about medications instead"

### Data Models for Phase 2

```typescript
// Scope classification result
interface ScopeClassification {
  isInScope: boolean;
  confidence: 0-1;      // 0 = uncertain, 1 = definitely in scope
  topics: string[];     // ["medication", "interaction"]
  reason: string;       // "Query contains medication keywords"
}

// Out-of-scope event (for analytics)
interface OutOfScopeEvent {
  userId: string;
  query: string;
  timestamp: Date;
  detectionLayer: 'client' | 'api' | 'none';
  userAction: 'refined' | 'proceeded' | 'dismissed';
}
```

### Testing Strategy

1. **Unit Tests**: Scope classification function
   - Test with 50+ medication-related queries (should pass)
   - Test with 50+ off-topic queries (should fail)
   - Test edge cases (nutrition, exercise, health conditions)

2. **Integration Tests**: End-to-end scope enforcement
   - Off-topic query → Rejection message → Quick actions
   - Borderline query → Gentle redirect
   - Emergency keywords → Warning display

3. **Manual Testing**: Scope enforcement edge cases
   - Test with ambiguous queries
   - Test with multi-language (Spanish/English)
   - Test with user's own medical history context

---

## Open Questions
1. **Bioequivalent database**: Should it be pre-bundled (larger APK) or fetched on demand? → **Decision**: Fetch in Phase 2, not MVP
2. **Pharmacy hours format**: MINSAL API returns free text. Should we parse into structured form? → **Decision**: Store as-is for MVP, parse in Phase 2
3. **Multi-timezone support**: How to handle users traveling? → **Decision**: Phase 2 "Travel Profile" feature
4. **Healthcare provider integration**: Export medication list? → **Decision**: Simple PDF export in Phase 2
5. **AI scope enforcement method**: Client-side filtering, API system prompt, or both? → **Decision**: Both (defense in depth) as designed in "AI Scope Enforcement Strategy" section above

