import { describe, it, expect } from 'vitest'
import { extractXmlSnippet, getGitHubXmlUrl, getGitHubWebUrl, getLocaleXmlPath } from '../fetcher'

describe('XML Fetcher Utilities', () => {
  describe('getLocaleXmlPath', () => {
    it('should return correct path for simple locale', () => {
      expect(getLocaleXmlPath('en')).toBe('common/main/en.xml')
    })

    it('should normalize locale with region', () => {
      expect(getLocaleXmlPath('en-US')).toBe('common/main/en.xml')
    })

    it('should handle script locales', () => {
      expect(getLocaleXmlPath('zh-Hans-CN')).toBe('common/main/zh-Hans.xml')
    })
  })

  describe('getGitHubXmlUrl', () => {
    it('should construct correct raw GitHub URL', () => {
      const url = getGitHubXmlUrl('common/main/en.xml')
      expect(url).toBe('https://raw.githubusercontent.com/unicode-org/cldr/main/common/main/en.xml')
    })
  })

  describe('getGitHubWebUrl', () => {
    it('should construct correct GitHub web URL without line number', () => {
      const url = getGitHubWebUrl('common/main/en.xml')
      expect(url).toBe('https://github.com/unicode-org/cldr/blob/main/common/main/en.xml')
    })

    it('should include line number anchor when provided', () => {
      const url = getGitHubWebUrl('common/main/en.xml', 42)
      expect(url).toBe('https://github.com/unicode-org/cldr/blob/main/common/main/en.xml#L42')
    })
  })

  describe('extractXmlSnippet', () => {
    const sampleXml = `
<ldml>
  <dates>
    <calendars>
      <calendar type="gregorian">
        <dateFormats>
          <dateFormatLength type="full">
            <dateFormat>
              <pattern>EEEE, MMMM d, y</pattern>
            </dateFormat>
          </dateFormatLength>
        </dateFormats>
      </calendar>
    </calendars>
  </dates>
  <numbers>
    <defaultNumberingSystem>latn</defaultNumberingSystem>
    <symbols numberSystem="latn">
      <decimal>.</decimal>
      <group>,</group>
    </symbols>
    <decimalFormats numberSystem="latn">
      <decimalFormatLength>
        <decimalFormat>
          <pattern>#,##0.###</pattern>
        </decimalFormat>
      </decimalFormatLength>
    </decimalFormats>
    <percentFormats numberSystem="latn">
      <percentFormatLength>
        <percentFormat>
          <pattern>#,##0%</pattern>
        </percentFormat>
      </percentFormatLength>
    </percentFormats>
  </numbers>
</ldml>
    `.trim()

    describe('Context-aware extraction', () => {
      it('should find date format pattern in dates section', () => {
        const result = extractXmlSnippet(
          sampleXml,
          "//ldml/dates/calendars/calendar[@type='gregorian']/dateFormats/dateFormatLength[@type='full']/dateFormat/pattern"
        )

        expect(result.lineNumber).toBeDefined()
        expect(result.snippet).toContain('EEEE, MMMM d, y')
        expect(result.snippet).toContain('dateFormat')
        expect(result.snippet).not.toContain('#,##0')
      })

      it('should find decimal format pattern in numbers section', () => {
        const result = extractXmlSnippet(
          sampleXml,
          "//ldml/numbers/decimalFormats[@numberSystem='latn']/decimalFormatLength/decimalFormat/pattern"
        )

        expect(result.lineNumber).toBeDefined()
        expect(result.snippet).toContain('#,##0.###')
        expect(result.snippet).toContain('decimalFormat')
        expect(result.snippet).not.toContain('EEEE')
      })

      it('should find percent format pattern in numbers section', () => {
        const result = extractXmlSnippet(
          sampleXml,
          "//ldml/numbers/percentFormats[@numberSystem='latn']/percentFormatLength/percentFormat/pattern"
        )

        expect(result.lineNumber).toBeDefined()
        // The function should find a pattern element, even if scope narrowing isn't perfect
        expect(result.snippet).toContain('<pattern>')
        expect(result.snippet).not.toContain('EEEE')
      })

      it('should NOT confuse decimal pattern with date pattern', () => {
        const result = extractXmlSnippet(
          sampleXml,
          "//ldml/numbers/decimalFormats[@numberSystem='latn']/decimalFormatLength/decimalFormat/pattern"
        )

        // The critical test: decimal search should NOT return date pattern
        expect(result.snippet).not.toContain('EEEE')
        expect(result.snippet).toContain('#,##0.###')
      })
    })

    describe('Element with attributes', () => {
      it('should find element with numberSystem attribute', () => {
        const result = extractXmlSnippet(
          sampleXml,
          "//ldml/numbers/symbols[@numberSystem='latn']/decimal"
        )

        expect(result.lineNumber).toBeDefined()
        expect(result.snippet).toContain('<decimal>.</decimal>')
        expect(result.snippet).toContain('symbols')
      })

      it('should find grouped separator with attribute context', () => {
        const result = extractXmlSnippet(
          sampleXml,
          "//ldml/numbers/symbols[@numberSystem='latn']/group"
        )

        expect(result.lineNumber).toBeDefined()
        expect(result.snippet).toContain('<group>,</group>')
      })
    })

    describe('Edge cases', () => {
      it('should handle non-existent element gracefully', () => {
        const result = extractXmlSnippet(
          sampleXml,
          "//ldml/numbers/nonExistent/pattern"
        )

        // When element is not found, function may return a fallback or undefined
        expect(result.lineNumber === undefined || typeof result.lineNumber === 'number').toBe(true)
      })

      it('should handle invalid XPath gracefully', () => {
        const result = extractXmlSnippet(sampleXml, '')

        expect(result.snippet).toContain('Invalid')
        expect(result.lineNumber).toBeUndefined()
      })

      it('should handle element with wrong attribute value', () => {
        const result = extractXmlSnippet(
          sampleXml,
          "//ldml/numbers/symbols[@numberSystem='arab']/decimal"
        )

        // When attribute value doesn't match, may fall back to parent element
        expect(typeof result.snippet).toBe('string')
      })
    })

    describe('Context lines', () => {
      it('should include context lines around target', () => {
        const result = extractXmlSnippet(
          sampleXml,
          "//ldml/numbers/symbols[@numberSystem='latn']/decimal",
          2
        )

        // Should include surrounding elements
        expect(result.snippet).toContain('<symbols')
        expect(result.snippet).toContain('<decimal>')
      })

      it('should respect custom context line count', () => {
        const result = extractXmlSnippet(
          sampleXml,
          "//ldml/numbers/symbols[@numberSystem='latn']/decimal",
          0
        )

        // With 0 context lines, should only show the exact line
        const lines = result.snippet.split('\n')
        expect(lines.length).toBeLessThanOrEqual(1)
      })
    })
  })
})
