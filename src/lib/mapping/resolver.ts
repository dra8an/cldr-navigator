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
 * Transforms a CLDR JSON path to XPath using transformation rules
 * This is the fallback when no precomputed mapping exists
 */
function transformJsonPathToXPath(jsonPath: string): string {
  // Remove "main.{locale}." prefix if present
  const pathWithoutLocale = jsonPath.replace(/^main\.[^.]+\./, '')

  // Split by dots and process each segment
  const segments = pathWithoutLocale.split('.')
  const xpathSegments = segments.map(convertPathSegmentToXPath)

  // Construct XPath
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
