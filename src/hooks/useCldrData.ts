import { useQuery } from '@tanstack/react-query'
import type { LocaleCode } from '@/types'
import {
  loadNumberData,
  loadDateData,
  loadCurrencyData,
  loadLocaleDisplayNames,
  loadPluralRules,
  loadPluralRanges,
  getCldrValue,
} from '@/lib/cldr/loader'

type CldrDataType = 'numbers' | 'dates' | 'currencies' | 'localeNames'

/**
 * Hook to load CLDR data for a specific locale and data type
 */
export function useCldrData(locale: LocaleCode, dataType: CldrDataType) {
  return useQuery({
    queryKey: ['cldr-data', locale, dataType],
    queryFn: async () => {
      switch (dataType) {
        case 'numbers':
          return await loadNumberData(locale)
        case 'dates':
          return await loadDateData(locale)
        case 'currencies':
          return await loadCurrencyData(locale)
        case 'localeNames':
          return await loadLocaleDisplayNames(locale)
        default:
          throw new Error(`Unknown data type: ${dataType}`)
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

/**
 * Hook to get a specific value from CLDR data using a JSON path
 */
export function useCldrValue(
  locale: LocaleCode,
  dataType: CldrDataType,
  jsonPath: string
) {
  const { data, isLoading, error } = useCldrData(locale, dataType)

  const value = data ? getCldrValue(data, jsonPath) : undefined

  return {
    value,
    isLoading,
    error,
    data,
  }
}

/**
 * Hook to load number data specifically
 */
export function useNumberData(locale: LocaleCode) {
  return useCldrData(locale, 'numbers')
}

/**
 * Hook to load date data specifically
 */
export function useDateData(locale: LocaleCode) {
  return useCldrData(locale, 'dates')
}

/**
 * Hook to load currency data specifically
 */
export function useCurrencyData(locale: LocaleCode) {
  return useCldrData(locale, 'currencies')
}

/**
 * Hook to load locale display names
 */
export function useLocaleNames(locale: LocaleCode) {
  return useCldrData(locale, 'localeNames')
}

/**
 * Hook to load plural rules for a locale
 */
export function usePluralRules(
  locale: LocaleCode,
  type: 'cardinal' | 'ordinal' = 'cardinal'
) {
  return useQuery({
    queryKey: ['cldr-plural-rules', locale, type],
    queryFn: async () => {
      return await loadPluralRules(locale, type)
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

/**
 * Hook to load plural ranges for a locale
 */
export function usePluralRanges(locale: LocaleCode) {
  return useQuery({
    queryKey: ['cldr-plural-ranges', locale],
    queryFn: async () => {
      return await loadPluralRanges(locale)
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}
