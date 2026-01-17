import type { CldrData, LocaleCode } from '@/types'
import { localeData } from './locale-data'

/**
 * Cache for loaded CLDR data to avoid redundant imports
 */
const cldrCache = new Map<string, Promise<unknown>>()

/**
 * Normalizes locale code to match CLDR file structure
 * e.g., 'en-US' -> 'en', 'zh-Hans-CN' -> 'zh-Hans'
 */
export function normalizeLocaleForCldr(locale: LocaleCode): string {
  // CLDR uses different structures for different locales
  // Most use just language code, some use language-script
  const parts = locale.split('-')

  // Special cases that use language-script format
  const scriptLocales = ['zh-Hans', 'zh-Hant', 'sr-Latn', 'sr-Cyrl']
  const langScript = `${parts[0]}-${parts[1]}`

  if (parts.length > 1 && scriptLocales.includes(langScript)) {
    return langScript
  }

  // Default to language code only
  return parts[0]
}

/**
 * Dynamically imports CLDR number data for a locale
 */
export async function loadNumberData(locale: LocaleCode): Promise<CldrData> {
  const normalizedLocale = normalizeLocaleForCldr(locale)
  const cacheKey = `numbers-${normalizedLocale}`

  if (!cldrCache.has(cacheKey)) {
    const data = (localeData.numbers as unknown as Record<string, CldrData>)[normalizedLocale]

    if (!data) {
      throw new Error(`CLDR number data not found for locale: ${normalizedLocale}. Available locales: ${Object.keys(localeData.numbers).join(', ')}`)
    }

    const loadPromise = Promise.resolve(data)
    cldrCache.set(cacheKey, loadPromise)
  }

  return cldrCache.get(cacheKey) as Promise<CldrData>
}

/**
 * Dynamically imports CLDR date data for a locale
 */
export async function loadDateData(locale: LocaleCode): Promise<CldrData> {
  const normalizedLocale = normalizeLocaleForCldr(locale)
  const cacheKey = `dates-${normalizedLocale}`

  if (!cldrCache.has(cacheKey)) {
    const data = (localeData.dates as unknown as Record<string, CldrData>)[normalizedLocale]

    if (!data) {
      throw new Error(`CLDR date data not found for locale: ${normalizedLocale}`)
    }

    const loadPromise = Promise.resolve(data)
    cldrCache.set(cacheKey, loadPromise)
  }

  return cldrCache.get(cacheKey) as Promise<CldrData>
}

/**
 * Dynamically imports CLDR locale display names data
 */
export async function loadLocaleDisplayNames(locale: LocaleCode): Promise<CldrData> {
  const normalizedLocale = normalizeLocaleForCldr(locale)
  const cacheKey = `localenames-${normalizedLocale}`

  if (!cldrCache.has(cacheKey)) {
    const data = (localeData.localeNames as unknown as Record<string, CldrData>)[normalizedLocale]

    if (!data) {
      throw new Error(`CLDR locale names not found for locale: ${normalizedLocale}`)
    }

    const loadPromise = Promise.resolve(data)
    cldrCache.set(cacheKey, loadPromise)
  }

  return cldrCache.get(cacheKey) as Promise<CldrData>
}

/**
 * Dynamically imports CLDR currency data for a locale
 */
export async function loadCurrencyData(locale: LocaleCode): Promise<CldrData> {
  const normalizedLocale = normalizeLocaleForCldr(locale)
  const cacheKey = `currencies-${normalizedLocale}`

  if (!cldrCache.has(cacheKey)) {
    const data = (localeData.currencies as unknown as Record<string, CldrData>)[normalizedLocale]

    if (!data) {
      throw new Error(`CLDR currency data not found for locale: ${normalizedLocale}`)
    }

    const loadPromise = Promise.resolve(data)
    cldrCache.set(cacheKey, loadPromise)
  }

  return cldrCache.get(cacheKey) as Promise<CldrData>
}

/**
 * Gets a value from CLDR data using a JSON path
 * Example: getCldrValue(data, 'main.en.numbers.symbols-numberSystem-latn.decimal')
 */
export function getCldrValue(data: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = data

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }

  return current
}

/**
 * Lists all available locales from CLDR core supplemental data
 */
export async function getAvailableLocales(): Promise<string[]> {
  const cacheKey = 'available-locales'

  if (!cldrCache.has(cacheKey)) {
    const availableLocalesData = localeData.core.availableLocales as Record<string, Record<string, string[]>>
    const loadPromise = Promise.resolve(
      availableLocalesData.availableLocales.full as string[]
    )

    cldrCache.set(cacheKey, loadPromise)
  }

  return cldrCache.get(cacheKey) as Promise<string[]>
}

/**
 * Gets locale display information
 */
export async function getLocaleInfo(locale: LocaleCode): Promise<{
  language: string
  region?: string
  script?: string
}> {
  const normalizedLocale = normalizeLocaleForCldr(locale)
  const cacheKey = `locale-info-${normalizedLocale}`

  if (!cldrCache.has(cacheKey)) {
    const loadPromise = Promise.resolve({
      language: locale.split('-')[0],
      script: locale.split('-').length > 1 && locale.split('-')[1].length === 4
        ? locale.split('-')[1]
        : undefined,
      region: locale.split('-').length > 1 && locale.split('-')[locale.split('-').length - 1].length === 2
        ? locale.split('-')[locale.split('-').length - 1]
        : undefined,
    })

    cldrCache.set(cacheKey, loadPromise)
  }

  return cldrCache.get(cacheKey) as Promise<{ language: string; region?: string; script?: string }>
}

/**
 * Clears the CLDR cache (useful for testing)
 */
export function clearCldrCache(): void {
  cldrCache.clear()
}
