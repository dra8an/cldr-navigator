// Locale types
export type LocaleCode = string // e.g., 'en-US', 'de-DE', 'ja-JP'

export interface LocaleInfo {
  code: LocaleCode
  language: string
  region?: string
  script?: string
  displayName: string
}

// CLDR data types
export interface CldrData {
  main: {
    [locale: string]: {
      identity?: {
        version: { _cldrVersion: string }
        language: string
      }
      numbers?: CldrNumbers
      dates?: CldrDates
      localeDisplayNames?: CldrLocaleDisplayNames
    }
  }
}

export interface CldrNumbers {
  'defaultNumberingSystem'?: string
  'minimumGroupingDigits'?: string
  'symbols-numberSystem-latn'?: {
    decimal: string
    group: string
    list: string
    percentSign: string
    plusSign: string
    minusSign: string
    approximatelySign?: string
    exponential: string
    superscriptingExponent: string
    perMille: string
    infinity: string
    nan: string
    timeSeparator: string
  }
  'decimalFormats-numberSystem-latn'?: {
    standard: string
    long?: {
      decimalFormat: {
        [key: string]: string
      }
    }
    short?: {
      decimalFormat: {
        [key: string]: string
      }
    }
  }
  'scientificFormats-numberSystem-latn'?: {
    standard: string
  }
  'percentFormats-numberSystem-latn'?: {
    standard: string
  }
  'currencyFormats-numberSystem-latn'?: {
    standard: string
    accounting?: string
    'unitPattern-count-one'?: string
    'unitPattern-count-other'?: string
  }
  currencies?: {
    [currencyCode: string]: {
      displayName: string
      'displayName-count-one'?: string
      'displayName-count-other'?: string
      symbol?: string
      'symbol-alt-narrow'?: string
    }
  }
}

export interface CldrDates {
  calendars?: {
    gregorian?: {
      months?: {
        format?: {
          abbreviated?: { [key: string]: string }
          narrow?: { [key: string]: string }
          wide?: { [key: string]: string }
        }
        'stand-alone'?: {
          abbreviated?: { [key: string]: string }
          narrow?: { [key: string]: string }
          wide?: { [key: string]: string }
        }
      }
      days?: {
        format?: {
          abbreviated?: { [key: string]: string }
          narrow?: { [key: string]: string }
          short?: { [key: string]: string }
          wide?: { [key: string]: string }
        }
        'stand-alone'?: {
          abbreviated?: { [key: string]: string }
          narrow?: { [key: string]: string }
          short?: { [key: string]: string }
          wide?: { [key: string]: string }
        }
      }
      dayPeriods?: {
        format?: {
          abbreviated?: { [key: string]: string }
          narrow?: { [key: string]: string }
          wide?: { [key: string]: string }
        }
        'stand-alone'?: {
          abbreviated?: { [key: string]: string }
          narrow?: { [key: string]: string }
          wide?: { [key: string]: string }
        }
      }
      eras?: {
        eraNames?: { [key: string]: string }
        eraAbbr?: { [key: string]: string }
        eraNarrow?: { [key: string]: string }
      }
      dateFormats?: {
        full?: string
        long?: string
        medium?: string
        short?: string
      }
      timeFormats?: {
        full?: string
        long?: string
        medium?: string
        short?: string
      }
      dateTimeFormats?: {
        full?: string
        long?: string
        medium?: string
        short?: string
        availableFormats?: {
          [formatId: string]: string
        }
        intervalFormats?: {
          intervalFormatFallback?: string
          [formatId: string]: string | {
            [greatestDifference: string]: string
          } | undefined
        }
      }
    }
  }
  timeZoneNames?: {
    [key: string]: unknown
  }
}

export interface CldrLocaleDisplayNames {
  languages?: { [code: string]: string }
  territories?: { [code: string]: string }
  scripts?: { [code: string]: string }
  variants?: { [code: string]: string }
  localeDisplayPattern?: {
    localePattern?: string
    localeSeparator?: string
    localeKeyTypePattern?: string
  }
  keys?: { [key: string]: string }
  types?: { [category: string]: { [type: string]: string } }
  codePatterns?: {
    language?: string
    script?: string
    territory?: string
  }
}

// XML Source mapping types
export interface XmlSourceMapping {
  xpath: string
  xmlFile: string
  lineNumber?: number
}

export interface SourceLocation {
  jsonPath: string
  xpath: string
  xmlFile: string
  githubUrl: string
  lineNumber?: number
}

// GitHub API types
export interface GitHubFileResponse {
  content: string
  encoding: string
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
}

// UI component types
export interface SourceBadgeProps {
  jsonPath: string
  locale: LocaleCode
  value?: unknown
}

export interface SourcePanelProps {
  jsonPath: string
  locale: LocaleCode
  isOpen: boolean
  onClose: () => void
}

export interface LocaleSelectorProps {
  value: LocaleCode
  onChange: (locale: LocaleCode) => void
}

// Store types
export interface LocaleStore {
  selectedLocale: LocaleCode
  comparisonLocales: LocaleCode[]
  recentLocales: LocaleCode[]
  setLocale: (locale: LocaleCode) => void
  addComparisonLocale: (locale: LocaleCode) => void
  removeComparisonLocale: (locale: LocaleCode) => void
  toggleComparisonMode: () => void
  isComparisonMode: boolean
}
