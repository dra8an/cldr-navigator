# CLDR Navigator - Implementation Plan

## Overview

Build a React-based web application that demonstrates CLDR (Common Locale Data Repository) locale data with direct XML source linking. Every data point displayed will link back to its source XML file in the CLDR repository.

## Technology Stack

**Core Framework:**
- Vite 6.x + React 18.x + TypeScript 5.x
- React Router 6.x for routing
- Tailwind CSS 3.x + Radix UI (accessible components)

**State Management:**
- TanStack Query v5 (server state, GitHub API caching)
- Zustand (client state: locale selection, UI preferences)

**CLDR Data:**
- npm packages: `cldr-core`, `cldr-numbers-full`, `cldr-dates-full`, `cldr-localenames-full`, `cldr-misc-full`
- Lazy-loaded per locale to optimize bundle size

**Why this stack:**
- Vite: 10-20x faster than CRA, excellent tree-shaking
- TanStack Query: Built-in caching/deduplication for GitHub API calls
- Zustand: Lightweight state management (vs Redux overhead)
- Tailwind: Small bundle (~10kb vs Material-UI's ~300kb)

## Architecture

### Project Structure

```
cldr-navigator/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Sidebar, Footer
│   │   ├── demos/           # NumberDemo, DateDemo, CurrencyDemo, etc.
│   │   ├── source/          # XML source linking
│   │   │   ├── SourceBadge.tsx      # Click to show source
│   │   │   ├── SourcePanel.tsx      # Expandable panel with XML/XPath
│   │   │   ├── XmlViewer.tsx        # Syntax-highlighted XML
│   │   │   └── DataExplorer.tsx     # Browse XML tree structure
│   │   ├── locale/          # LocaleSelector, LocaleComparison
│   │   └── ui/              # Reusable primitives
│   ├── pages/               # HomePage, NumbersPage, DatesPage, etc.
│   ├── lib/
│   │   ├── cldr/            # CLDR JSON data loading
│   │   ├── mapping/         # JSON ↔ XML path conversion
│   │   ├── xml/             # GitHub XML fetching
│   │   └── github/          # GitHub API client
│   ├── hooks/               # useCldrData, useXmlSource, useMapping
│   ├── store/               # localeStore (Zustand)
│   ├── data/                # Generated mappings
│   └── types/               # TypeScript definitions
├── scripts/
│   └── generate-mappings.ts # Build-time mapping generation
└── vite.config.ts
```

### Data Flow

1. User selects locale (e.g., "en-US") → Zustand store
2. Component requests CLDR data → `useCldrData` hook
3. Dynamic import: `cldr-numbers-full/main/en/numbers.json`
4. TanStack Query caches result
5. User clicks "View Source" badge → `useXmlSource` hook
6. Fetch XML from GitHub: `https://raw.githubusercontent.com/unicode-org/cldr/main/common/main/en.xml`
7. Display in SourcePanel with XPath

## Core Challenge: JSON-to-XML Mapping

**Problem:** CLDR JSON paths like `main.en.numbers.decimalFormats-numberSystem-latn.standard` must map to XML XPath like `//numbers/decimalFormats[@numberSystem='latn']/decimalFormatLength/decimalFormat/pattern`

**Solution: Hybrid Approach**

### 1. Build-time Mapping Generation

Generate precomputed mappings for common paths (95% of use cases):

```typescript
// scripts/generate-mappings.ts
// Analyzes CLDR JSON structure and generates:
{
  "numbers.decimalFormats-numberSystem-latn.standard": {
    "xpath": "//numbers/decimalFormats[@numberSystem='latn']/decimalFormatLength/decimalFormat/pattern",
    "xmlFile": "common/main/{locale}.xml"
  },
  // ... thousands more mappings
}
```

**Benefits:**
- O(1) lookup for common paths
- Catches mapping errors at build time
- ~50kb added to bundle

### 2. Runtime Resolution (Fallback)

For dynamic/edge case paths, apply transformation rules:

```typescript
// lib/mapping/resolver.ts
function resolveXPath(jsonPath: string): string {
  // 1. Check precomputed mappings
  const cached = mappings[jsonPath];
  if (cached) return cached.xpath;

  // 2. Apply rules: "element-attr-value" → "element[@attr='value']"
  return transformJsonPathToXPath(jsonPath);
}
```

**Transformation Rules:**
- `decimalFormats-numberSystem-latn` → `decimalFormats[@numberSystem='latn']`
- Multiple attributes: chain with `and`
- Non-distinguishing attributes (prefixed `_`): ignore

### 3. XML Fetching Strategy

**Source:** GitHub raw URLs (no rate limits)
```
https://raw.githubusercontent.com/unicode-org/cldr/main/common/main/en.xml
```

**Caching:**
- TanStack Query: 24hr in-memory cache
- LocalStorage: Persist top 10 locales
- Future: Service Worker for offline

## Implementation Phases

### Phase 1: Foundation & MVP (Week 1-2)

**Goal:** Basic app with one working demo + XML source linking

**Tasks:**
1. Project setup
   - Initialize Vite + React + TypeScript
   - Configure Tailwind, ESLint, Prettier
   - Install dependencies

2. Core infrastructure
   - CLDR data loader (`lib/cldr/loader.ts`)
   - GitHub XML fetcher (`lib/xml/fetcher.ts`)
   - Basic mapping resolver (`lib/mapping/resolver.ts`)
   - Zustand locale store
   - TanStack Query setup

3. UI foundation
   - Layout (header, sidebar, footer)
   - Locale selector dropdown
   - Basic routing

4. **First Demo: Number Formatting**
   - Display decimal format patterns
   - SourceBadge component (📄 icon)
   - SourcePanel (shows XPath, GitHub link, XML snippet)
   - Interactive: format custom numbers

**Deliverable:** Working app showing English number formats with XML source links

**Critical Files:**
- `src/lib/mapping/resolver.ts` - JSON→XPath conversion
- `src/lib/cldr/loader.ts` - Dynamic CLDR imports
- `src/hooks/useXmlSource.ts` - XML fetching with caching
- `src/components/source/SourcePanel.tsx` - Source display UI

### Phase 2: Core Features (Week 3-4)

**Goal:** All major demo categories + comparison mode

**Tasks:**
1. Remaining demos
   - Date/time formatting (calendars, patterns)
   - Currency formatting (symbols, display)
   - Language/territory names
   - Plural rules demonstration

2. Comparison mode
   - Side-by-side locale comparison
   - Diff highlighting

3. Enhanced XML integration
   - Build-time mapping generation script
   - XmlViewer with syntax highlighting
   - Copy XPath/XML buttons

4. Educational content
   - Explanations for each demo type
   - Links to CLDR documentation
   - Tooltips

**Deliverable:** Full-featured demo site

### Phase 3: Data Explorer & Polish (Week 5)

**Goal:** Advanced features + production readiness

**Tasks:**
1. Data Explorer
   - Tree view of CLDR JSON structure
   - Search/filter
   - Live XPath preview

2. Performance
   - Code splitting analysis
   - Bundle size optimization
   - Lazy loading

3. UX polish
   - Loading states, error boundaries
   - Mobile responsive
   - Dark mode
   - Keyboard navigation

4. Documentation
   - README with screenshots
   - Architecture docs

**Deliverable:** Production-ready app

### Phase 4: Advanced Features (Optional)

- Units & measurements demo
- List formatting demo
- RTL/LTR text visualization
- Locale inheritance tree
- Download data as JSON/XML
- Share links
- Service Worker for offline

## Feature Breakdown

### Demo Categories

1. **Number Formatting**
   - Decimal patterns (#,##0.###)
   - Grouping separators
   - Numbering systems (latn, arab, hebr)
   - Scientific notation

2. **Date & Time Formatting**
   - Calendar systems (Gregorian, Islamic, Hebrew, etc.)
   - Date patterns (short, medium, long, full)
   - Month/day names (wide, abbreviated, narrow)
   - Time zones

3. **Currency Formatting**
   - Currency symbols ($, €, ¥)
   - Decimal handling
   - Symbol placement
   - Accounting format

4. **Language & Territory Names**
   - Language display names
   - Territory/region names
   - Script names
   - Translations across locales

5. **Plural Rules**
   - Plural categories (zero, one, two, few, many, other)
   - Interactive: enter number, see category
   - Language-specific rules

6. **Units & Measurements**
   - Length, weight, volume
   - Unit preferences by region
   - Narrow/short/long forms

7. **Text & Layout**
   - RTL vs LTR
   - Character order
   - Line breaking rules

8. **List Formatting**
   - Conjunction: "A, B, and C"
   - Disjunction: "A, B, or C"
   - Locale-specific patterns

### UI Components

**SourceBadge** - Clickable icon (📄) next to data values
```tsx
<DataWithSource
  value="1,234.56"
  jsonPath="numbers.decimalFormats-numberSystem-latn.standard"
  locale="en"
/>
```

**SourcePanel** - Expandable panel showing:
- JSON path
- XPath expression (copy button)
- XML file path
- GitHub URL (clickable)
- XML snippet (syntax highlighted)
- Line number

**DataExplorer** - Tree browser:
- Navigate CLDR JSON structure
- Click any value → show source
- Search by path
- Filter by category

**LocaleSelector** - Searchable dropdown:
- Autocomplete
- Grouped by script/region
- Recently used locales
- Comparison mode toggle

**ComparisonPanel** - Side-by-side view:
- Synchronized demo inputs
- Highlight differences
- Compare 2-4 locales

## Deployment

**Platform:** Vercel (recommended)
- Zero-config deployment
- GitHub integration
- Fast edge network
- Free tier sufficient

**Alternatives:** Netlify, GitHub Pages, Cloudflare Pages

**Build Process:**
```bash
npm run build              # Vite production build
npm run generate-mappings  # Generate JSON→XML mappings
npm run preview            # Test production build
```

**Performance Budget:**
- Initial load: < 300kb (gzipped)
- Time to Interactive: < 3s (3G)
- Lighthouse score: > 90

**CI/CD:** GitHub Actions
- Run tests
- Build app
- Deploy to Vercel on push to main

## Testing Strategy

**Unit Tests (Vitest):**
- Mapping resolver logic
- XPath builder
- Data transformations
- Target: 80% coverage

**Component Tests (React Testing Library):**
- Locale selector
- Source panel interactions
- Demo workflows

**E2E Tests (Playwright):**
- Select locale → View demo → Click source → See XML
- Comparison mode
- Data explorer navigation

**Manual Testing:**
- Cross-browser (Chrome, Firefox, Safari)
- Mobile devices
- Accessibility audit (aXe DevTools)

## Key Decisions & Trade-offs

### 1. Hybrid Mapping (Build-time + Runtime)

**Decision:** 80% precomputed, 20% runtime generation

**Trade-offs:**
- ✅ Fast O(1) lookup for common paths
- ✅ Graceful fallback for edge cases
- ⚠️ +50kb bundle size for mappings
- ⚠️ Build complexity

### 2. Lazy Load Locale Data

**Decision:** Load only selected locales, not all upfront

**Trade-offs:**
- ✅ Small initial bundle (~200kb)
- ✅ Fast first paint
- ⚠️ Network request when switching locales
- ⚠️ Not offline without Service Worker

### 3. GitHub API for XML

**Decision:** Fetch on-demand from raw.githubusercontent.com

**Trade-offs:**
- ✅ Always shows latest CLDR
- ✅ No build-time XML processing
- ⚠️ Requires internet connection
- ⚠️ Potential (rare) rate limiting

**Alternative Considered:** Bundle XML files
- Would add ~200MB to repo
- Slower git operations
- Stale data

## Risk Mitigation

**Risk: GitHub Rate Limiting**
- Use raw.githubusercontent.com (no API limits)
- 24hr cache in TanStack Query
- LocalStorage persistence
- User message if limit hit

**Risk: CLDR Schema Changes**
- Pin package versions (48.0.0)
- Build-time validation
- Comprehensive tests
- Documented upgrade process

**Risk: Large Bundle**
- Lazy load locale data
- Route-based code splitting
- Tree-shaking with Vite
- Monitor in CI

**Risk: Browser Compatibility**
- Target ES2020+ (modern browsers)
- Optional polyfills
- Progressive enhancement
- Browserstack testing

## Success Metrics

**Technical:**
- Initial load < 300kb
- Lighthouse > 90
- Test coverage > 80%
- Zero accessibility violations

**UX:**
- Find XML source in < 3 clicks
- Clear comparison mode
- Educational content helpful
- Mobile usable

**Educational Value:**
- Explains CLDR concepts clearly
- Links to official docs
- Shows real-world examples
- Demonstrates locale differences

## Verification Plan

After implementation, verify:

1. **Core Functionality:**
   - [ ] Select locale "de-DE"
   - [ ] Navigate to Numbers page
   - [ ] See decimal format: "1.234.567,89"
   - [ ] Click source badge
   - [ ] Panel shows XPath: `//numbers/decimalFormats[@numberSystem='latn']...`
   - [ ] Click GitHub link → Opens `common/main/de.xml` at correct line
   - [ ] XML snippet visible

2. **Comparison Mode:**
   - [ ] Enable comparison mode
   - [ ] Select "en-US" vs "ja-JP"
   - [ ] Both formats display side-by-side
   - [ ] Differences highlighted
   - [ ] Both source links work

3. **Data Explorer:**
   - [ ] Navigate to Data Explorer
   - [ ] Browse JSON tree structure
   - [ ] Search for "currency"
   - [ ] Click USD symbol → shows source

4. **Performance:**
   - [ ] Run Lighthouse audit
   - [ ] Check bundle size (should be < 300kb initial)
   - [ ] Test on 3G throttling
   - [ ] Verify lazy loading works

5. **Accessibility:**
   - [ ] Run aXe DevTools scan
   - [ ] Test keyboard navigation
   - [ ] Verify screen reader compatibility

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0",
    "@tanstack/react-query": "^5.62.0",
    "zustand": "^5.0.1",
    "cldr-core": "^48.0.0",
    "cldr-numbers-full": "^48.0.0",
    "cldr-dates-full": "^48.0.0",
    "cldr-localenames-full": "^48.0.0",
    "cldr-misc-full": "^48.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.5",
    "typescript": "^5.7.2",
    "tailwindcss": "^3.4.17",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-select": "^2.1.4",
    "lucide-react": "^0.469.0",
    "vitest": "^2.1.8",
    "@testing-library/react": "^16.1.0",
    "playwright": "^1.49.1"
  }
}
```

## Next Steps

1. Get user approval for this plan
2. Initialize project with Vite + React + TypeScript
3. Set up project structure
4. Implement Phase 1: Foundation & MVP
5. Deploy preview to Vercel for feedback
6. Iterate on remaining phases

---

**Estimated Timeline:** 5-6 weeks for full implementation (Phases 1-3)

**MVP Timeline:** 1-2 weeks (Phase 1 only)
