import { describe, it, expect } from 'vitest'
import {
  resolveXPath,
  buildJsonPath,
  hasMappingFor,
  getAvailableMappings,
} from '../resolver'

describe('Mapping Resolver', () => {
  describe('resolveXPath', () => {
    it('should resolve decimal separator path', () => {
      const result = resolveXPath('main.en.numbers.symbols-numberSystem-latn.decimal', 'en')

      expect(result.xpath).toBe("//ldml/numbers/symbols[@numberSystem='latn']/decimal")
      expect(result.xmlFile).toBe('common/main/en.xml')
    })

    it('should resolve decimal format pattern', () => {
      const result = resolveXPath(
        'main.en.numbers.decimalFormats-numberSystem-latn.standard',
        'en'
      )

      expect(result.xpath).toBe(
        "//ldml/numbers/decimalFormats[@numberSystem='latn']/decimalFormatLength/decimalFormat/pattern"
      )
      expect(result.xmlFile).toBe('common/main/en.xml')
    })

    it('should resolve percent format pattern', () => {
      const result = resolveXPath(
        'main.en.numbers.percentFormats-numberSystem-latn.standard',
        'en'
      )

      expect(result.xpath).toBe(
        "//ldml/numbers/percentFormats[@numberSystem='latn']/percentFormatLength/percentFormat/pattern"
      )
    })

    it('should resolve currency format pattern', () => {
      const result = resolveXPath(
        'main.en.numbers.currencyFormats-numberSystem-latn.standard',
        'en'
      )

      expect(result.xpath).toBe(
        "//ldml/numbers/currencyFormats[@numberSystem='latn']/currencyFormatLength/currencyFormat/pattern"
      )
    })

    it('should resolve scientific format pattern', () => {
      const result = resolveXPath(
        'main.en.numbers.scientificFormats-numberSystem-latn.standard',
        'en'
      )

      expect(result.xpath).toBe(
        "//ldml/numbers/scientificFormats[@numberSystem='latn']/scientificFormatLength/scientificFormat/pattern"
      )
    })

    it('should handle paths without main.locale prefix', () => {
      const result = resolveXPath('numbers.symbols-numberSystem-latn.decimal', 'en')

      expect(result.xpath).toBe("//ldml/numbers/symbols[@numberSystem='latn']/decimal")
    })

    it('should work with different locales', () => {
      const result = resolveXPath('numbers.symbols-numberSystem-latn.decimal', 'de')

      expect(result.xmlFile).toBe('common/main/de.xml')
    })

    it('should handle script locales', () => {
      const result = resolveXPath('numbers.symbols-numberSystem-latn.decimal', 'zh-Hans')

      expect(result.xmlFile).toBe('common/main/zh-Hans.xml')
    })
  })

  describe('buildJsonPath', () => {
    it('should build path for numbers category', () => {
      const path = buildJsonPath('en', 'numbers', 'symbols-numberSystem-latn', 'decimal')

      expect(path).toBe('main.en.numbers.symbols-numberSystem-latn.decimal')
    })

    it('should handle single part path', () => {
      const path = buildJsonPath('en', 'numbers', 'defaultNumberingSystem')

      expect(path).toBe('main.en.numbers.defaultNumberingSystem')
    })

    it('should handle multiple parts', () => {
      const path = buildJsonPath(
        'en',
        'numbers',
        'decimalFormats-numberSystem-latn',
        'standard'
      )

      expect(path).toBe('main.en.numbers.decimalFormats-numberSystem-latn.standard')
    })

    it('should work with different locales', () => {
      const path = buildJsonPath('de', 'numbers', 'symbols-numberSystem-latn', 'decimal')

      expect(path).toBe('main.de.numbers.symbols-numberSystem-latn.decimal')
    })
  })

  describe('hasMappingFor', () => {
    it('should return true for precomputed mappings', () => {
      expect(hasMappingFor('numbers.symbols-numberSystem-latn.decimal')).toBe(true)
      expect(hasMappingFor('numbers.decimalFormats-numberSystem-latn.standard')).toBe(true)
    })

    it('should return false for non-existent mappings', () => {
      expect(hasMappingFor('numbers.nonExistent.path')).toBe(false)
    })

    it('should handle paths with main.locale prefix', () => {
      expect(hasMappingFor('main.en.numbers.symbols-numberSystem-latn.decimal')).toBe(true)
    })
  })

  describe('getAvailableMappings', () => {
    it('should return array of mapping keys', () => {
      const mappings = getAvailableMappings()

      expect(Array.isArray(mappings)).toBe(true)
      expect(mappings.length).toBeGreaterThan(0)
    })

    it('should include common number format mappings', () => {
      const mappings = getAvailableMappings()

      expect(mappings).toContain('numbers.symbols-numberSystem-latn.decimal')
      expect(mappings).toContain('numbers.symbols-numberSystem-latn.group')
      expect(mappings).toContain('numbers.decimalFormats-numberSystem-latn.standard')
    })

    it('should include date format mappings', () => {
      const mappings = getAvailableMappings()

      expect(mappings).toContain('dates.calendars.gregorian.dateFormats.full')
      expect(mappings).toContain('dates.calendars.gregorian.timeFormats.short')
    })
  })

  describe('XPath attribute transformation', () => {
    it('should transform element-attr-value to element[@attr="value"]', () => {
      const result = resolveXPath('numbers.symbols-numberSystem-latn.decimal', 'en')

      expect(result.xpath).toContain("[@numberSystem='latn']")
    })

    it('should handle multiple attribute segments', () => {
      // This tests the transformation logic for paths with multiple attributes
      const result = resolveXPath('numbers.decimalFormats-numberSystem-latn.standard', 'en')

      expect(result.xpath).toContain("decimalFormats[@numberSystem='latn']")
    })
  })

  describe('Locale normalization in paths', () => {
    it('should normalize en-US to en in XML path', () => {
      const result = resolveXPath('numbers.symbols-numberSystem-latn.decimal', 'en-US')

      expect(result.xmlFile).toBe('common/main/en.xml')
    })

    it('should keep zh-Hans for script locales', () => {
      const result = resolveXPath('numbers.symbols-numberSystem-latn.decimal', 'zh-Hans-CN')

      expect(result.xmlFile).toBe('common/main/zh-Hans.xml')
    })

    it('should normalize de-DE to de', () => {
      const result = resolveXPath('numbers.symbols-numberSystem-latn.decimal', 'de-DE')

      expect(result.xmlFile).toBe('common/main/de.xml')
    })
  })
})
