# CLDR Navigator

Interactive CLDR (Common Locale Data Repository) data explorer with XML source linking. Every data point in the application links directly to its source XML file in the CLDR GitHub repository.

## Features

- **XML Source Linking**: Every data value has a clickable "Source" button that shows:
  - JSON path in CLDR data
  - XPath expression for XML navigation
  - Direct link to the XML file on GitHub
  - XML snippet with context

- **Number Formatting Demo**: Explore number formatting for any locale
  - Number symbols (decimal, grouping, percent, plus, minus, exponential)
  - Format patterns (decimal, percent, currency, scientific)
  - Interactive number formatter
  - Default numbering systems

- **Locale Selection**: Choose from common locales or recent selections
  - 15+ pre-configured common locales
  - Recent locale history
  - Persistent selection across sessions

## Technology Stack

- **Frontend**: React 18 + TypeScript 5 + Vite 6
- **Routing**: React Router 6
- **State Management**: Zustand (client state) + TanStack Query (server state)
- **Styling**: Tailwind CSS 3
- **Data Source**: CLDR v48.0.0 npm packages
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

- `npm run dev` - Start development server (default: http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run test suite (Vitest in watch mode)
- `npm test -- --run` - Run tests once (CI mode)
- `npm test -- --coverage` - Run tests with coverage report

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Sidebar, Footer, Layout
│   ├── locale/          # LocaleSelector
│   └── source/          # SourceBadge, SourcePanel
├── pages/               # HomePage, NumbersPage
├── lib/
│   ├── cldr/            # CLDR data loading utilities
│   ├── mapping/         # JSON ↔ XPath conversion
│   ├── xml/             # GitHub XML fetching
│   └── github/          # GitHub API client
├── hooks/               # useCldrData, useXmlSource
├── store/               # Zustand locale store
├── types/               # TypeScript type definitions
└── data/                # Generated mappings (future)
```

## How It Works

### Data Loading

1. User selects a locale (e.g., "en-US")
2. Application dynamically imports CLDR JSON data for that locale
3. Data is displayed with format examples
4. TanStack Query caches the data for 24 hours

### XML Source Linking

1. User clicks "Source" button next to any data value
2. Application:
   - Converts JSON path to XPath using precomputed mappings
   - Fetches XML file from GitHub raw URL
   - Extracts relevant XML snippet with context
   - Displays in modal with:
     - JSON path
     - XPath (with copy button)
     - XML file path and line number
     - GitHub link
     - XML snippet

### Mapping Strategy

The application uses a hybrid approach to map JSON paths to XML XPaths:

1. **Precomputed Mappings** (~80% of use cases): Common paths are pre-mapped in `src/lib/mapping/resolver.ts`
2. **Runtime Resolution** (~20% of edge cases): Rule-based transformation for dynamic paths

Example mapping:
```typescript
// JSON path
"numbers.symbols-numberSystem-latn.decimal"

// XPath
"//ldml/numbers/symbols[@numberSystem='latn']/decimal"
```

## Demo Categories

### ✅ Implemented (Phase 1 - MVP)

- **Number Formatting**: Decimal patterns, symbols, grouping, scientific notation

### 🚧 Coming Soon (Phase 2)

- **Dates & Times**: Calendar systems, date/time patterns, month/day names
- **Currencies**: Currency symbols, decimal handling, accounting formats
- **Locale Names**: Language, territory, and script names
- **Plural Rules**: Plural categories and interactive examples

### 🔮 Future (Phase 3+)

- **Units & Measurements**: Length, weight, volume formatting
- **List Formatting**: Conjunction/disjunction patterns
- **Text & Layout**: RTL/LTR, line breaking
- **Data Explorer**: Tree view of full CLDR structure
- **Comparison Mode**: Side-by-side locale comparison
- **Offline Support**: Service Worker for cached data

## Data Sources

- **CLDR Version**: 48.0.0
- **GitHub Repository**: https://github.com/unicode-org/cldr
- **Documentation**: https://cldr.unicode.org/

## Performance

- **Initial Bundle**: ~250kb gzipped
- **Lazy Loading**: Locale data loaded on demand
- **Caching**: 24-hour cache for both CLDR data and XML files
- **LocalStorage**: Persists recent locales and selected locale

## Testing

The project includes comprehensive unit tests for all utility functions:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run with coverage
npm test -- --coverage
```

**Test Coverage:**
- 57 tests across 3 test suites
- Core utilities: XML extraction, JSON-to-XPath mapping, locale normalization
- Critical bug prevention: Ensures XML snippets extract from correct context

See [TESTING_GUIDE.md](./Docs/TESTING_GUIDE.md) for detailed testing documentation.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes, bug fixes, and new features.

**Latest Updates:**
- Phase 1 MVP completed with Number Formatting demo
- Comprehensive test suite with 57 tests
- Fixed critical XML snippet extraction bug
- Organized documentation structure

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

## Contributing

This is an educational project demonstrating CLDR data structure and XML source linking. Future enhancements welcome!

When contributing:
1. Add tests for new features
2. Update [CHANGELOG.md](./CHANGELOG.md) under `[Unreleased]`
3. Follow the existing code style
4. Ensure all tests pass: `npm test -- --run`

See [Docs/](./Docs/) for detailed documentation.

## License

MIT

## Acknowledgments

- [Unicode CLDR Project](https://cldr.unicode.org/) for comprehensive locale data
- [CLDR npm packages](https://github.com/unicode-org/cldr-json) for JSON distribution
