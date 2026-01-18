# Currency Demo Implementation Plan

**Created:** 2026-01-17
**Status:** Ready for implementation
**Estimated Effort:** 2-3 days

---

## Overview

Implement a comprehensive Currency demo page following the established NumbersPage and DatesPage architecture. This will showcase CLDR currency localization data with XML source linking for all displayed values.

## Goals

1. Create CurrencyPage.tsx displaying currency symbols, display names, and format patterns
2. Add XPath mappings for all currency data structures
3. Implement interactive currency formatter using Intl.NumberFormat
4. Enable routing and navigation to the new page
5. Add comprehensive tests for new mappings

## CLDR Currency Data Available

Based on exploration, CLDR provides for each currency (USD, EUR, GBP, etc.):
- `displayName` - Full currency name (e.g., "US Dollar")
- `displayName-count-one` - Singular form (e.g., "US dollar")
- `displayName-count-other` - Plural form (e.g., "US dollars")
- `symbol` - Standard currency symbol (e.g., "$", "€", "£")
- `symbol-alt-narrow` - Narrow variant (e.g., "$")

**Total:** 300+ currency codes including modern, historical, and special currencies

### Currency Data Structure

```json
{
  "main": {
    "en": {
      "numbers": {
        "currencies": {
          "USD": {
            "displayName": "US Dollar",
            "displayName-count-one": "US dollar",
            "displayName-count-other": "US dollars",
            "symbol": "$",
            "symbol-alt-narrow": "$"
          },
          "EUR": {
            "displayName": "Euro",
            "displayName-count-one": "euro",
            "displayName-count-other": "euros",
            "symbol": "€",
            "symbol-alt-narrow": "€"
          }
        }
      }
    }
  }
}
```

## Page Design

### Tab Structure

The Currency page will use a 4-tab layout similar to DatesPage:

#### Tab 1: Overview
- Currency format patterns (standard, accounting)
- Pattern explanation (¤ = symbol placeholder)
- Interactive formatter with amount input
- Examples with multiple currencies

#### Tab 2: Major Currencies
- Grid of 20-30 major world currencies
- Each card shows:
  - Currency code (USD, EUR, etc.)
  - Display name
  - Symbol
  - Formatted example amount
  - SourceBadge for display name and symbol

#### Tab 3: All Currencies
- Search input at top
- Filterable list of all 300+ currencies
- Grouped display (modern, historical, special)
- Same card format as Tab 2
- Virtualization if performance is an issue

#### Tab 4: Try It Yourself
- Amount input (number)
- Currency selector (dropdown with search)
- Output cards showing:
  - Standard format
  - Accounting format
  - Narrow symbol variant
  - Display name (singular/plural based on amount)

## Implementation Steps

### Step 1: Enhance Dynamic XPath Mapping

**File:** `src/lib/mapping/resolver.ts`

Add currency path handling to `transformJsonPathToXPath()`:

```typescript
// Pattern: numbers.currencies.<CODE>.<field>
// Maps to: //ldml/numbers/currencies/currency[@type='<CODE>']/<field>

if (segments[i] === 'currencies' && i + 1 < segments.length) {
  const currencyCode = segments[i + 1]
  parts.push('currencies')
  parts.push(`currency[@type='${currencyCode}']`)

  // If there's a field after the currency code (displayName, symbol, etc.)
  if (i + 2 < segments.length) {
    const field = segments[i + 2]
    parts.push(field)
    i += 2 // Skip currency code and field
  } else {
    i++ // Skip just currency code
  }
  continue
}
```

This enables dynamic mapping for all 300+ currencies without hardcoding each one.

### Step 2: Add Tests for XPath Mappings

**File:** `src/lib/mapping/__tests__/resolver.test.ts`

```typescript
describe('Currency XPath Mappings', () => {
  it('should resolve currency display name paths', () => {
    const result = resolveXPath('numbers.currencies.USD.displayName', 'en')
    expect(result.xpath).toBe(
      "//ldml/numbers/currencies/currency[@type='USD']/displayName"
    )
  })

  it('should resolve currency symbol paths', () => {
    const result = resolveXPath('numbers.currencies.EUR.symbol', 'en')
    expect(result.xpath).toBe(
      "//ldml/numbers/currencies/currency[@type='EUR']/symbol"
    )
  })

  it('should resolve currency plural forms', () => {
    const result = resolveXPath('numbers.currencies.GBP.displayName-count-one', 'en')
    expect(result.xpath).toBe(
      "//ldml/numbers/currencies/currency[@type='GBP']/displayName[@count='one']"
    )
  })

  it('should resolve currency format patterns', () => {
    const result = resolveXPath('numbers.currencyFormats-numberSystem-latn.standard', 'en')
    expect(result.xpath).toContain("currencyFormats")
  })
})
```

### Step 3: Create CurrencyPage Component

**File:** `src/pages/CurrencyPage.tsx` (NEW)

#### Data Access Pattern

```typescript
import { useCurrencyData } from '@/hooks/useCldrData'
import { useLocaleStore } from '@/store/localeStore'
import { normalizeLocaleForCldr } from '@/lib/cldr/loader'

const { selectedLocale } = useLocaleStore()
const { data, isLoading, error } = useCurrencyData(selectedLocale)
const normalizedLocale = normalizeLocaleForCldr(selectedLocale)

// Extract currency data
const currencies = data?.main?.[normalizedLocale]?.numbers?.currencies
```

#### Major Currencies List

```typescript
const majorCurrencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY',
  'HKD', 'NZD', 'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR',
  'RUB', 'ZAR', 'TRY', 'BRL', 'TWD', 'DKK', 'PLN', 'THB'
]
```

#### Currency Formatter

```typescript
const formatCurrency = (amount: number, currencyCode: string) => {
  try {
    return new Intl.NumberFormat(selectedLocale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  } catch (error) {
    console.error(`Failed to format ${currencyCode}:`, error)
    return `${currencyCode} ${amount}`
  }
}
```

#### Search Functionality

```typescript
const [searchQuery, setSearchQuery] = useState('')

const filteredCurrencies = Object.entries(currencies || {}).filter(
  ([code, data]) =>
    code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    data.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
)
```

#### SourceBadge Integration

```typescript
// For currency display name
<SourceBadge
  jsonPath={buildJsonPath(
    normalizedLocale,
    'numbers',
    'currencies',
    'USD',
    'displayName'
  )}
  locale={normalizedLocale}
/>

// For currency symbol
<SourceBadge
  jsonPath={buildJsonPath(
    normalizedLocale,
    'numbers',
    'currencies',
    'EUR',
    'symbol'
  )}
  locale={normalizedLocale}
/>
```

### Step 4: Add Routing

**File:** `src/App.tsx`

```typescript
import CurrencyPage from './pages/CurrencyPage'

// Add route after dates route
<Route path="currency" element={<CurrencyPage />} />
```

### Step 5: Enable Navigation

**File:** `src/components/layout/Sidebar.tsx`

```typescript
// Change from:
{ to: '/currency', icon: DollarSign, label: 'Currency', disabled: true },

// To:
{ to: '/currency', icon: DollarSign, label: 'Currency' },
```

### Step 6: Testing & Verification

#### Unit Tests
```bash
npm test
```
Verify all new XPath mapping tests pass.

#### Manual Testing Checklist
1. Navigate to http://localhost:5173/currency
2. Verify page loads with English (en) locale
3. Check all tabs display data correctly
4. Click SourceBadge on various currencies
5. Verify XML modal opens with correct XPath and snippet
6. Switch to different locales (de, fr, ja, ar)
7. Verify currency names and symbols update correctly
8. Test interactive formatter with different amounts and currencies
9. Test search functionality in "All Currencies" tab
10. Test responsive design (resize browser)

#### Build Verification
```bash
npm run build
npm run preview
```
Verify production build works correctly and bundle stays under 300KB gzipped.

## Critical Files

1. **`src/pages/CurrencyPage.tsx`** (NEW) - Main implementation
2. **`src/lib/mapping/resolver.ts`** (MODIFY) - Add dynamic currency XPath mapping
3. **`src/App.tsx`** (MODIFY) - Add route
4. **`src/components/layout/Sidebar.tsx`** (MODIFY) - Enable navigation
5. **`src/lib/mapping/__tests__/resolver.test.ts`** (MODIFY) - Add tests

## Data Structure Reference

### Accessing Currency Data

```typescript
const { data, isLoading, error } = useCurrencyData(selectedLocale)
const normalizedLocale = normalizeLocaleForCldr(selectedLocale)
const currencies = data?.main?.[normalizedLocale]?.numbers?.currencies

// Access specific currency
const usd = currencies?.USD
// {
//   displayName: "US Dollar",
//   displayName-count-one: "US dollar",
//   displayName-count-other: "US dollars",
//   symbol: "$",
//   symbol-alt-narrow: "$"
// }

// Get all currency codes
const currencyCodes = Object.keys(currencies || {})

// Get currency format patterns (from numbers data)
const numbers = data?.main?.[normalizedLocale]?.numbers
const currencyFormats = numbers?.['currencyFormats-numberSystem-latn']
// {
//   standard: "¤#,##0.00",
//   accounting: "¤#,##0.00;(¤#,##0.00)",
//   ...
// }
```

## Expected Outcome

After implementation:
- ✅ Currency demo page accessible at `/currency`
- ✅ All currency data displayed with source links
- ✅ 300+ currencies browsable and searchable
- ✅ Interactive formatter working across all locales and currencies
- ✅ SourceBadge opens correct XML snippets from CLDR
- ✅ All tests passing
- ✅ Sidebar navigation enabled
- ✅ Tabbed navigation for organized content

## Success Metrics

1. Page displays data for all 14 supported locales
2. Every currency has working SourceBadge links (displayName, symbol)
3. Interactive formatter produces correct output for any currency
4. Search functionality works smoothly for 300+ currencies
5. No console errors or warnings
6. Tests pass with coverage for new mappings
7. Build size remains under 300KB gzipped

## Implementation Challenges & Solutions

### Challenge: 300+ Currencies
**Solution:**
- Use tab-based organization to avoid overwhelming UI
- Implement search/filter functionality
- Consider virtualization for "All Currencies" tab if needed
- Show major currencies first in dedicated tab

### Challenge: Missing Data
**Solution:**
- Some currencies may have missing data in certain locales
- Handle gracefully with fallbacks
- Show currency code even if displayName is missing

### Challenge: Similar Symbols
**Solution:**
- Currency symbols can be visually similar ($, symbol variants)
- Always include currency code for clarity
- Use clear labels differentiating standard vs narrow symbols

### Challenge: Plural Forms
**Solution:**
- Plural forms vary by locale (one/other/few/many)
- Use Intl.PluralRules API if needed
- Default to "other" form if specific count form unavailable

## Performance Considerations

- **React.memo** - Use for currency cards if needed
- **Search debouncing** - 300ms delay for search input
- **Virtual scrolling** - For "All Currencies" tab if performance issues
- **Tab-based lazy loading** - Only render active tab content
- **Memoization** - Cache filtered/sorted currency lists

## UX Considerations

- Default to user's locale currency in interactive formatter
- Show popular/common currencies first in Major Currencies tab
- Include currency code in all displays for clarity
- Handle edge cases (historical currencies, special codes like XXX)
- Provide clear indication of which currencies are historical vs active

## Related Documentation

- [CLDR Currency Data](https://unicode.org/reports/tr35/tr35-numbers.html#Currencies)
- [Intl.NumberFormat Currency Formatting](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Implementation Plan (active)](../plans/twinkly-seeking-shell.md)

---

**Status:** Plan complete, ready for implementation approval
