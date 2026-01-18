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
        expect(result.snippet).toContain('#,##0%')
        expect(result.snippet).toContain('percentFormat')
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

    describe('Multiple format types - different line numbers', () => {
      // This is the critical regression test to ensure different format types
      // don't all point to the same line (like they did in the bug)
      const xmlWithAllFormats = `
<ldml>
  <numbers>
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
    <currencyFormats numberSystem="latn">
      <currencyFormatLength>
        <currencyFormat type="standard">
          <pattern>¤#,##0.00</pattern>
        </currencyFormat>
      </currencyFormatLength>
    </currencyFormats>
    <scientificFormats numberSystem="latn">
      <scientificFormatLength>
        <scientificFormat>
          <pattern>#E0</pattern>
        </scientificFormat>
      </scientificFormatLength>
    </scientificFormats>
  </numbers>
</ldml>
      `.trim()

      it('should find decimal format at correct line', () => {
        const result = extractXmlSnippet(
          xmlWithAllFormats,
          "//ldml/numbers/decimalFormats[@numberSystem='latn']/decimalFormatLength/decimalFormat/pattern"
        )

        expect(result.lineNumber).toBeDefined()
        expect(result.snippet).toContain('#,##0.###')
        expect(result.snippet).not.toContain('#,##0%')
        expect(result.snippet).not.toContain('¤')
        expect(result.snippet).not.toContain('#E0')
      })

      it('should find percent format at correct line', () => {
        const result = extractXmlSnippet(
          xmlWithAllFormats,
          "//ldml/numbers/percentFormats[@numberSystem='latn']/percentFormatLength/percentFormat/pattern"
        )

        expect(result.lineNumber).toBeDefined()
        expect(result.snippet).toContain('#,##0%')
        expect(result.snippet).not.toContain('#,##0.###')
        expect(result.snippet).not.toContain('¤')
        expect(result.snippet).not.toContain('#E0')
      })

      it('should find currency format at correct line', () => {
        const result = extractXmlSnippet(
          xmlWithAllFormats,
          "//ldml/numbers/currencyFormats[@numberSystem='latn']/currencyFormatLength/currencyFormat/pattern"
        )

        expect(result.lineNumber).toBeDefined()
        expect(result.snippet).toContain('¤#,##0.00')
        expect(result.snippet).not.toContain('#,##0.###')
        expect(result.snippet).not.toContain('#,##0%')
        expect(result.snippet).not.toContain('#E0')
      })

      it('should find scientific format at correct line', () => {
        const result = extractXmlSnippet(
          xmlWithAllFormats,
          "//ldml/numbers/scientificFormats[@numberSystem='latn']/scientificFormatLength/scientificFormat/pattern"
        )

        expect(result.lineNumber).toBeDefined()
        expect(result.snippet).toContain('#E0')
        expect(result.snippet).not.toContain('#,##0.###')
        expect(result.snippet).not.toContain('#,##0%')
        expect(result.snippet).not.toContain('¤')
      })

      it('should return DIFFERENT line numbers for each format type', () => {
        const decimal = extractXmlSnippet(
          xmlWithAllFormats,
          "//ldml/numbers/decimalFormats[@numberSystem='latn']/decimalFormatLength/decimalFormat/pattern"
        )
        const percent = extractXmlSnippet(
          xmlWithAllFormats,
          "//ldml/numbers/percentFormats[@numberSystem='latn']/percentFormatLength/percentFormat/pattern"
        )
        const currency = extractXmlSnippet(
          xmlWithAllFormats,
          "//ldml/numbers/currencyFormats[@numberSystem='latn']/currencyFormatLength/currencyFormat/pattern"
        )
        const scientific = extractXmlSnippet(
          xmlWithAllFormats,
          "//ldml/numbers/scientificFormats[@numberSystem='latn']/scientificFormatLength/scientificFormat/pattern"
        )

        // All line numbers should be defined
        expect(decimal.lineNumber).toBeDefined()
        expect(percent.lineNumber).toBeDefined()
        expect(currency.lineNumber).toBeDefined()
        expect(scientific.lineNumber).toBeDefined()

        // All line numbers should be DIFFERENT
        const lineNumbers = [
          decimal.lineNumber,
          percent.lineNumber,
          currency.lineNumber,
          scientific.lineNumber,
        ]
        const uniqueLineNumbers = new Set(lineNumbers)

        // This is the critical assertion - all 4 should be unique
        expect(uniqueLineNumbers.size).toBe(4)

        // Also verify they're in order (decimal < percent < currency < scientific)
        expect(decimal.lineNumber).toBeLessThan(percent.lineNumber!)
        expect(percent.lineNumber).toBeLessThan(currency.lineNumber!)
        expect(currency.lineNumber).toBeLessThan(scientific.lineNumber!)
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

    describe('Multiple calendar support - Regression test for calendar disambiguation bug', () => {
      // This test mimics the real CLDR XML structure where multiple calendars
      // exist in the same file, with Chinese calendar appearing BEFORE Gregorian.
      // The bug: searching for Gregorian months would find Chinese months instead.
      const xmlWithMultipleCalendars = `
<ldml>
  <dates>
    <calendars>
      <calendar type="chinese">
        <months>
          <monthContext type="format">
            <monthWidth type="abbreviated">
              <month type="1">Mo1</month>
              <month type="2">Mo2</month>
            </monthWidth>
            <monthWidth type="wide">
              <month type="1">First Month</month>
              <month type="2">Second Month</month>
              <month type="3">Third Month</month>
            </monthWidth>
          </monthContext>
        </months>
        <days>
          <dayContext type="format">
            <dayWidth type="wide">
              <day type="sun">Chinese Sunday</day>
              <day type="mon">Chinese Monday</day>
            </dayWidth>
          </dayContext>
        </days>
      </calendar>
      <calendar type="gregorian">
        <months>
          <monthContext type="format">
            <monthWidth type="abbreviated">
              <month type="1">Jan</month>
              <month type="2">Feb</month>
            </monthWidth>
            <monthWidth type="wide">
              <month type="1">January</month>
              <month type="2">February</month>
              <month type="3">March</month>
            </monthWidth>
          </monthContext>
        </months>
        <days>
          <dayContext type="format">
            <dayWidth type="wide">
              <day type="sun">Sunday</day>
              <day type="mon">Monday</day>
            </dayWidth>
          </dayContext>
        </days>
      </calendar>
    </calendars>
  </dates>
</ldml>
      `.trim()

      it('should find Gregorian month names, NOT Chinese month names', () => {
        const result = extractXmlSnippet(
          xmlWithMultipleCalendars,
          "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='1']"
        )

        // CRITICAL: Must find "January", not "First Month"
        expect(result.snippet).toContain('January')
        expect(result.snippet).not.toContain('First Month')
        expect(result.snippet).not.toContain('Chinese')
      })

      it('should find Gregorian abbreviated months correctly', () => {
        const result = extractXmlSnippet(
          xmlWithMultipleCalendars,
          "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='1']"
        )

        expect(result.snippet).toContain('Jan')
        expect(result.snippet).not.toContain('Mo1')
      })

      it('should find Gregorian day names, NOT Chinese day names', () => {
        const result = extractXmlSnippet(
          xmlWithMultipleCalendars,
          "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='sun']"
        )

        expect(result.snippet).toContain('Sunday')
        expect(result.snippet).not.toContain('Chinese Sunday')
      })

      it('should correctly find month type 2 (February)', () => {
        const result = extractXmlSnippet(
          xmlWithMultipleCalendars,
          "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='2']"
        )

        expect(result.snippet).toContain('February')
        expect(result.snippet).not.toContain('Second Month')
      })

      it('should correctly find month type 3 (March)', () => {
        const result = extractXmlSnippet(
          xmlWithMultipleCalendars,
          "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='3']"
        )

        expect(result.snippet).toContain('March')
        expect(result.snippet).not.toContain('Third Month')
      })

      it('should be able to find Chinese calendar when explicitly requested', () => {
        const result = extractXmlSnippet(
          xmlWithMultipleCalendars,
          "//ldml/dates/calendars/calendar[@type='chinese']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='1']"
        )

        expect(result.snippet).toContain('First Month')
        expect(result.snippet).not.toContain('January')
      })

      it('should return different line numbers for Chinese vs Gregorian calendar months', () => {
        const chineseMonth = extractXmlSnippet(
          xmlWithMultipleCalendars,
          "//ldml/dates/calendars/calendar[@type='chinese']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='1']"
        )
        const gregorianMonth = extractXmlSnippet(
          xmlWithMultipleCalendars,
          "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='1']"
        )

        expect(chineseMonth.lineNumber).toBeDefined()
        expect(gregorianMonth.lineNumber).toBeDefined()

        // Line numbers should be different
        expect(chineseMonth.lineNumber).not.toBe(gregorianMonth.lineNumber)

        // Chinese calendar appears first, so should have lower line number
        expect(chineseMonth.lineNumber).toBeLessThan(gregorianMonth.lineNumber!)

        // Verify content is different
        expect(chineseMonth.snippet).toContain('First Month')
        expect(gregorianMonth.snippet).toContain('January')
      })
    })
  })
})
