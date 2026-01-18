# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Currency Demo Page** (2026-01-17)
  - Comprehensive currency localization demo at `/currency`
  - Four-tab navigation: Overview, Major Currencies, All Currencies, Try It Yourself
  - **300+ currency codes** from CLDR (modern, historical, and special currencies)
  - Currency symbols, display names, and format patterns for all locales
  - **Standard and accounting format patterns** with live examples
  - Interactive currency formatter with amount and currency selection
  - Searchable currency list with real-time filtering
  - Major world currencies section (24 most common: USD, EUR, GBP, JPY, etc.)
  - Full SourceBadge integration for all currency data points
  - Responsive grid layouts (1-3 columns based on screen size)
  - Files: `src/pages/CurrencyPage.tsx`

- **Dynamic Currency XPath Mapping** (2026-01-17)
  - Enhanced `transformJsonPathToXPath()` to handle currency paths dynamically
  - Pattern: `numbers.currencies.<CODE>.<field>` → `//ldml/numbers/currencies/currency[@type='<CODE>']/<field>`
  - Supports currency display names: `currencies.USD.displayName`
  - Supports currency symbols: `currencies.EUR.symbol`
  - Supports plural forms: `currencies.GBP.displayName-count-one` → `displayName[@count='one']`
  - Supports symbol variants: `currencies.USD.symbol-alt-narrow` → `symbol[@alt='narrow']`
  - No precomputed mappings needed - generates XPaths on-the-fly for all 300+ currencies
  - Files: `src/lib/mapping/resolver.ts`

- **Currency XPath Mapping Tests** (2026-01-17)
  - 8 new comprehensive tests for currency XPath generation
  - Tests cover display names, symbols, plural forms, and symbol variants
  - Verifies correct XPath generation for multiple currency codes
  - All 107 tests passing (up from 99)
  - Files: `src/lib/mapping/__tests__/resolver.test.ts`

- **Native CLDR Skeleton Pattern Formatter** (2026-01-17)
  - Implemented lightweight skeleton pattern parser using native `Intl.DateTimeFormat`
  - **Full support for flexible day periods (field 'B')** via `dayPeriod: 'long'` option
  - Zero external dependencies - removed @formatjs packages completely
  - **Bundle size reduction: 32.5 KB gzipped** (from 323.39 KB to 290.86 KB)
  - Supports all major CLDR field symbols: G, y, M, L, d, E, e, c, a, b, B, h, H, K, k, m, s, S, z, Z, v, V
  - Automatic filtering of unsupported patterns (Quarter Q/q, Week w/W)
  - 14 comprehensive tests with 100% coverage
  - Documentation: `Docs/NATIVE-SKELETON-IMPLEMENTATION.md` with complete ICU4X investigation
  - Files: `src/lib/cldr/skeletonFormatter.ts`

- **Comprehensive CLDR Research Documentation** (2026-01-17)
  - Complete investigation of ICU4X source code proving 'B' field limitation
  - Detailed UTS 35 skeleton matching algorithm documentation
  - Semantic skeletons specification and field equivalence rules
  - Field symbol reference table with all UTS 35 symbols
  - Empirical testing with zh-Hant locale proving native solution superiority
  - Documentation: `Docs/NATIVE-SKELETON-IMPLEMENTATION.md`

### Changed
- **Dates & Times Page Tab Reorganization** (2026-01-17)
  - Renamed "Overview" tab to "Standard Formats" for clarity
  - Improved tab structure: Standard Formats, Months & Days, Available Formats, Intervals
  - All tabs use native skeleton formatter for consistent formatting

- **Unsupported Pattern Filtering** (2026-01-17)
  - Available Formats tab now filters out patterns with Quarter (Q, q) and Week (w, W) fields
  - Prevents misleading partial output for unsupported patterns
  - Users only see patterns that work correctly with native Intl
  - Examples filtered: `MMMMW-count-other`, `yw`, `yQQQ`, `Qq`

### Fixed
- **Dynamic XPath Mapping for Available Formats and Intervals** (2026-01-17)
  - Issue: Source badges for available formats (e.g., `Bh`, `d`, `yMd`) showed "Element not found"
  - Issue: Source badges for interval formats showed "Element not found"
  - Root cause: No XPath mappings existed for ~65 availableFormats and ~40 intervalFormats
  - Fix: Enhanced `transformJsonPathToXPath()` to dynamically generate XPath for:
    - `availableFormats.<id>` → `availableFormats/dateFormatItem[@id='<id>']`
    - `intervalFormats.<id>` → `intervalFormats/intervalFormatItem[@id='<id>']`
    - `intervalFormats.<id>.<diff>` → `intervalFormatItem[@id='<id>']/greatestDifference[@id='<diff>']`
    - Special handling for `calendar[@type='gregorian']` context
  - Added 12 new tests for dynamic mapping scenarios
  - Impact: All available formats and interval formats now have working source links
  - Total test count increased from 88 to 100 tests

- **Enhanced Dates Page with Tabs** (2026-01-17)
  - Reorganized into 4 tabs: Standard Formats, Months & Days, Available Formats, Intervals
  - **Standard Formats tab**: Date/time formats with interactive formatter
  - **Months & Days tab**: Month names, day names, day periods (AM/PM)
  - **Available Formats tab**: ~50 supported skeleton patterns with live examples
  - **Intervals tab**: Date range patterns with dual date picker
  - All skeleton patterns use native formatter with proper flexible day period support
  - Unsupported patterns (Quarter, Week fields) automatically filtered
  - Interactive "Try It Yourself" sections in all tabs
  - Full SourceBadge integration on all data points

- **Dates & Times Demo Page** (2026-01-17)
  - Full implementation of date/time localization demo at `/dates`
  - Month names display (wide and abbreviated formats)
  - Day names display (wide and abbreviated formats)
  - Date format patterns (full, long, medium, short) with live examples
  - Time format patterns (full, long, medium, short) with live examples
  - Day periods section (AM, PM, midnight, noon)
  - Interactive date/time formatter with datetime-local input
  - All data points linked to CLDR XML sources via SourceBadge
  - Responsive grid layout matching NumbersPage design
  - User note explaining Gregorian calendar focus
  - **48 new XPath mappings** for date/time data structures
  - TypeScript type definitions for `dayPeriods` and `eras`
  - Navigation enabled in sidebar (removed "Soon" badge)
  - Routing configured in App.tsx

- **Comprehensive Test Coverage for Calendar Disambiguation** (2026-01-17)
  - 7 new regression tests specifically for multi-calendar XML files
  - Tests verify Gregorian vs Chinese calendar data extraction
  - Tests ensure different calendars return different line numbers
  - Total test count increased from 72 to 79 tests
  - Documentation: `Docs/BUG-FIX-CALENDAR-XPATH.md`

- **PROJECT-STATUS.md** - Comprehensive project status tracking document
  - Current status: Phase 1 MVP complete
  - Detailed roadmap for Phase 2 (Dates, Currency, Locale Names demos)
  - Future plans for Phase 3 (Advanced features)
  - Technical debt tracking
  - Release planning
  - Development workflow guide

### Fixed
- **Calendar XPath Disambiguation Bug** (2026-01-17)
  - Issue: Month/day name source badges showed Chinese calendar data instead of Gregorian
  - Symptom: Clicking "January" source showed "First Month" (Chinese calendar)
  - Root cause: `extractXmlSnippet` searched backwards (leaf→root), finding first occurrence
  - Chinese calendar appears at ~line 1816, Gregorian at ~line 2437 in CLDR XML
  - Fix: Changed search direction to forward (root→leaf) in `src/lib/xml/fetcher.ts`
  - Algorithm now:
    1. Starts from root of XPath
    2. Finds `calendar[@type='gregorian']` first
    3. Narrows scope to within that calendar's closing tag
    4. Then searches for child elements only within correct calendar
  - Impact: All date/time source links now correctly point to Gregorian calendar data
  - Verification: 7 new regression tests ensure bug won't recur
  - Line numbers now accurately reflect calendar-specific data locations

- **Number Format Pattern Extraction** (2026-01-17)
  - Issue: All format types (decimal, percent, currency, scientific) pointed to the same XML line (decimal pattern)
  - Root cause: XML extraction algorithm stopped narrowing scope after finding first parent match
  - Fix: Updated extraction algorithm to continue narrowing through ALL parent levels
  - Algorithm now:
    1. Includes all XPath elements (not just first few)
    2. Progressively narrows scope through each parent level
    3. Finds target element only within fully narrowed context
  - Impact: Each format type now correctly points to its unique pattern element
  - Test coverage: Added 5 regression tests to verify all format types return different line numbers

### Added
- Initial project setup with Vite 6, React 18, and TypeScript 5
- Tailwind CSS 3 with custom theme for styling
- TanStack Query v5 for server state management with 24-hour caching
- Zustand for client state (locale selection and recent history)
- React Router 6 for navigation

#### Core Features
- **CLDR Data Loading System**
  - Dynamic data loading for 14 common locales (en, de, fr, es, it, ja, zh-Hans, ko, ar, ru, pt, hi, tr, pl)
  - Static imports via `locale-data.ts` for reliable bundling
  - Locale normalization logic (`en-US` → `en`, preserves `zh-Hans`)
  - Caching system to avoid redundant data loads

- **XML Source Linking**
  - JSON path to XPath conversion with precomputed mappings
  - Context-aware XML snippet extraction from GitHub
  - Direct links to CLDR XML files in GitHub repository
  - Line number tracking for precise source location
  - Copy-to-clipboard functionality for XPath expressions

- **Number Formatting Demo** (Phase 1 MVP)
  - Display of number symbols (decimal, grouping, percent, plus, minus, exponential)
  - Number format patterns (decimal, percent, currency, scientific)
  - Interactive number formatter with live examples
  - Default numbering system display
  - Source buttons on every data point linking to XML

- **Currency Formatting Demo** (Phase 2)
  - 300+ currency codes from CLDR (modern, historical, special)
  - Currency symbols and display names for all locales
  - Standard and accounting format patterns
  - Interactive currency formatter with search
  - Source buttons on every data point
  - 4-tab navigation structure

#### UI Components
- Responsive layout with header, sidebar, and footer
- Locale selector with 15 common locales and recent history
- Source badge component for clickable source links
- Source panel modal with:
  - JSON path display
  - XPath expression with copy button
  - XML file path and line number
  - GitHub web URL link
  - Syntax-highlighted XML snippet with context

#### Testing Infrastructure
- Vitest test runner with jsdom environment
- 107 comprehensive unit tests across 4 test suites
- Test coverage for:
  - XML snippet extraction (29 tests, including 7 calendar regression tests)
  - JSON-to-XPath mapping (49 tests, including date/time and currency mappings)
  - Locale normalization (17 tests)
  - Skeleton formatter (12 tests, including unsupported pattern detection)
- Test scripts: `test`, `test:run`, `test:coverage`, `test:ui`
- Verification script for full CI/CD pipeline
- Testing documentation and guides

#### Documentation
- Comprehensive README.md with project overview
- `Docs/` folder with organized documentation:
  - TESTING_GUIDE.md - Complete testing documentation
  - TEST_STRUCTURE.md - Test organization overview
  - TESTING.md - Testing notes and fixes
  - implementation-plan.md - Original implementation plan
  - README.md - Documentation index
- CHANGELOG.md (this file)

### Fixed
- **Locale Normalization Bug** (2026-01-17)
  - Issue: CLDR data uses normalized locale codes (`en`) but app was using full codes (`en-US`)
  - Fix: Added `normalizeLocaleForCldr()` function usage in NumbersPage
  - Impact: Number symbols and patterns now display correctly for all locales

- **XML Snippet Extraction Bug** (2026-01-17)
  - Issue: Searching for decimal format pattern returned date format pattern from wrong section
  - Root cause: Simple element name search found first `<pattern>` element (in dates section)
  - Fix: Implemented context-aware extraction that follows full XPath path
  - Algorithm now:
    1. Parses full XPath to identify parent elements with attributes
    2. Narrows search scope to within correct parent element
    3. Finds target element only within that context
  - Impact: All source links now point to correct XML elements
  - Verified with 17 unit tests including critical regression test

### Changed
- Moved all documentation except README.md to `Docs/` folder for better organization
- Updated internal documentation cross-references to reflect new structure
- Package.json organized with dependencies in correct sections

### Technical Details

#### Technology Stack
- **Frontend**: React 18.3.1, TypeScript 5.7.2
- **Build Tool**: Vite 6.0.5
- **Routing**: React Router 6.27.0
- **State Management**:
  - Zustand 5.0.1 (client state)
  - TanStack Query 5.62.0 (server state)
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI primitives, Lucide React icons
- **Data Source**: CLDR 48.0.0 packages
- **Testing**: Vitest 2.1.8, Testing Library, jsdom

#### Bundle Size
- Production bundle: ~1.25MB (290.83KB gzipped)
- Initial load: 290.83KB gzipped
- Target met: < 300KB ✓ (plan specified < 300KB)
- **32.5 KB reduction** from native implementation vs @formatjs approach

#### Performance
- TanStack Query: 24-hour cache for CLDR data
- LocalStorage: Persists top 10 recent locales
- Lazy loading: Locale data loaded on demand
- Build time: ~1.8 seconds

#### Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Target: ES2020+

### Known Issues
- Only 14 common locales currently supported (out of 500+ in CLDR)
  - Future: Add dynamic import support for all locales
- Date/time demo only supports Gregorian calendar
  - CLDR includes Chinese, Hebrew, Islamic, and other calendars
  - Future: Add calendar selector UI
- Locale names and plural rules demos not yet implemented
  - Planned for Phase 2
- No comparison mode yet
  - Side-by-side locale comparison planned for Phase 2
- Some CLDR skeleton patterns not supported by native Intl
  - Quarter fields (Q, q) and Week fields (w, W) are filtered out
  - These require custom calendar calculations not provided by Intl
  - ~50 of ~65 available formats work (77% coverage)

### Dependencies

#### Production Dependencies
```json
{
  "@tanstack/react-query": "^5.62.0",
  "cldr-core": "^48.0.0",
  "cldr-dates-full": "^48.0.0",
  "cldr-localenames-full": "^48.0.0",
  "cldr-misc-full": "^48.0.0",
  "cldr-numbers-full": "^48.0.0",
  "lucide-react": "^0.469.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.27.0",
  "zustand": "^5.0.1"
}
```

#### Development Dependencies
```json
{
  "@radix-ui/react-dialog": "^1.1.4",
  "@radix-ui/react-dropdown-menu": "^2.1.4",
  "@radix-ui/react-select": "^2.1.4",
  "@testing-library/jest-dom": "^6.x",
  "@testing-library/react": "^16.1.0",
  "@vitejs/plugin-react": "^4.3.4",
  "autoprefixer": "^10.4.20",
  "eslint": "^9.16.0",
  "globals": "^17.0.0",
  "jsdom": "^24.x",
  "playwright": "^1.49.1",
  "postcss": "^8.4.49",
  "tailwindcss": "^3.4.17",
  "typescript": "^5.7.2",
  "vite": "^6.0.5",
  "vitest": "^2.1.8"
}
```

## [0.0.1] - 2026-01-17

### Initial Development
- Project initialization
- Phase 1 MVP implementation complete
- Core infrastructure established
- First working demo (Number Formatting)

---

## Future Releases

### [0.1.0] - Planned (Phase 2)
- ✅ Dates & Times demo (Gregorian calendar)
- ✅ Currency demo (300+ currencies)
- Calendar selector (Chinese, Hebrew, Islamic, etc.)
- Available formats and interval formats for dates
- Locale names demo
- Comparison mode (side-by-side locales)
- Enhanced XML viewer with syntax highlighting

### [0.2.0] - Planned (Phase 3)
- Data Explorer with tree view
- Search and filter functionality
- Dark mode support
- Offline support with Service Worker
- Performance optimizations

### [1.0.0] - Planned
- All demo categories complete
- Full CLDR coverage (500+ locales)
- Production-ready deployment
- Complete documentation
- Accessibility audit passed

---

## Contributing

When making changes:
1. Update this CHANGELOG under `[Unreleased]`
2. Follow [Keep a Changelog](https://keepachangelog.com/) format
3. Use categories: Added, Changed, Deprecated, Removed, Fixed, Security
4. Write clear, user-focused descriptions
5. Include issue/PR numbers when applicable

## Release Process

1. Update version in `package.json`
2. Move `[Unreleased]` changes to new `[X.Y.Z]` section
3. Add release date
4. Create git tag: `git tag -a vX.Y.Z -m "Release X.Y.Z"`
5. Push tag: `git push origin vX.Y.Z`
6. Create GitHub release with changelog excerpt
