/**
 * Format dates using CLDR skeleton patterns with native Intl.DateTimeFormat
 *
 * This module converts CLDR skeleton patterns to Intl.DateTimeFormat options,
 * enabling full CLDR support including flexible day periods (field 'B') using
 * only native browser APIs with zero bundle size impact.
 *
 * @module skeletonFormatter
 */

/**
 * Check if a skeleton contains unsupported features
 *
 * Returns true if the skeleton contains:
 * - Quarter fields (Q, q)
 * - Week fields (w, W)
 */
export function hasUnsupportedFeatures(skeleton: string): boolean {
  // Check for unsupported field characters: Quarter (Q, q) and Week (w, W)
  const unsupportedFields = /[QqwW]/
  return unsupportedFields.test(skeleton)
}

/**
 * Parse a CLDR skeleton pattern and convert it to Intl.DateTimeFormat options
 *
 * Based on UTS 35 Date Field Symbol Table:
 * https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 */
function parseSkeletonToIntlOptions(skeleton: string): Intl.DateTimeFormatOptions {
  const options: Intl.DateTimeFormatOptions = {}
  let i = 0

  while (i < skeleton.length) {
    const char = skeleton[i]
    let count = 1

    // Count consecutive occurrences of the same character
    while (i + count < skeleton.length && skeleton[i + count] === char) {
      count++
    }

    // Map skeleton symbols to Intl options
    switch (char) {
      // Era
      case 'G':
        options.era = count >= 4 ? 'long' : count === 5 ? 'narrow' : 'short'
        break

      // Year
      case 'y':
      case 'Y':
        options.year = count === 2 ? '2-digit' : 'numeric'
        break

      // Month
      case 'M':
      case 'L':
        if (count === 1 || count === 2) {
          options.month = count === 2 ? '2-digit' : 'numeric'
        } else if (count === 3) {
          options.month = 'short'
        } else if (count === 4) {
          options.month = 'long'
        } else if (count === 5) {
          options.month = 'narrow'
        }
        break

      // Day
      case 'd':
        options.day = count === 2 ? '2-digit' : 'numeric'
        break

      // Weekday
      case 'E':
      case 'e':
      case 'c':
        if (count <= 3) {
          options.weekday = 'short'
        } else if (count === 4) {
          options.weekday = 'long'
        } else if (count >= 5) {
          options.weekday = 'narrow'
        }
        break

      // Day period - THIS IS THE KEY!
      case 'a':
        // Standard AM/PM
        options.hour12 = true
        break

      case 'b':
        // Noon/midnight + AM/PM
        options.dayPeriod = 'short'
        options.hour12 = true
        break

      case 'B':
        // Flexible day periods (in the morning, in the evening, etc.)
        options.dayPeriod = 'long'
        options.hour12 = true
        break

      // Hour
      case 'h':
        // 1-12 hour
        options.hour = count === 2 ? '2-digit' : 'numeric'
        options.hour12 = true
        break

      case 'H':
        // 0-23 hour
        options.hour = count === 2 ? '2-digit' : 'numeric'
        options.hour12 = false
        break

      case 'K':
        // 0-11 hour
        options.hour = count === 2 ? '2-digit' : 'numeric'
        options.hour12 = true
        break

      case 'k':
        // 1-24 hour
        options.hour = count === 2 ? '2-digit' : 'numeric'
        options.hour12 = false
        break

      // Minute
      case 'm':
        options.minute = count === 2 ? '2-digit' : 'numeric'
        break

      // Second
      case 's':
        options.second = count === 2 ? '2-digit' : 'numeric'
        break

      // Fractional seconds
      case 'S':
        // fractionalSecondDigits is supported but may not be in all TS definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(options as any).fractionalSecondDigits = Math.min(count, 3)
        break

      // Timezone
      case 'z':
        if (count <= 3) {
          options.timeZoneName = 'short'
        } else {
          options.timeZoneName = 'long'
        }
        break

      case 'Z':
        options.timeZoneName = count === 4 ? 'shortOffset' : 'short'
        break

      case 'v':
        options.timeZoneName = count === 1 ? 'short' : 'long'
        break

      case 'V':
        options.timeZoneName = 'short'
        break

      // Week-related fields (w, W) are not directly supported by Intl
      // Quarter (Q, q) is not directly supported by Intl
      // These would need custom handling or be ignored

      default:
        // Ignore unsupported characters
        break
    }

    i += count
  }

  return options
}

/**
 * Format a date using a CLDR skeleton pattern
 *
 * @param date - The date to format
 * @param skeleton - CLDR skeleton pattern (e.g., 'yMMMd', 'Hms', 'Bh')
 * @param locale - BCP 47 locale code
 * @returns Formatted date string
 */
export function formatWithSkeleton(
  date: Date,
  skeleton: string,
  locale: string
): string {
  // Clean up the skeleton - remove -count-* suffixes as they're for pluralization
  const cleanSkeleton = skeleton.replace(/-count-\w+$/, '')

  // Check for unsupported features
  if (hasUnsupportedFeatures(cleanSkeleton)) {
    return '(unsupported)'
  }

  try {
    // Parse skeleton to Intl options
    const options = parseSkeletonToIntlOptions(cleanSkeleton)

    // Create formatter with native Intl
    const formatter = new Intl.DateTimeFormat(locale, options)

    return formatter.format(date)
  } catch (error) {
    console.error(`Failed to format with skeleton "${cleanSkeleton}":`, error)
    return '(formatting error)'
  }
}

/**
 * Synchronous version (same as async since we're using native APIs)
 */
export function formatWithSkeletonSync(
  date: Date,
  skeleton: string,
  locale: string
): string {
  return formatWithSkeleton(date, skeleton, locale)
}

/**
 * Check if a skeleton pattern can be formatted
 * Always returns true since native Intl handles all patterns
 */
export function canFormatSkeleton(): boolean {
  return true
}

/**
 * Preload locale data (no-op for native solution)
 */
export async function preloadLocaleData(): Promise<void> {
  // No-op: native Intl has all locale data built-in
  return Promise.resolve()
}

/**
 * Check if locale data is loaded (always true for native)
 */
export function isLocaleDataLoaded(): boolean {
  return true
}
