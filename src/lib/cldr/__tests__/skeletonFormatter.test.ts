import { describe, it, expect } from 'vitest'
import { formatWithSkeleton, canFormatSkeleton, hasUnsupportedFeatures } from '../skeletonFormatter'

describe('skeletonFormatter', () => {
  const testDate = new Date('2026-01-17T20:30:00')

  describe('formatWithSkeleton', () => {
    it('should format simple date skeleton', () => {
      const result = formatWithSkeleton(testDate, 'yMd', 'en-US')
      expect(result).toBeTruthy()
      // 'yMd' with single 'y' produces numeric (4-digit) year: 1/17/2026
      expect(result).toMatch(/1\/17\/2026/)
    })

    it('should format simple date skeleton with 4-digit year', () => {
      const result = formatWithSkeleton(testDate, 'yyyyMd', 'en-US')
      expect(result).toBeTruthy()
      // 'yyyy' produces 4-digit year
      expect(result).toMatch(/2026/)
    })

    it('should format time skeleton', () => {
      const result = formatWithSkeleton(testDate, 'Hm', 'en-US')
      expect(result).toBeTruthy()
      expect(result).toMatch(/20:30/)
    })

    it('should format complex skeleton with month name', () => {
      const result = formatWithSkeleton(testDate, 'yMMMd', 'en-US')
      expect(result).toBeTruthy()
      expect(result).toMatch(/Jan/)
    })

    it('should format flexible day period patterns', () => {
      // 'Bh' contains 'B' (flexible day period) - native Intl supports this!
      const result = formatWithSkeleton(testDate, 'Bh', 'en-US')
      expect(result).toBeTruthy()
      // Should show hour with flexible day period like "8 in the evening"
      expect(result).toMatch(/\d+/)
    })

    it('should return (unsupported) for patterns with week fields', () => {
      // 'W' (week of month) is unsupported
      const result = formatWithSkeleton(testDate, 'MMMMW-count-other', 'en-US')
      expect(result).toBe('(unsupported)')
    })

    it('should return (unsupported) for patterns with quarter fields', () => {
      // 'Q' (quarter) is unsupported
      const result = formatWithSkeleton(testDate, 'yQQQ', 'en-US')
      expect(result).toBe('(unsupported)')
    })

    it('should format for different locales', () => {
      const enResult = formatWithSkeleton(testDate, 'yMMMd', 'en-US')
      const deResult = formatWithSkeleton(testDate, 'yMMMd', 'de-DE')

      expect(enResult).toBeTruthy()
      expect(deResult).toBeTruthy()
      // Results should be different for different locales
      expect(enResult).not.toBe(deResult)
    })
  })

  describe('canFormatSkeleton', () => {
    it('should always return true (native Intl handles all patterns)', () => {
      expect(canFormatSkeleton()).toBe(true)
    })
  })

  describe('hasUnsupportedFeatures', () => {
    it('should return true for skeletons with week fields', () => {
      expect(hasUnsupportedFeatures('MMMMW-count-other')).toBe(true)
      expect(hasUnsupportedFeatures('yw')).toBe(true)
      expect(hasUnsupportedFeatures('yw-count-one')).toBe(true)
    })

    it('should return true for skeletons with quarter fields', () => {
      expect(hasUnsupportedFeatures('yQQQ')).toBe(true)
      expect(hasUnsupportedFeatures('Qq')).toBe(true)
      expect(hasUnsupportedFeatures('yQQQQ')).toBe(true)
    })

    it('should return false for supported skeletons', () => {
      expect(hasUnsupportedFeatures('yMd')).toBe(false)
      expect(hasUnsupportedFeatures('Bh')).toBe(false)
      expect(hasUnsupportedFeatures('yMMMd')).toBe(false)
      expect(hasUnsupportedFeatures('Hms')).toBe(false)
      expect(hasUnsupportedFeatures('Ed')).toBe(false)
    })
  })
})
