# Bug Fix: Calendar XPath Disambiguation

## Issue Report
**Date:** 2026-01-17
**Severity:** High
**Component:** XML XPath extraction (`src/lib/xml/fetcher.ts`)

### Problem Description
When clicking on month name source badges in the Dates page, the XML snippet showed Chinese calendar data ("First Month", "Second Month") instead of Gregorian calendar data ("January", "February").

### Root Cause
The `extractXmlSnippet` function was searching for parent elements **backwards** (from leaf to root), which caused it to find the **first occurrence** of matching elements in the XML file.

In CLDR XML files:
- Chinese calendar appears at ~line 1816
- Gregorian calendar appears at ~line 2437

When searching for:
```xpath
//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='1']
```

The old implementation would:
1. Start searching from the end of the path
2. Find the first `monthWidth[@type='wide']` element (Chinese calendar at line ~1816)
3. Return Chinese calendar data instead of Gregorian

## The Fix

### Code Change
**File:** `src/lib/xml/fetcher.ts` (lines 105-132)

**Before:**
```typescript
// Search for parent elements from most specific to least specific
// This progressively narrows the search scope
for (let i = keyElements.length - 2; i >= 0; i--) {
  // Searches BACKWARDS from leaf to root
```

**After:**
```typescript
// Search for parent elements from root to leaf (FORWARD)
// This progressively narrows the search scope by following the path
for (let i = 0; i < keyElements.length - 1; i++) {
  // Searches FORWARD from root to leaf
```

### Why This Works
By searching **forward** through the XPath:
1. First finds `calendar[@type='gregorian']` at line ~2437
2. Narrows search scope to within that calendar's closing tag
3. Then searches for `monthWidth[@type='wide']` only within Gregorian calendar
4. Correctly finds "January" instead of "First Month"

## Verification

### Unit Tests Added
Created 7 comprehensive regression tests in `src/lib/xml/__tests__/fetcher.test.ts`:

1. ✅ **should find Gregorian month names, NOT Chinese month names**
   - Verifies "January" is found, not "First Month"

2. ✅ **should find Gregorian abbreviated months correctly**
   - Verifies "Jan" is found, not "Mo1"

3. ✅ **should find Gregorian day names, NOT Chinese day names**
   - Verifies "Sunday" is found, not "Chinese Sunday"

4. ✅ **should correctly find month type 2 (February)**
   - Verifies "February" is found, not "Second Month"

5. ✅ **should correctly find month type 3 (March)**
   - Verifies "March" is found, not "Third Month"

6. ✅ **should be able to find Chinese calendar when explicitly requested**
   - Ensures Chinese calendar can still be accessed intentionally

7. ✅ **should return different line numbers for Chinese vs Gregorian calendar months**
   - Ensures line numbers are correctly differentiated

### Test Results
```
✓ src/lib/xml/__tests__/fetcher.test.ts (29 tests) - All PASS
  - Previous: 22 tests
  - New: 29 tests (+7 regression tests)

Total Tests: 79 passed (79)
```

### Build Verification
```
✓ TypeScript compilation: SUCCESS
✓ Production build: SUCCESS
✓ Bundle size: 288.84 kB gzipped
```

## Impact

### Fixed
- ✅ Month names now show correct Gregorian calendar data
- ✅ Day names now show correct Gregorian calendar data
- ✅ All date/time format patterns now link to correct calendar sections
- ✅ Line numbers correctly point to Gregorian calendar entries

### Unaffected
- ✅ Number formatting source links still work correctly
- ✅ All existing tests continue to pass
- ✅ No breaking changes to API or interfaces

## Regression Prevention

The 7 new unit tests specifically guard against this bug recurring by:
1. Testing the exact scenario that caused the bug (multiple calendars in same file)
2. Verifying both positive cases (correct data found) and negative cases (wrong data NOT found)
3. Checking line number accuracy
4. Ensuring calendar-specific XPaths work for both Chinese and Gregorian calendars

## Additional Improvements

Added user-facing documentation in `src/pages/DatesPage.tsx`:
```tsx
<div className="mt-3 px-4 py-2 bg-muted/50 border border-muted rounded-md text-sm">
  <p className="text-muted-foreground">
    <span className="font-semibold text-foreground">Note:</span> This page displays data for the{' '}
    <span className="font-mono font-semibold">Gregorian calendar</span>. CLDR includes data for multiple calendar systems (Chinese, Hebrew, Islamic, etc.) which may be added in future updates.
  </p>
</div>
```

## Future Enhancements

Potential improvements identified during investigation:
1. **Calendar Selector** - UI to switch between different calendar systems
2. **Available Formats** - Display additional format patterns from `<availableFormats>`
3. **Interval Formats** - Show date range formatting patterns from `<intervalFormats>`

## Conclusion

The bug has been fixed, thoroughly tested, and documented. The regression tests ensure this specific issue won't reoccur. All source badge links now correctly point to Gregorian calendar data in the CLDR XML files.
