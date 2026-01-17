# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- 57 comprehensive unit tests across 3 test suites
- Test coverage for:
  - XML snippet extraction (17 tests)
  - JSON-to-XPath mapping (23 tests)
  - Locale normalization (17 tests)
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
- Production bundle: ~1.2MB (286KB gzipped)
- Initial load: 286KB gzipped
- Target met: < 300KB (plan specified < 300KB)

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
- Dates, currencies, and other demos not yet implemented
  - Planned for Phase 2
- No comparison mode yet
  - Planned for Phase 2

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
- Dates & Times demo
- Currency demo
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
