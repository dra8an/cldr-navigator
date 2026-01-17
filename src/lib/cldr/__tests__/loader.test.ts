import { describe, it, expect } from 'vitest'
import { normalizeLocaleForCldr, getCldrValue, clearCldrCache } from '../loader'

describe('CLDR Loader', () => {
  describe('normalizeLocaleForCldr', () => {
    it('should keep simple language codes as-is', () => {
      expect(normalizeLocaleForCldr('en')).toBe('en')
      expect(normalizeLocaleForCldr('de')).toBe('de')
      expect(normalizeLocaleForCldr('fr')).toBe('fr')
      expect(normalizeLocaleForCldr('ja')).toBe('ja')
    })

    it('should normalize language-region to language', () => {
      expect(normalizeLocaleForCldr('en-US')).toBe('en')
      expect(normalizeLocaleForCldr('en-GB')).toBe('en')
      expect(normalizeLocaleForCldr('de-DE')).toBe('de')
      expect(normalizeLocaleForCldr('fr-FR')).toBe('fr')
      expect(normalizeLocaleForCldr('es-ES')).toBe('es')
      expect(normalizeLocaleForCldr('pt-BR')).toBe('pt')
    })

    it('should preserve script locales', () => {
      expect(normalizeLocaleForCldr('zh-Hans')).toBe('zh-Hans')
      expect(normalizeLocaleForCldr('zh-Hant')).toBe('zh-Hant')
      expect(normalizeLocaleForCldr('sr-Latn')).toBe('sr-Latn')
      expect(normalizeLocaleForCldr('sr-Cyrl')).toBe('sr-Cyrl')
    })

    it('should normalize language-script-region to language-script', () => {
      expect(normalizeLocaleForCldr('zh-Hans-CN')).toBe('zh-Hans')
      expect(normalizeLocaleForCldr('zh-Hant-TW')).toBe('zh-Hant')
      expect(normalizeLocaleForCldr('sr-Latn-RS')).toBe('sr-Latn')
    })

    it('should handle edge cases', () => {
      // Single part (already normalized)
      expect(normalizeLocaleForCldr('ko')).toBe('ko')

      // Two parts but not a script locale
      expect(normalizeLocaleForCldr('ar-SA')).toBe('ar')

      // Three parts but not a recognized script locale
      expect(normalizeLocaleForCldr('en-US-POSIX')).toBe('en')
    })
  })

  describe('getCldrValue', () => {
    const testData = {
      main: {
        en: {
          numbers: {
            'symbols-numberSystem-latn': {
              decimal: '.',
              group: ',',
            },
            defaultNumberingSystem: 'latn',
          },
        },
      },
    }

    it('should extract nested value by path', () => {
      const value = getCldrValue(testData, 'main.en.numbers.symbols-numberSystem-latn.decimal')
      expect(value).toBe('.')
    })

    it('should extract value at intermediate level', () => {
      const value = getCldrValue(testData, 'main.en.numbers.defaultNumberingSystem')
      expect(value).toBe('latn')
    })

    it('should return undefined for non-existent path', () => {
      const value = getCldrValue(testData, 'main.en.numbers.nonExistent')
      expect(value).toBeUndefined()
    })

    it('should return undefined for null/undefined in path', () => {
      const value = getCldrValue(testData, 'main.de.numbers.symbols-numberSystem-latn.decimal')
      expect(value).toBeUndefined()
    })

    it('should handle empty path', () => {
      const value = getCldrValue(testData, '')
      // Empty path split results in [''], which returns undefined
      expect(value).toBeUndefined()
    })

    it('should handle single-level path', () => {
      const value = getCldrValue(testData, 'main')
      expect(value).toBe(testData.main)
    })

    it('should extract object values', () => {
      const value = getCldrValue(testData, 'main.en.numbers.symbols-numberSystem-latn')
      expect(value).toEqual({
        decimal: '.',
        group: ',',
      })
    })

    it('should handle paths with special characters', () => {
      // CLDR uses hyphens in keys
      const value = getCldrValue(testData, 'main.en.numbers.symbols-numberSystem-latn')
      expect(value).toBeDefined()
    })
  })

  describe('clearCldrCache', () => {
    it('should not throw when clearing cache', () => {
      expect(() => clearCldrCache()).not.toThrow()
    })
  })

  describe('Locale normalization edge cases', () => {
    it('should handle lowercase script codes', () => {
      // Script codes should be capitalized in CLDR, lowercase won't match
      // Function will normalize to base language 'zh'
      expect(normalizeLocaleForCldr('zh-hans')).toBe('zh')
    })

    it('should handle very long locale strings', () => {
      expect(normalizeLocaleForCldr('en-US-x-custom')).toBe('en')
    })

    it('should not break on single character', () => {
      expect(normalizeLocaleForCldr('a')).toBe('a')
    })
  })
})
