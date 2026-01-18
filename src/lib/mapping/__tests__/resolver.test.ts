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

  describe('Date/Time XPath Mappings', () => {
    it('should resolve month name paths', () => {
      const result = resolveXPath('dates.calendars.gregorian.months.format.wide.1', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='1']"
      )
    })

    it('should resolve abbreviated month name paths', () => {
      const result = resolveXPath('dates.calendars.gregorian.months.format.abbreviated.6', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='6']"
      )
    })

    it('should resolve day name paths', () => {
      const result = resolveXPath('dates.calendars.gregorian.days.format.wide.mon', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='mon']"
      )
    })

    it('should resolve abbreviated day name paths', () => {
      const result = resolveXPath('dates.calendars.gregorian.days.format.abbreviated.fri', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='abbreviated']/day[@type='fri']"
      )
    })

    it('should resolve day period paths', () => {
      const result = resolveXPath('dates.calendars.gregorian.dayPeriods.format.wide.am', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='am']"
      )
    })

    it('should resolve noon and midnight day period paths', () => {
      const resultNoon = resolveXPath('dates.calendars.gregorian.dayPeriods.format.wide.noon', 'en')
      expect(resultNoon.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='noon']"
      )

      const resultMidnight = resolveXPath('dates.calendars.gregorian.dayPeriods.format.wide.midnight', 'en')
      expect(resultMidnight.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='midnight']"
      )
    })

    it('should resolve era paths', () => {
      const result = resolveXPath('dates.calendars.gregorian.eras.eraAbbr.0', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/eras/eraAbbr/era[@type='0']"
      )
    })

    it('should resolve dateTime format paths', () => {
      const result = resolveXPath('dates.calendars.gregorian.dateTimeFormats.full', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/dateTimeFormatLength[@type='full']/dateTimeFormat/pattern"
      )
    })

    it('should resolve all month numbers (1-12)', () => {
      for (let month = 1; month <= 12; month++) {
        const result = resolveXPath(`dates.calendars.gregorian.months.format.wide.${month}`, 'en')
        expect(result.xpath).toBe(
          `//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='${month}']`
        )
      }
    })

    it('should resolve all day names', () => {
      const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      days.forEach(day => {
        const result = resolveXPath(`dates.calendars.gregorian.days.format.wide.${day}`, 'en')
        expect(result.xpath).toBe(
          `//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='${day}']`
        )
      })
    })
  })

  describe('Dynamic Available Formats XPath Mappings', () => {
    it('should resolve available format Bh path', () => {
      const result = resolveXPath('dates.calendars.gregorian.dateTimeFormats.availableFormats.Bh', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/availableFormats/dateFormatItem[@id='Bh']"
      )
    })

    it('should resolve available format d path', () => {
      const result = resolveXPath('dates.calendars.gregorian.dateTimeFormats.availableFormats.d', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/availableFormats/dateFormatItem[@id='d']"
      )
    })

    it('should resolve available format yMd path', () => {
      const result = resolveXPath('dates.calendars.gregorian.dateTimeFormats.availableFormats.yMd', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/availableFormats/dateFormatItem[@id='yMd']"
      )
    })

    it('should resolve available format yMMMd path', () => {
      const result = resolveXPath('dates.calendars.gregorian.dateTimeFormats.availableFormats.yMMMd', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/availableFormats/dateFormatItem[@id='yMMMd']"
      )
    })
  })

  describe('Dynamic Interval Formats XPath Mappings', () => {
    it('should resolve intervalFormatFallback path', () => {
      const result = resolveXPath('dates.calendars.gregorian.dateTimeFormats.intervalFormats.intervalFormatFallback', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/intervalFormats/intervalFormatFallback"
      )
    })

    it('should resolve interval format item yMd path', () => {
      const result = resolveXPath('dates.calendars.gregorian.dateTimeFormats.intervalFormats.yMd', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/intervalFormats/intervalFormatItem[@id='yMd']"
      )
    })

    it('should resolve interval format with greatestDifference y', () => {
      const result = resolveXPath('dates.calendars.gregorian.dateTimeFormats.intervalFormats.yMd.y', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/intervalFormats/intervalFormatItem[@id='yMd']/greatestDifference[@id='y']"
      )
    })

    it('should resolve interval format with greatestDifference M', () => {
      const result = resolveXPath('dates.calendars.gregorian.dateTimeFormats.intervalFormats.yMd.M', 'en')
      expect(result.xpath).toBe(
        "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/intervalFormats/intervalFormatItem[@id='yMd']/greatestDifference[@id='M']"
      )
    })
  })

  describe('Currency XPath Mappings', () => {
    it('should resolve currency display name paths', () => {
      const result = resolveXPath('numbers.currencies.USD.displayName', 'en')
      expect(result.xpath).toBe(
        "//ldml/numbers/currencies/currency[@type='USD']/displayName"
      )
    })

    it('should resolve currency symbol paths', () => {
      const result = resolveXPath('numbers.currencies.EUR.symbol', 'en')
      expect(result.xpath).toBe(
        "//ldml/numbers/currencies/currency[@type='EUR']/symbol"
      )
    })

    it('should resolve currency plural forms (count-one)', () => {
      const result = resolveXPath('numbers.currencies.GBP.displayName-count-one', 'en')
      expect(result.xpath).toBe(
        "//ldml/numbers/currencies/currency[@type='GBP']/displayName[@count='one']"
      )
    })

    it('should resolve currency plural forms (count-other)', () => {
      const result = resolveXPath('numbers.currencies.USD.displayName-count-other', 'en')
      expect(result.xpath).toBe(
        "//ldml/numbers/currencies/currency[@type='USD']/displayName[@count='other']"
      )
    })

    it('should resolve currency symbol variants', () => {
      const result = resolveXPath('numbers.currencies.USD.symbol-alt-narrow', 'en')
      expect(result.xpath).toBe(
        "//ldml/numbers/currencies/currency[@type='USD']/symbol[@alt='narrow']"
      )
    })

    it('should resolve paths for different currency codes', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CNY']
      currencies.forEach(code => {
        const result = resolveXPath(`numbers.currencies.${code}.displayName`, 'en')
        expect(result.xpath).toBe(
          `//ldml/numbers/currencies/currency[@type='${code}']/displayName`
        )
      })
    })

    it('should work with main.locale prefix', () => {
      const result = resolveXPath('main.en.numbers.currencies.EUR.symbol', 'en')
      expect(result.xpath).toBe(
        "//ldml/numbers/currencies/currency[@type='EUR']/symbol"
      )
    })

    it('should work with different locales', () => {
      const result = resolveXPath('numbers.currencies.JPY.displayName', 'ja')
      expect(result.xpath).toBe(
        "//ldml/numbers/currencies/currency[@type='JPY']/displayName"
      )
      expect(result.xmlFile).toBe('common/main/ja.xml')
    })
  })
})
