import type { XmlSourceMapping, LocaleCode } from '@/types'
import { getLocaleXmlPath } from '../xml/fetcher'

/**
 * Precomputed mappings for common CLDR JSON paths to XML XPaths
 * This would be generated at build time in production
 * For MVP, we include the most common paths manually
 */
const PRECOMPUTED_MAPPINGS: Record<string, Omit<XmlSourceMapping, 'xmlFile'>> = {
  // Number symbols
  'numbers.symbols-numberSystem-latn.decimal': {
    xpath: "//ldml/numbers/symbols[@numberSystem='latn']/decimal",
  },
  'numbers.symbols-numberSystem-latn.group': {
    xpath: "//ldml/numbers/symbols[@numberSystem='latn']/group",
  },
  'numbers.symbols-numberSystem-latn.percentSign': {
    xpath: "//ldml/numbers/symbols[@numberSystem='latn']/percentSign",
  },
  'numbers.symbols-numberSystem-latn.plusSign': {
    xpath: "//ldml/numbers/symbols[@numberSystem='latn']/plusSign",
  },
  'numbers.symbols-numberSystem-latn.minusSign': {
    xpath: "//ldml/numbers/symbols[@numberSystem='latn']/minusSign",
  },
  'numbers.symbols-numberSystem-latn.exponential': {
    xpath: "//ldml/numbers/symbols[@numberSystem='latn']/exponential",
  },

  // Number formats
  'numbers.decimalFormats-numberSystem-latn.standard': {
    xpath: "//ldml/numbers/decimalFormats[@numberSystem='latn']/decimalFormatLength/decimalFormat/pattern",
  },
  'numbers.percentFormats-numberSystem-latn.standard': {
    xpath: "//ldml/numbers/percentFormats[@numberSystem='latn']/percentFormatLength/percentFormat/pattern",
  },
  'numbers.currencyFormats-numberSystem-latn.standard': {
    xpath: "//ldml/numbers/currencyFormats[@numberSystem='latn']/currencyFormatLength/currencyFormat/pattern",
  },
  'numbers.currencyFormats-numberSystem-latn.accounting': {
    xpath: "//ldml/numbers/currencyFormats[@numberSystem='latn']/currencyFormatLength/currencyFormat[@type='accounting']/pattern",
  },
  'numbers.scientificFormats-numberSystem-latn.standard': {
    xpath: "//ldml/numbers/scientificFormats[@numberSystem='latn']/scientificFormatLength/scientificFormat/pattern",
  },

  // Default numbering system
  'numbers.defaultNumberingSystem': {
    xpath: '//ldml/numbers/defaultNumberingSystem',
  },
  'numbers.minimumGroupingDigits': {
    xpath: '//ldml/numbers/minimumGroupingDigits',
  },

  // Date/time formats
  'dates.calendars.gregorian.dateFormats.full': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateFormats/dateFormatLength[@type='full']/dateFormat/pattern",
  },
  'dates.calendars.gregorian.dateFormats.long': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateFormats/dateFormatLength[@type='long']/dateFormat/pattern",
  },
  'dates.calendars.gregorian.dateFormats.medium': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateFormats/dateFormatLength[@type='medium']/dateFormat/pattern",
  },
  'dates.calendars.gregorian.dateFormats.short': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateFormats/dateFormatLength[@type='short']/dateFormat/pattern",
  },

  // Time formats
  'dates.calendars.gregorian.timeFormats.full': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/timeFormats/timeFormatLength[@type='full']/timeFormat/pattern",
  },
  'dates.calendars.gregorian.timeFormats.long': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/timeFormats/timeFormatLength[@type='long']/timeFormat/pattern",
  },
  'dates.calendars.gregorian.timeFormats.medium': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/timeFormats/timeFormatLength[@type='medium']/timeFormat/pattern",
  },
  'dates.calendars.gregorian.timeFormats.short': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/timeFormats/timeFormatLength[@type='short']/timeFormat/pattern",
  },

  // Month names - Format.Wide
  'dates.calendars.gregorian.months.format.wide.1': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='1']",
  },
  'dates.calendars.gregorian.months.format.wide.2': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='2']",
  },
  'dates.calendars.gregorian.months.format.wide.3': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='3']",
  },
  'dates.calendars.gregorian.months.format.wide.4': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='4']",
  },
  'dates.calendars.gregorian.months.format.wide.5': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='5']",
  },
  'dates.calendars.gregorian.months.format.wide.6': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='6']",
  },
  'dates.calendars.gregorian.months.format.wide.7': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='7']",
  },
  'dates.calendars.gregorian.months.format.wide.8': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='8']",
  },
  'dates.calendars.gregorian.months.format.wide.9': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='9']",
  },
  'dates.calendars.gregorian.months.format.wide.10': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='10']",
  },
  'dates.calendars.gregorian.months.format.wide.11': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='11']",
  },
  'dates.calendars.gregorian.months.format.wide.12': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type='12']",
  },

  // Month names - Format.Abbreviated
  'dates.calendars.gregorian.months.format.abbreviated.1': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='1']",
  },
  'dates.calendars.gregorian.months.format.abbreviated.2': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='2']",
  },
  'dates.calendars.gregorian.months.format.abbreviated.3': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='3']",
  },
  'dates.calendars.gregorian.months.format.abbreviated.4': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='4']",
  },
  'dates.calendars.gregorian.months.format.abbreviated.5': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='5']",
  },
  'dates.calendars.gregorian.months.format.abbreviated.6': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='6']",
  },
  'dates.calendars.gregorian.months.format.abbreviated.7': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='7']",
  },
  'dates.calendars.gregorian.months.format.abbreviated.8': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='8']",
  },
  'dates.calendars.gregorian.months.format.abbreviated.9': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='9']",
  },
  'dates.calendars.gregorian.months.format.abbreviated.10': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='10']",
  },
  'dates.calendars.gregorian.months.format.abbreviated.11': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='11']",
  },
  'dates.calendars.gregorian.months.format.abbreviated.12': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type='12']",
  },

  // Day names - Format.Wide
  'dates.calendars.gregorian.days.format.wide.sun': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='sun']",
  },
  'dates.calendars.gregorian.days.format.wide.mon': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='mon']",
  },
  'dates.calendars.gregorian.days.format.wide.tue': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='tue']",
  },
  'dates.calendars.gregorian.days.format.wide.wed': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='wed']",
  },
  'dates.calendars.gregorian.days.format.wide.thu': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='thu']",
  },
  'dates.calendars.gregorian.days.format.wide.fri': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='fri']",
  },
  'dates.calendars.gregorian.days.format.wide.sat': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='wide']/day[@type='sat']",
  },

  // Day names - Format.Abbreviated
  'dates.calendars.gregorian.days.format.abbreviated.sun': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='abbreviated']/day[@type='sun']",
  },
  'dates.calendars.gregorian.days.format.abbreviated.mon': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='abbreviated']/day[@type='mon']",
  },
  'dates.calendars.gregorian.days.format.abbreviated.tue': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='abbreviated']/day[@type='tue']",
  },
  'dates.calendars.gregorian.days.format.abbreviated.wed': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='abbreviated']/day[@type='wed']",
  },
  'dates.calendars.gregorian.days.format.abbreviated.thu': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='abbreviated']/day[@type='thu']",
  },
  'dates.calendars.gregorian.days.format.abbreviated.fri': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='abbreviated']/day[@type='fri']",
  },
  'dates.calendars.gregorian.days.format.abbreviated.sat': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/days/dayContext[@type='format']/dayWidth[@type='abbreviated']/day[@type='sat']",
  },

  // Day periods
  'dates.calendars.gregorian.dayPeriods.format.wide.am': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='am']",
  },
  'dates.calendars.gregorian.dayPeriods.format.wide.pm': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='pm']",
  },
  'dates.calendars.gregorian.dayPeriods.format.wide.midnight': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='midnight']",
  },
  'dates.calendars.gregorian.dayPeriods.format.wide.noon': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dayPeriods/dayPeriodContext[@type='format']/dayPeriodWidth[@type='wide']/dayPeriod[@type='noon']",
  },

  // Eras
  'dates.calendars.gregorian.eras.eraAbbr.0': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/eras/eraAbbr/era[@type='0']",
  },
  'dates.calendars.gregorian.eras.eraAbbr.1': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/eras/eraAbbr/era[@type='1']",
  },

  // DateTime formats
  'dates.calendars.gregorian.dateTimeFormats.full': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/dateTimeFormatLength[@type='full']/dateTimeFormat/pattern",
  },
  'dates.calendars.gregorian.dateTimeFormats.long': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/dateTimeFormatLength[@type='long']/dateTimeFormat/pattern",
  },
  'dates.calendars.gregorian.dateTimeFormats.medium': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/dateTimeFormatLength[@type='medium']/dateTimeFormat/pattern",
  },
  'dates.calendars.gregorian.dateTimeFormats.short': {
    xpath: "//ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/dateTimeFormatLength[@type='short']/dateTimeFormat/pattern",
  },
}

/**
 * Converts a CLDR JSON path segment with attributes to XPath predicate
 * Example: "symbols-numberSystem-latn" -> "symbols[@numberSystem='latn']"
 */
function convertPathSegmentToXPath(segment: string): string {
  // Check if segment contains attribute pattern (element-attr-value)
  const attrPattern = /^([a-zA-Z]+)-([a-zA-Z]+)-([a-zA-Z0-9]+)$/
  const match = segment.match(attrPattern)

  if (match) {
    const [, element, attrName, attrValue] = match
    return `${element}[@${attrName}='${attrValue}']`
  }

  // No attributes, return as-is
  return segment
}

/**
 * Converts a segment considering its context (previous segment)
 * Handles special cases like gregorian -> calendar[@type='gregorian']
 */
function convertSegmentWithContext(segment: string, prevSegment?: string): string {
  // Special case: gregorian/chinese/etc after 'calendars' should become calendar[@type='...']
  if (prevSegment === 'calendars' && (segment === 'gregorian' || segment === 'chinese' || segment === 'hebrew')) {
    return `calendar[@type='${segment}']`
  }

  // Otherwise use the normal conversion
  return convertPathSegmentToXPath(segment)
}

/**
 * Transforms a CLDR JSON path to XPath using transformation rules
 * This is the fallback when no precomputed mapping exists
 */
function transformJsonPathToXPath(jsonPath: string): string {
  // Remove "main.{locale}." prefix if present
  const pathWithoutLocale = jsonPath.replace(/^main\.[^.]+\./, '')

  // Split by dots and process each segment
  const segments = pathWithoutLocale.split('.')

  // Special handling for availableFormats and intervalFormats
  const availableFormatsIdx = segments.indexOf('availableFormats')
  if (availableFormatsIdx !== -1 && segments.length > availableFormatsIdx + 1) {
    // Path is like: dates.calendars.gregorian.dateTimeFormats.availableFormats.Bh
    // Should become: //ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/availableFormats/dateFormatItem[@id='Bh']
    const beforeAvailable = segments.slice(0, availableFormatsIdx + 1)
    const formatId = segments[availableFormatsIdx + 1]

    const xpathBefore = beforeAvailable.map((seg, idx) =>
      convertSegmentWithContext(seg, idx > 0 ? beforeAvailable[idx - 1] : undefined)
    ).join('/')
    return `//ldml/${xpathBefore}/dateFormatItem[@id='${formatId}']`
  }

  const intervalFormatsIdx = segments.indexOf('intervalFormats')
  if (intervalFormatsIdx !== -1 && segments.length > intervalFormatsIdx + 1) {
    const beforeInterval = segments.slice(0, intervalFormatsIdx + 1)
    const formatId = segments[intervalFormatsIdx + 1]

    // Check if this is intervalFormatFallback (special case)
    if (formatId === 'intervalFormatFallback') {
      const xpathBefore = beforeInterval.map((seg, idx) =>
        convertSegmentWithContext(seg, idx > 0 ? beforeInterval[idx - 1] : undefined)
      ).join('/')
      return `//ldml/${xpathBefore}/intervalFormatFallback`
    }

    // Check if there's a greatestDifference level
    if (segments.length > intervalFormatsIdx + 2) {
      const greatestDiff = segments[intervalFormatsIdx + 2]
      const xpathBefore = beforeInterval.map((seg, idx) =>
        convertSegmentWithContext(seg, idx > 0 ? beforeInterval[idx - 1] : undefined)
      ).join('/')
      return `//ldml/${xpathBefore}/intervalFormatItem[@id='${formatId}']/greatestDifference[@id='${greatestDiff}']`
    }

    // Just the intervalFormatItem itself
    const xpathBefore = beforeInterval.map((seg, idx) =>
      convertSegmentWithContext(seg, idx > 0 ? beforeInterval[idx - 1] : undefined)
    ).join('/')
    return `//ldml/${xpathBefore}/intervalFormatItem[@id='${formatId}']`
  }

  // Default transformation
  const xpathSegments = segments.map((seg, idx) =>
    convertSegmentWithContext(seg, idx > 0 ? segments[idx - 1] : undefined)
  )
  return '//ldml/' + xpathSegments.join('/')
}

/**
 * Resolves a CLDR JSON path to XML source information
 */
export function resolveXPath(
  jsonPath: string,
  locale: LocaleCode
): XmlSourceMapping {
  // Normalize the path (remove "main.{locale}." prefix for lookup)
  const normalizedPath = jsonPath.replace(/^main\.[^.]+\./, '')

  // Check precomputed mappings first
  const precomputed = PRECOMPUTED_MAPPINGS[normalizedPath]

  if (precomputed) {
    return {
      xpath: precomputed.xpath,
      xmlFile: getLocaleXmlPath(locale),
      lineNumber: precomputed.lineNumber,
    }
  }

  // Fallback to rule-based transformation
  return {
    xpath: transformJsonPathToXPath(jsonPath),
    xmlFile: getLocaleXmlPath(locale),
  }
}

/**
 * Extracts JSON path from nested object access
 * Example: data.main.en.numbers.symbols -> "main.en.numbers.symbols"
 */
export function extractJsonPath(obj: unknown, targetValue: unknown): string | null {
  function search(current: unknown, path: string[] = []): string | null {
    if (current === targetValue) {
      return path.join('.')
    }

    if (current && typeof current === 'object') {
      for (const [key, value] of Object.entries(current)) {
        const result = search(value, [...path, key])
        if (result) return result
      }
    }

    return null
  }

  return search(obj)
}

/**
 * Builds a complete JSON path for a CLDR data value
 */
export function buildJsonPath(
  locale: LocaleCode,
  category: string,
  ...pathParts: string[]
): string {
  return ['main', locale, category, ...pathParts].join('.')
}

/**
 * Gets all available precomputed mappings (useful for debugging)
 */
export function getAvailableMappings(): string[] {
  return Object.keys(PRECOMPUTED_MAPPINGS)
}

/**
 * Validates if a mapping exists for a JSON path
 */
export function hasMappingFor(jsonPath: string): boolean {
  const normalizedPath = jsonPath.replace(/^main\.[^.]+\./, '')
  return normalizedPath in PRECOMPUTED_MAPPINGS
}
