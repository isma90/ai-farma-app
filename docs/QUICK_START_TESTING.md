# Quick Start: Testing the Fixed Medication Scheduling System

**Last Updated**: 2026-01-28
**Status**: Ready for testing
**Commits**: 84d14d2 (LLM extraction) is the core fix

---

## What Was Fixed

❌ **Before**: User provides medications → System can't extract them → Stuck
✅ **After**: User provides medications → System extracts & generates schedule → Works

---

## How to Test

### Step 1: Pull Latest Code
```bash
git pull origin main
# Latest: 91eebd5 (Implementation summary)
```

### Step 2: Build and Run
```bash
npm install
npm start
# or: expo start
```

### Step 3: Open Chat
Navigate to the medication scheduling chat

---

## Test Cases (Copy-Paste These)

### Test 1: Simple Format (Should Work)
```
Paracetamol 500mg cada 8h, Amoxicilina 500mg cada 12h
```

**Expected Result**:
```
✓ Extracted 2 medications
✓ Has all frequencies
✓ Generates schedule
✓ Shows calendar in chat
```

### Test 2: Complex Format (Fixed!)
```
Levotiroxina 500mg cada 12h,
Omeprazol 20ml cada 12h,
Calcio una cápsula de 500mg vez al día
azitromicina 1g cada 12h
```

**Expected Result**:
```
✓ Extracted 4 medications (was 3)
✓ All frequencies detected (was false)
✓ State skips to schedule generation
✓ Shows all 4 medications in calendar
```

### Test 3: Missing Frequency (Should Ask)
```
Levotiroxina 500mg, Omeprazol 20ml
```

**Expected Result**:
```
✓ Extracted 2 medications
✗ Missing frequencies
→ System asks: "What's the frequency?"
```

Then provide:
```
cada 12h para ambos
```

**Expected Result**:
```
✓ Now has frequencies
✓ Generates schedule
```

### Test 4: Text-Based Dosage (Fixed!)
```
Calcio una cápsula de 500mg cada 12h
```

**Expected Result**:
```
✓ Extracts: Calcio | una cápsula de 500mg | cada 12h
✓ Not just: Calcio | | cada 12h
```

---

## Where to See the Logs

### Browser DevTools
```
F12 → Console tab
Look for: [ChatService] logs
```

### React Native Debugger
```
Command+M (iOS simulator)
Open Debugger
Look for: [ChatService] logs
```

### Web Console
```
Open browser console (F12)
Filter by: ChatService
```

---

## What to Look For in Logs

### ✅ Success Pattern
```
LOG  [ChatService] ========== NEW MESSAGE ==========
LOG  [ChatService] User message: Levotiroxina 500mg cada 12h, Omeprazol 20ml cada 12h...
LOG  [ChatService] ✓ Extracted 4 medications:
LOG    - Levotiroxina 500mg | cada 12h
LOG    - Omeprazol 20ml | cada 12h
LOG    - Calcio 500mg | vez al día
LOG    - azitromicina 1g | cada 12h
LOG  [ChatService] SmartStateAnalyzer result:
LOG    hasAllMedications: ✓ YES
LOG    hasAllFrequencies: ✓ YES
LOG    canSkipStates: ✓ YES
LOG    skipTo: GENERATING_TIMES
LOG  [ChatService] ✓ State transition: COLLECTING_MEDS → GENERATING_TIMES
LOG  [ChatService] ✓ Generated schedule with X time slots
LOG  [ChatService] Assistant response: ⏰ HORARIOS RECOMENDADOS...
LOG  [ChatService] ========== END MESSAGE ==========
```

### ❌ Failure Pattern (Incomplete Data)
```
LOG  [ChatService] ========== NEW MESSAGE ==========
LOG  [ChatService] User message: Levotiroxina 500mg
LOG  [ChatService] ✓ Extracted 1 medications:
LOG    - Levotiroxina 500mg | (no frequency)
LOG  [ChatService] SmartStateAnalyzer result:
LOG    hasAllMedications: ✓ YES
LOG    hasAllFrequencies: ✗ NO  ← Stuck here
LOG    canSkipStates: ✗ NO
LOG  [ChatService] Assistant response: Entendido. ¿Con qué frecuencia tomas...?
LOG  [ChatService] ========== END MESSAGE ==========
```
This is NORMAL - system asking for missing info

### 🔴 LLM Extraction Failed
```
LOG  [ChatService] ⚠ No medications extracted from message
```
- Check if message was valid
- Check OpenAI API key
- Try again (usually works on retry)

---

## Troubleshooting

### Issue: Still only extracting 3 medications
**Solution**: Make sure you pulled latest code (commit 84d14d2)
```bash
git log --oneline | head -5
# Should show: 91eebd5 (or later)
```

### Issue: No logs showing up
**Solution**:
1. Check console is open (F12)
2. Filter by "ChatService"
3. Make sure you're on the right chat tab
4. Try sending another message

### Issue: Extraction says 4 medications but shows 3
**Solution**: This shouldn't happen after commit 84d14d2. Try:
1. Refresh the app
2. Clear browser cache
3. Rebuild: `npm start`

### Issue: LLM extraction fails (returns empty)
**Solution**:
- Check internet connection
- Check OpenAI API key is set
- Try simpler input first
- Check OpenAI API is not rate limited
- Try again in 30 seconds

### Issue: Calendar doesn't show
**Solution**: Commit 2fc19a4 added this. Make sure you have it:
```bash
git log --oneline | grep "2fc19a4"
# Should find: 2fc19a4 fix: append generated schedule
```

---

## Key Commits to Verify

```bash
git log --oneline --graph | head -20

# Should show (in order):
# 91eebd5 - Implementation summary (just now)
# ae4a98c - LLM extraction documentation
# 84d14d2 - LLM extraction (CORE FIX) ← Most important
# f4d1473 - Old regex attempt (superseded)
# 1cee8c7 - Enhanced logging
# 29d50e5 - Enhanced logging
# 8ce3f25 - State transitions fix
# 6ebaf1b - LLM scheduling
# 2fc19a4 - Schedule display
# 49066a2 - Timeout protection
```

---

## Performance Expectations

### First Message (with all info)
- Time to extraction: 1-2 seconds
- Time to analysis: 1-2 seconds
- Time to schedule: 1-2 seconds
- **Total**: 3-6 seconds to see calendar

### Subsequent Messages
- Similar timing
- Same 3-6 second window

### If Slower (>10 seconds)
- Check internet connection
- Check OpenAI API status
- Check rate limiting (wait 30s)
- Check system load

---

## Sample Messages to Try

### All at Once (Main Test Case)
```
El médico me acaba de recetar Levotiroxina 500mg cada 12h,
Omeprazol 20ml cada 12h, Calcio una cápsula de 500mg una vez al día,
y azitromicina 1g cada 12h. Cómo debería tomarlos?
```

### Step by Step (Secondary Test Case)
```
Message 1: Necesito un cronograma para mis medicamentos
Response: OK, ¿cuáles son?

Message 2: Paracetamol 500mg, Amoxicilina 500mg
Response: ¿Con qué frecuencia?

Message 3: Cada 8h para Paracetamol y cada 12h para Amoxicilina
Response: Generando... [Schedule]
```

### With Text Dosage (Test Case 3)
```
Me recetaron:
- una cápsula de Calcio de 500mg al día
- Levotiroxina 100mcg cada 12h
- un comprimido de Omeprazol cada 12h
```

### Spanish Variations (Test Case 4)
```
Necesito tomar:
- Paracetamol: 2 veces al día
- Amoxicilina: 1 vez cada 12 horas
- Loratadina: una vez diaria
```

---

## Success Criteria

✅ **Test Passed If**:
- All medications extracted correctly
- All frequencies detected correctly
- State transitions to schedule generation
- Calendar displays in chat
- Console logs are clear and readable
- No errors in console

❌ **Test Failed If**:
- Missing any medications
- Saying frequencies are missing when provided
- State machine stays in COLLECTING_FREQUENCY
- No calendar showing
- Errors or warnings in console

---

## What to Report If Issues Found

If you find a problem, copy this from console:
```
[ChatService] ========== NEW MESSAGE ==========
...all logs between these markers...
[ChatService] ========== END MESSAGE ==========
```

And provide:
1. What you sent to the system
2. The logs between the markers
3. What happened vs what was expected

---

## Next Steps After Testing

1. **If all works**:
   - Great! System is ready for production
   - Test a few more edge cases
   - Get user feedback on schedule quality

2. **If issues found**:
   - Copy the logs
   - Report the exact input that failed
   - Include the error from console
   - We can debug from logs instead of screenshots

3. **Performance feedback**:
   - Is 3-6 seconds acceptable?
   - Would caching help?
   - Any other improvements?

---

## Reference Files

| Document | Purpose |
|----------|---------|
| `IMPLEMENTATION_SUMMARY_2026-01-28.md` | Complete overview of all 6 fixes |
| `docs/LLM_MEDICATION_EXTRACTION.md` | Why we use LLM instead of regex |
| `docs/changelog-2026-01-28-2310-84d14d2.md` | Core LLM extraction commit details |
| `LOGGING_IMPROVEMENTS_SUMMARY.md` | How to use the logs for debugging |
| `BUG_FIX_REPORT_2026-01-28.md` | The original regex bugs (now fixed) |

---

**Ready to test! Let me know how it goes!**
