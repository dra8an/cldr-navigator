# Testing Guide

## Overview

CLDR Navigator uses **Vitest** as the test runner with **@testing-library/react** for component testing. The test suite ensures that core utility functions work correctly, particularly the critical XML-to-JSON mapping and extraction logic.

## Test Structure

```
src/
├── lib/
│   ├── cldr/
│   │   ├── __tests__/
│   │   │   └── loader.test.ts          # CLDR data loading & locale normalization
│   │   └── loader.ts
│   ├── mapping/
│   │   ├── __tests__/
│   │   │   └── resolver.test.ts        # JSON path to XPath conversion
│   │   └── resolver.ts
│   └── xml/
│       ├── __tests__/
│       │   └── fetcher.test.ts         # XML extraction & GitHub URL building
│       └── fetcher.ts
└── test/
    └── setup.ts                         # Global test configuration
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (default)
```bash
npm test
```
Vitest runs in watch mode by default. Press `q` to quit.

### Run tests once (CI mode)
```bash
npm test -- --run
```

### Run specific test file
```bash
npm test -- src/lib/xml/__tests__/fetcher.test.ts
```

### Run tests with coverage
```bash
npm test -- --coverage
```

## Test Coverage

### Current Test Statistics
- **Total Tests**: 57
- **Test Files**: 3
- **Coverage**: Core utility functions

### What's Tested

#### 1. XML Fetcher (`src/lib/xml/__tests__/fetcher.test.ts`)
**17 tests** covering:
- ✅ Locale XML path construction
- ✅ GitHub raw URL generation
- ✅ GitHub web URL generation (with line numbers)
- ✅ **Context-aware XML snippet extraction** (the critical feature!)
  - Correctly finds elements within their parent context
  - Doesn't confuse date patterns with number patterns
  - Handles attributes like `[@numberSystem='latn']`
  - Provides context lines around target elements
- ✅ Edge case handling (non-existent elements, invalid XPath)

**Key Test**: Verifies that searching for `//ldml/numbers/decimalFormats[@numberSystem='latn']/.../pattern` finds the **number pattern** and NOT the **date pattern**, even though both have `<pattern>` elements.

#### 2. Mapping Resolver (`src/lib/mapping/__tests__/resolver.test.ts`)
**23 tests** covering:
- ✅ JSON path to XPath conversion
- ✅ Building JSON paths from components
- ✅ Checking if precomputed mappings exist
- ✅ Retrieving available mappings
- ✅ Attribute transformation (`element-attr-value` → `element[@attr='value']`)
- ✅ Locale normalization in XML paths

**Example Tests**:
```typescript
// Verifies: 'numbers.symbols-numberSystem-latn.decimal'
//        → "//ldml/numbers/symbols[@numberSystem='latn']/decimal"

// Verifies: 'en-US' → 'common/main/en.xml'
```

#### 3. CLDR Loader (`src/lib/cldr/__tests__/loader.test.ts`)
**17 tests** covering:
- ✅ Locale normalization logic
  - `en-US` → `en`
  - `zh-Hans-CN` → `zh-Hans` (preserves script)
  - `de-DE` → `de`
- ✅ Nested value extraction from CLDR data
- ✅ Edge cases (empty paths, non-existent data)

**Key Tests**:
```typescript
// Verifies locale normalization rules
normalizeLocaleForCldr('en-US')       // → 'en'
normalizeLocaleForCldr('zh-Hans-CN')  // → 'zh-Hans'
normalizeLocaleForCldr('sr-Latn-RS')  // → 'sr-Latn'

// Verifies data extraction
getCldrValue(data, 'main.en.numbers.symbols-numberSystem-latn.decimal')
```

## Test Philosophy

### What We Test
- **Utility functions with deterministic outputs**: Pure functions that transform data
- **Critical path logic**: The XML extraction algorithm that powers source linking
- **Edge cases**: Invalid inputs, missing data, malformed paths

### What We Don't Test (Yet)
- React components (would require more setup)
- API calls (mocked in future)
- Integration tests (end-to-end user flows)

## Writing New Tests

### Test File Template
```typescript
import { describe, it, expect } from 'vitest'
import { yourFunction } from '../yourModule'

describe('Your Module', () => {
  describe('yourFunction', () => {
    it('should do the expected thing', () => {
      const result = yourFunction('input')
      expect(result).toBe('expected output')
    })

    it('should handle edge cases', () => {
      const result = yourFunction('')
      expect(result).toBeUndefined()
    })
  })
})
```

### Best Practices
1. **Descriptive test names**: Use `should` statements
   ```typescript
   it('should normalize en-US to en', () => { ... })
   ```

2. **Arrange-Act-Assert pattern**:
   ```typescript
   // Arrange: Set up test data
   const input = 'en-US'

   // Act: Call the function
   const result = normalizeLocaleForCldr(input)

   // Assert: Check the result
   expect(result).toBe('en')
   ```

3. **Test one thing per test**: Keep tests focused
4. **Use descriptive assertions**: Make failures clear
5. **Group related tests**: Use `describe` blocks

### Adding Tests for New Features

When you add a new utility function:

1. Create a `__tests__` directory next to the module
2. Create a `.test.ts` file with the same name
3. Import your function
4. Write tests for:
   - Expected behavior (happy path)
   - Edge cases
   - Error conditions
   - Different input types

Example:
```
src/lib/newModule/
├── __tests__/
│   └── newFunction.test.ts    # ← Add this
└── newFunction.ts              # ← Your new function
```

## Debugging Tests

### View detailed output
```bash
npm test -- --reporter=verbose
```

### Run only failed tests
```bash
npm test -- --reporter=verbose --failed
```

### Update snapshots (if using snapshot testing)
```bash
npm test -- -u
```

## Continuous Integration

Tests run automatically on:
- Every commit (in future CI setup)
- Every pull request
- Before deployment

### CI Configuration (Future)
```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test -- --run --coverage
```

## Coverage Reports

After running with `--coverage`, view the HTML report:
```bash
open coverage/index.html
```

Coverage targets (aspirational):
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Why These Tests Matter

### The XML Extraction Bug
The most critical tests verify the `extractXmlSnippet` function. Without proper testing, we had a bug where:

**Before**: Searching for decimal format pattern returned the **date** pattern ❌
```
XPath: //ldml/numbers/decimalFormats[@numberSystem='latn']/.../pattern
Found: <pattern>EEEE, MMMM d, y</pattern>  (WRONG!)
```

**After**: Correctly narrows scope and finds the right pattern ✅
```
XPath: //ldml/numbers/decimalFormats[@numberSystem='latn']/.../pattern
Found: <pattern>#,##0.###</pattern>  (CORRECT!)
```

The test suite prevents regression of this critical bug.

## Troubleshooting

### Tests hang in watch mode
Press `q` to quit, or use `--run` to execute once:
```bash
npm test -- --run
```

### "Cannot find module" errors
Make sure path aliases are set up in `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Tests pass locally but fail in CI
- Check Node version matches
- Ensure all dependencies are installed
- Run with `--run` flag (no watch mode)

## Future Improvements

- [ ] Component tests for React components
- [ ] Integration tests for user flows
- [ ] E2E tests with Playwright
- [ ] Visual regression tests
- [ ] Performance benchmarks
- [ ] API mocking for data loading tests

## Contributing

When submitting PRs:
1. Add tests for new features
2. Update existing tests if behavior changes
3. Ensure all tests pass: `npm test -- --run`
4. Aim for >80% coverage on new code

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Test-Driven Development Guide](https://testdriven.io/)
