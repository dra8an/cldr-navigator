# Implementation Plan: Dates & Times Demo

**Created:** 2026-01-17
**Status:** Ready for Implementation
**Estimated Effort:** 4-6 hours

## Overview
Implement a comprehensive Dates & Times demo page following the established NumbersPage architecture. This will showcase CLDR date/time localization data with XML source linking for all displayed values.

## Goals
1. Create DatesPage.tsx displaying month names, day names, and date/time format patterns
2. Add XPath mappings for all date/time data structures
3. Implement interactive date formatter using Intl.DateTimeFormat
4. Enable routing and navigation to the new page
5. Add comprehensive tests for new mappings

## Implementation Steps

### Step 1: Add XPath Mappings for Date/Time Data
**File:** `/home/dragan/Projects/github/CLDRNavigator/src/lib/mapping/resolver.ts`

Add to the `PRECOMPUTED_MAPPINGS` object (after line 81):

**Month Names - Format.Wide (12 mappings):**
```typescript
'dates.calendars.gregorian.months.format.wide.1': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='1']",
},
// Repeat for months 2-12
```

**Month Names - Format.Abbreviated (12 mappings):**
```typescript
'dates.calendars.gregorian.months.format.abbreviated.1': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='1']",
},
// Repeat for months 2-12
```

**Day Names - Format.Wide (7 mappings):**
```typescript
'dates.calendars.gregorian.days.format.wide.sun': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='sun']",
},
// Repeat for mon, tue, wed, thu, fri, sat
```

**Day Names - Format.Abbreviated (7 mappings):**
```typescript
'dates.calendars.gregorian.days.format.abbreviated.sun': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='abbreviated']/day[@type='sun']",
},
// Repeat for mon, tue, wed, thu, fri, sat
```

**Day Periods (4 mappings):**
```typescript
'dates.calendars.gregorian.dayPeriods.format.wide.am': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='am']",
},
'dates.calendars.gregorian.dayPeriods.format.wide.pm': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='pm']",
},
'dates.calendars.gregorian.dayPeriods.format.wide.midnight': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='midnight']",
},
'dates.calendars.gregorian.dayPeriods.format.wide.noon': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='noon']",
},
```

**Eras (2 mappings):**
```typescript
'dates.calendars.gregorian.eras.eraAbbr.0': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/eras/eraAbbr/era[@type='0']",
},
'dates.calendars.gregorian.eras.eraAbbr.1': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/eras/eraAbbr/era[@type='1']",
},
```

**DateTime Formats (4 mappings):**
```typescript
'dates.calendars.gregorian.dateTimeFormats.full': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/dateTimeFormatLength[@type='full']/dateTimeFormat/pattern",
},
'dates.calendars.gregorian.dateTimeFormats.long': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/dateTimeFormatLength[@type='long']/dateTimeFormat/pattern",
},
'dates.calendars.gregorian.dateTimeFormats.medium': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/dateTimeFormatLength[@type='medium']/dateTimeFormat/pattern",
},
'dates.calendars.gregorian.dateTimeFormats.short': {
  xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/dateTimeFormatLength[@type='short']/dateTimeFormat/pattern",
},
```

**Total:** ~48 new mapping entries

### Step 2: Add Tests for XPath Mappings
**File:** `/home/dragan/Projects/github/CLDRNavigator/src/lib/mapping/__tests__/resolver.test.ts`

Add test suite:
```typescript
describe('Date/Time XPath Mappings', () => {
  it('should resolve month name paths', () => {
    const result = resolveXPath('dates.calendars.gregorian.months.format.wide.1', 'en')
    expect(result.xpath).toBe(
      "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='1']"
    )
  })

  it('should resolve day name paths', () => {
    const result = resolveXPath('dates.calendars.gregorian.days.format.wide.mon', 'en')
    expect(result.xpath).toBe(
      "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='mon']"
    )
  })

  it('should resolve day period paths', () => {
    const result = resolveXPath('dates.calendars.gregorian.dayPeriods.format.wide.am', 'en')
    expect(result.xpath).toBe(
      "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='am']"
    )
  })

  it('should resolve era paths', () => {
    const result = resolveXPath('dates.calendars.gregorian.eras.eraAbbr.0', 'en')
    expect(result.xpath).toBe(
      "//ldml/dates/calendars/calendar[@type='gregorian']/eras/eraAbbr/era[@type='0']"
    )
  })

  it('should resolve dateTime format paths', () => {
    const result = resolveXPath('dates.calendars.gregorian.dateTimeFormats.full', 'en')
    expect(result.xpath).toBe(
      "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/dateTimeFormatLength[@type='full']/dateTimeFormat/pattern"
    )
  })
})
```

Run tests: `npm test`

### Step 3: Create DatesPage Component
**File:** `/home/dragan/Projects/github/CLDRNavigator/src/pages/DatesPage.tsx` (NEW)

Create page with these sections following NumbersPage.tsx structure:

1. **Page Header** - Title and description
2. **Month Names** - Display all 12 months (wide + abbreviated) with SourceBadge
3. **Day Names** - Display all 7 days (wide + abbreviated) with SourceBadge
4. **Date Formats** - Show full, long, medium, short patterns with examples
5. **Time Formats** - Show full, long, medium, short patterns with examples
6. **Day Periods** - Show AM, PM, midnight, noon (optional)
7. **Interactive Date Formatter** - Input date/time, display formatted results

**Key Implementation Details:**
- Use `useDateData(selectedLocale)` hook (already exists)
- Extract: `const gregorian = data?.main?.[normalizedLocale]?.dates?.calendars?.gregorian`
- Month keys: `['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']`
- Day keys: `['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']`
- Use `buildJsonPath(normalizedLocale, 'dates', 'calendars', 'gregorian', ...pathParts)` for SourceBadge
- Format functions using `new Intl.DateTimeFormat(selectedLocale, options).format(date)`
- Date input: `useState(new Date())` with HTML5 datetime-local input

**Layout Pattern:**
- Card-based sections with `bg-card border rounded-lg p-6`
- Grid layout for month/day names: `grid md:grid-cols-3 lg:grid-cols-4 gap-4`
- SourceBadge in top-right of each item/card
- Loading/error states matching NumbersPage

### Step 4: Add Routing
**File:** `/home/dragan/Projects/github/CLDRNavigator/src/App.tsx`

Add import:
```typescript
import DatesPage from './pages/DatesPage'
```

Add route (line 12):
```typescript
<Route path="dates" element={<DatesPage />} />
```

### Step 5: Enable Navigation
**File:** `/home/dragan/Projects/github/CLDRNavigator/src/components/layout/Sidebar.tsx`

Line 14, change:
```typescript
{ to: '/dates', icon: Calendar, label: 'Dates & Times', disabled: true },
```

To:
```typescript
{ to: '/dates', icon: Calendar, label: 'Dates & Times' },
```

Remove `disabled: true` and the "(Soon)" badge will disappear automatically.

### Step 6: Testing & Verification

**Unit Tests:**
```bash
npm test
```
Verify all new XPath mapping tests pass.

**Manual Testing:**
1. Navigate to http://localhost:5173/dates
2. Verify page loads with English (en) locale
3. Check all sections display data correctly
4. Click SourceBadge on various items (month, day, format)
5. Verify XML modal opens with correct XPath and snippet
6. Switch to different locales (de, fr, ja, ar)
7. Verify data updates correctly
8. Test interactive date formatter with different dates
9. Test responsive design (resize browser)

**Build Verification:**
```bash
npm run build
npm run preview
```
Verify production build works correctly.

## Critical Files

1. **`src/pages/DatesPage.tsx`** (NEW) - Main implementation
2. **`src/lib/mapping/resolver.ts`** (MODIFY) - Add XPath mappings
3. **`src/App.tsx`** (MODIFY) - Add route
4. **`src/components/layout/Sidebar.tsx`** (MODIFY) - Enable navigation
5. **`src/lib/mapping/__tests__/resolver.test.ts`** (MODIFY) - Add tests

## Data Structure Reference

**Accessing Date Data:**
```typescript
const { data, isLoading, error } = useDateData(selectedLocale)
const normalizedLocale = normalizeLocaleForCldr(selectedLocale)
const gregorian = data?.main?.[normalizedLocale]?.dates?.calendars?.gregorian

// Month names (wide and abbreviated)
const monthsWide = gregorian?.months?.format?.wide
const monthsAbbr = gregorian?.months?.format?.abbreviated

// Day names (wide and abbreviated)
const daysWide = gregorian?.days?.format?.wide
const daysAbbr = gregorian?.days?.format?.abbreviated

// Format patterns
const dateFormats = gregorian?.dateFormats
const timeFormats = gregorian?.timeFormats
const dateTimeFormats = gregorian?.dateTimeFormats

// Day periods
const dayPeriods = gregorian?.dayPeriods?.format?.wide

// Eras
const eras = gregorian?.eras?.eraAbbr
```

## Interactive Demo Implementation

**State:**
```typescript
const [customDate, setCustomDate] = useState(new Date())
```

**Format Helper:**
```typescript
const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => {
  try {
    return new Intl.DateTimeFormat(selectedLocale, options).format(date)
  } catch {
    return date.toLocaleDateString()
  }
}
```

**Example Options:**
```typescript
{ dateStyle: 'full' }           // Thursday, January 17, 2026
{ dateStyle: 'long' }           // January 17, 2026
{ dateStyle: 'medium' }         // Jan 17, 2026
{ dateStyle: 'short' }          // 1/17/26
{ timeStyle: 'full' }           // 3:45:30 PM Eastern Standard Time
{ timeStyle: 'long' }           // 3:45:30 PM EST
{ timeStyle: 'medium' }         // 3:45:30 PM
{ timeStyle: 'short' }          // 3:45 PM
{ dateStyle: 'full', timeStyle: 'short' }  // Combined
```

## Expected Outcome

After implementation:
- ✅ Dates & Times demo page accessible at `/dates`
- ✅ All month and day names displayed with source links
- ✅ Date/time format patterns shown with examples
- ✅ Interactive date formatter working across all locales
- ✅ SourceBadge opens correct XML snippets from CLDR
- ✅ All tests passing
- ✅ Sidebar navigation enabled

## Success Metrics

1. Page displays data for all 14 supported locales
2. Every data point has working SourceBadge link
3. Interactive formatter produces correct output
4. No console errors or warnings
5. Tests pass with coverage for new mappings
6. Build size remains under 300KB gzipped

## Future Enhancements

After MVP completion, consider:
- Stand-alone month/day name contexts
- Narrow width variants
- Quarter names
- Additional day periods (morning, afternoon, evening, night)
- Sample of availableFormats (showing common patterns like "yMMMd", "Ehm")
- Pattern syntax explainer tooltip
- Relative date formatting examples
