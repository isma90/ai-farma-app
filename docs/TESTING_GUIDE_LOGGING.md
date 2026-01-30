# Testing Guide: Enhanced Logging & Medication Scheduling

**Date**: 2026-01-28
**Purpose**: Test the complete medication scheduling flow with detailed logging

---

## What to Expect

The app now logs every step of the medication scheduling process. You can:
- See exactly what medications were extracted from your message
- Understand what the AI analyzer determined
- Know when and why the system transitions between states
- See the complete generated schedule with times and medication assignments
- Share these logs instead of screenshots for debugging

## Test Case 1: Simple Schedule (All Information at Once)

### Your Message
```
Paracetamol 500mg cada 8h, Amoxicilina 500mg cada 12h
```

### Expected Console Output
```
[ChatService] ========== NEW MESSAGE ==========
[ChatService] User message: Paracetamol 500mg cada 8h, Amoxicilina 500mg cada 12h
[ChatService] Current state: COLLECTING_MEDS
[ChatService] Message type: SCHEDULE_RELATED
[ChatService] ✓ Extracted 2 medications:
  - Paracetamol 500mg every cada 8h
  - Amoxicilina 500mg every cada 12h
[ChatService] Running intelligent state analysis...
[ChatService] SmartStateAnalyzer result:
  hasAllMedications: ✓ YES
  hasAllFrequencies: ✓ YES
  canSkipStates: ✓ YES
  skipTo: GENERATING_TIMES
  confidence: 92%
  reasoning: Se proporcionaron todos los medicamentos con dosis y frecuencias explícitas...
  currentState: COLLECTING_MEDS
  medicationCount: 2
[ChatService] ✓ Intelligent skip detected: COLLECTING_MEDS → GENERATING_TIMES
[ChatService] ✓ State transition: COLLECTING_MEDS → GENERATING_TIMES
[ChatService] ✓ Requesting optimal schedule from medication specialist for 2 medications...
[ChatService] ✓ Received schedule recommendation in ~1000 ms
  Times: 07:00, 15:00, 23:00, 09:00, 21:00
  Schedule entries: 3
    07:00 → Paracetamol 500mg + Amoxicilina 500mg
    15:00 → Paracetamol 500mg
    23:00 → Paracetamol 500mg
  Interactions detected: 0
[ChatService] ✓ Generated schedule with 5 time slots
[ChatService] Appended generated schedule to response
[ChatService] Assistant response: Voy a generar los horarios...
[ChatService] Final state:
  State: SHOWING_PROPOSAL
  Medications: 2 collected
  Times: 5 generated
  Summary: Showing proposed schedule to user
[ChatService] ========== END MESSAGE ==========
```

### What Should Happen in Chat
1. ✓ Medications extracted correctly
2. ✓ System recognizes all information is provided
3. ✓ System skips straight from COLLECTING_MEDS to GENERATING_TIMES
4. ✓ Schedule is generated with optimal times
5. ✓ Calendar appears in the chat response:
   ```
   ⏰ HORARIOS RECOMENDADOS:

   07:00 → Paracetamol 500mg + Amoxicilina 500mg
   15:00 → Paracetamol 500mg
   23:00 → Paracetamol 500mg

   ¿Te acomodan estos horarios? ¿Algún cambio?
   ```

---

## Test Case 2: Medications with Missing Frequency

### Your Message
```
Levotiroxina 500mg cada 12h, Omeprazol 20ml cada 12h, Calcio una cápsula
```

### Expected Console Output
```
[ChatService] ========== NEW MESSAGE ==========
[ChatService] User message: Levotiroxina 500mg cada 12h, Omeprazol 20ml cada 12h, Calcio una cápsula
[ChatService] Current state: COLLECTING_MEDS
[ChatService] Message type: SCHEDULE_RELATED
[ChatService] ✓ Extracted 3 medications:
  - Levotiroxina 500mg every cada 12h
  - Omeprazol 20ml every cada 12h
  - Calcio 1 (no frequency)
[ChatService] Running intelligent state analysis...
[ChatService] SmartStateAnalyzer result:
  hasAllMedications: ✓ YES
  hasAllFrequencies: ✗ NO
  canSkipStates: ✗ NO
  skipTo: N/A
  confidence: 85%
  reasoning: Se proporcionaron los medicamentos, pero falta la frecuencia para Calcio...
  currentState: COLLECTING_MEDS
  medicationCount: 3
[ChatService] ⚠ Waiting for more information (medications/frequencies incomplete)
[ChatService] Assistant response: Entendido. Tengo 3 medicamentos pero me falta...
[ChatService] Final state:
  State: COLLECTING_MEDS
  Medications: 3 collected
  Times: 0 generated
  Summary: Waiting for frequencies for 3 medications
[ChatService] ========== END MESSAGE ==========
```

### What Should Happen in Chat
1. ✓ Extracts 3 medications
2. ✓ Detects that Calcio is missing frequency
3. ✓ Does NOT skip to schedule generation
4. ✓ Asks user for Calcio's frequency
5. ✓ No calendar shown yet

---

## Test Case 3: Adding Missing Frequency

### Your Follow-up Message
```
Calcio cada 12h
```

### Expected Console Output
```
[ChatService] ========== NEW MESSAGE ==========
[ChatService] User message: Calcio cada 12h
[ChatService] Current state: COLLECTING_MEDS
[ChatService] Message type: SCHEDULE_RELATED
[ChatService] ✓ Extracted 1 medications:
  - Calcio (no frequency)
[ChatService] Running intelligent state analysis...
[ChatService] SmartStateAnalyzer result:
  hasAllMedications: ✓ YES
  hasAllFrequencies: ✓ YES
  canSkipStates: ✓ YES
  skipTo: GENERATING_TIMES
  confidence: 90%
  reasoning: Ahora se proporcionó frecuencia para Calcio...
  currentState: COLLECTING_MEDS
  medicationCount: 3
[ChatService] ✓ Intelligent skip detected: COLLECTING_MEDS → GENERATING_TIMES
[ChatService] ✓ State transition: COLLECTING_MEDS → GENERATING_TIMES
[ChatService] ✓ Requesting optimal schedule from medication specialist for 3 medications...
[ChatService] ✓ Received schedule recommendation in ~1500 ms
  Times: 07:00, 13:00, 19:00
  Schedule entries: 3
    07:00 → Levotiroxina 500mg (2 hours before food) + Calcio 1000mg
    13:00 → Omeprazol 20ml (before meals)
    19:00 → Levotiroxina 500mg (bedtime)
  Interactions detected: 1
    - Levotiroxina and Calcio: separate 2-4 hours
[ChatService] ✓ Generated schedule with 3 time slots
[ChatService] Appended generated schedule to response
[ChatService] Assistant response: Perfecto. Aquí está tu cronograma...
[ChatService] Final state:
  State: SHOWING_PROPOSAL
  Medications: 3 collected
  Times: 3 generated
  Summary: Showing proposed schedule to user
[ChatService] ========== END MESSAGE ==========
```

### What Should Happen in Chat
1. ✓ Extracts frequency for Calcio
2. ✓ Detects NOW all information is complete
3. ✓ Skips to schedule generation
4. ✓ LLM generates schedule with interaction awareness
5. ✓ Calendar shows 3 time slots with proper spacing
6. ✓ Interaction note about Levotiroxina and Calcio separation

---

## How to Debug Using Logs

### If Schedule Not Generated

**Look for**:
```
[ChatService] Final state:
  State: COLLECTING_FREQUENCY
  Times: 0 generated
```

**This means**: System is waiting for frequencies, not ready to generate yet.

**Check**:
- Did SmartStateAnalyzer say `hasAllFrequencies: ✗ NO`?
- Which medication is missing frequency?
- Look at the reasoning message for what's missing

### If State Not Transitioning

**Look for**:
```
[ChatService] ✓ State transition: COLLECTING_MEDS → GENERATING_TIMES
```

**If not present**:
- System is still in COLLECTING state
- Check SmartStateAnalyzer result for why:
  - `hasAllMedications: ✗ NO` = still need more medications
  - `hasAllFrequencies: ✗ NO` = still need frequencies
  - Look at `reasoning` field for specifics

### If Schedule Generation Fails

**Look for**:
```
[ChatService] ✗ Schedule generation returned empty times
```

**This means**: LLM optimizer couldn't generate schedule. Check:
- Did LLM receive correct medications?
- Are there syntax errors in medication names?
- Is the OpenAI API key valid?
- Check full error message in console

---

## Checklist for Testing

- [ ] Test Case 1: Both meds + frequencies in one message → calendar appears
- [ ] Test Case 2: Missing frequency → system asks for it
- [ ] Test Case 3: Complete frequency → schedule generates
- [ ] Verify all logs appear in console
- [ ] Verify message boundaries are clear
- [ ] Verify medication extraction is accurate
- [ ] Verify state transitions are logged
- [ ] Verify schedule details appear inline in logs
- [ ] Copy log output and verify it's readable as plain text

---

## How to Share Logs with Developer

1. **Test medication scenario** that caused issue
2. **Open React Native debugger** or web inspector console
3. **Find logs** between:
   ```
   [ChatService] ========== NEW MESSAGE ==========
   ...
   [ChatService] ========== END MESSAGE ==========
   ```
4. **Copy the entire block** of logs
5. **Share with developer** in message/issue report

Example report:
```
Issue: Calendar not showing for 2 medications

Here's the console log:

[ChatService] ========== NEW MESSAGE ==========
[ChatService] User message: Paracetamol 500mg cada 8h, Amoxicilina 500mg cada 12h
...
[ChatService] ========== END MESSAGE ==========
```

No screenshots needed! The logs contain all information.

---

## Performance Notes

**Expected timing**:
- Medication extraction: <10ms
- SmartStateAnalyzer: 1-3 seconds (LLM call)
- Schedule generation: 1-2 seconds (LLM call)
- Total per message: 2-5 seconds typical

**If slower**:
- Check internet connection
- OpenAI API might be slow
- Logs will show exact timing: "in ~1500 ms"

---

## Success Indicators

✓ All two indicators (✓ and ✗) appearing in logs
✓ Message boundaries clearly visible
✓ Medications extracted with all details
✓ SmartStateAnalyzer results clear
✓ State transitions logged with paths
✓ Schedule shows time entries inline
✓ Final state shows what happened
✓ No errors in console (except expected warnings)

---

Ready to test! Run the app and try the test cases above.
