// Intl.Segmenter type declarations
// This API is supported in all modern browsers but TypeScript doesn't include types by default

interface IntlSegmenterOptions {
  localeMatcher?: 'best fit' | 'lookup'
  granularity?: 'grapheme' | 'word' | 'sentence'
}

interface IntlSegmentData {
  segment: string
  index: number
  input: string
  isWordLike?: boolean
}

interface IntlSegments {
  containing(index?: number): IntlSegmentData | undefined
  [Symbol.iterator](): IterableIterator<IntlSegmentData>
}

declare namespace Intl {
  class Segmenter {
    constructor(locales?: string | string[], options?: IntlSegmenterOptions)
    segment(input: string): IntlSegments
    resolvedOptions(): {
      locale: string
      granularity: 'grapheme' | 'word' | 'sentence'
    }
    static supportedLocalesOf(
      locales: string | string[],
      options?: { localeMatcher?: 'best fit' | 'lookup' }
    ): string[]
  }
}
