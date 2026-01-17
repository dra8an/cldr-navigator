# CLDR Navigator Documentation

This folder contains all project documentation.

## Documentation Files

### Testing Documentation

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive guide to testing
  - How to run tests
  - Writing new tests
  - Test philosophy and best practices
  - Coverage reports
  - Debugging tips

- **[TEST_STRUCTURE.md](./TEST_STRUCTURE.md)** - Quick reference overview
  - What tests exist
  - Test file organization
  - Quick start commands
  - Test statistics

- **[TESTING.md](./TESTING.md)** - Testing notes and fixes applied
  - Locale normalization fix
  - XML snippet extraction fix
  - What you should see when testing

### Implementation Documentation

- **[implementation-plan.md](./implementation-plan.md)** - Original implementation plan
  - Technology stack decisions
  - Architecture overview
  - Phase-by-phase development plan
  - Feature breakdown
  - Risk mitigation

## Quick Links

### Running Tests
```bash
# Watch mode
npm test

# Run once
npm test:run

# With coverage
npm test:coverage

# Full verification
npm run verify
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Main README

See the [main README](../README.md) in the project root for:
- Getting started
- Project overview
- Installation instructions
- Usage guide
