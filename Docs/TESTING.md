# Testing the CLDR Navigator

## Fixes Applied

### 1. Locale Normalization (Initial Fix)
Fixed the locale normalization issue where `en-US` needs to be normalized to `en` to access CLDR data correctly.

### 2. XML Snippet Extraction (Latest Fix)
Fixed the XML snippet extraction to correctly find elements by following the full XPath context. Previously, it would find the first `<pattern>` element (which was in dateFormats) instead of the correct one in the numbers section. Now it:
- Parses the full XPath to identify parent elements with attributes
- Narrows the search scope to within the correct parent element
- Finds the target element within that narrowed context
- Returns the correct line number and XML snippet

## What You Should See Now

When you navigate to the **Numbers** page, you should see:

### 1. Number Symbols Section
With clickable "Source" buttons next to each:
- **Decimal Separator**: `.` (for English)
- **Grouping Separator**: `,` (for English)
- **Percent Sign**: `%`
- **Plus Sign**: `+`
- **Minus Sign**: `-`
- **Exponential**: `E`

### 2. Number Patterns Section
With clickable "Source" buttons next to each:
- **Decimal Format Pattern**: `#,##0.###`
- **Percent Format Pattern**: `#,##0%`
- **Currency Format Pattern**: `¤#,##0.00`
- **Scientific Format Pattern**: `#E0`

### 3. Interactive Formatter
- Input field with example: `1234567.89`
- Three formatted outputs:
  - Decimal: `1,234,567.89`
  - Percent: `1,234,567.89%`
  - Currency (USD): `$1,234,567.89`

### 4. Default Numbering System
At the bottom: `latn` (for English)

## Testing the XML Source Feature

1. Click any **"Source"** button next to a data value
2. A modal should open showing:
   - **JSON Path**: e.g., `main.en.numbers.symbols-numberSystem-latn.decimal`
   - **XPath**: e.g., `//ldml/numbers/symbols[@numberSystem='latn']/decimal`
   - **XML File**: `common/main/en.xml` with line number
   - **"View on GitHub"** button (opens GitHub in new tab)
   - **XML Snippet**: Context around the element

3. Click **"View on GitHub"** to see the actual XML file in the CLDR repository

## Testing Different Locales

Try changing locales in the header dropdown:
- **German (de-DE)**: Decimal separator is `,`, grouping is `.`
- **French (fr-FR)**: Uses different spacing
- **Japanese (ja-JP)**: Different number formatting
- **Arabic (ar-SA)**: RTL text, different symbols

Each locale should show different symbols and patterns with working Source buttons.

## Troubleshooting

If you see a **Debug Info** box (yellow background), it means the data didn't load correctly. The debug info will show:
- Whether data loaded
- Available locale keys
- Whether numbers/symbols objects were found

This helps identify any remaining data loading issues.

## What Changed

**Files Modified:**
- `src/pages/NumbersPage.tsx`: Added `normalizeLocaleForCldr()` to correctly access CLDR data structure
- `src/lib/cldr/loader.ts`: Uses static imports from `locale-data.ts`
- `src/lib/cldr/locale-data.ts`: NEW file with static imports for 14 common locales

**The Fix:**
```typescript
// Before: data?.main?.[selectedLocale]?.numbers  // "en-US" doesn't exist
// After:  data?.main?.[normalizedLocale]?.numbers  // "en" exists ✓
```
