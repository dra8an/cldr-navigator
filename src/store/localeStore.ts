import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocaleStore, LocaleCode } from '@/types'

const MAX_RECENT_LOCALES = 10

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      selectedLocale: 'en-US',
      comparisonLocales: [],
      recentLocales: ['en-US'],
      isComparisonMode: false,

      setLocale: (locale: LocaleCode) => {
        set((state) => {
          // Add to recent locales if not already there
          const recentLocales = [
            locale,
            ...state.recentLocales.filter((l) => l !== locale),
          ].slice(0, MAX_RECENT_LOCALES)

          return {
            selectedLocale: locale,
            recentLocales,
          }
        })
      },

      addComparisonLocale: (locale: LocaleCode) => {
        set((state) => {
          // Don't add if already in comparison or is the selected locale
          if (
            state.comparisonLocales.includes(locale) ||
            state.selectedLocale === locale
          ) {
            return state
          }

          // Limit to 3 comparison locales
          const comparisonLocales = [...state.comparisonLocales, locale].slice(
            0,
            3
          )

          return {
            comparisonLocales,
            isComparisonMode: true,
          }
        })
      },

      removeComparisonLocale: (locale: LocaleCode) => {
        set((state) => {
          const comparisonLocales = state.comparisonLocales.filter(
            (l) => l !== locale
          )

          return {
            comparisonLocales,
            isComparisonMode: comparisonLocales.length > 0,
          }
        })
      },

      toggleComparisonMode: () => {
        set((state) => ({
          isComparisonMode: !state.isComparisonMode,
          // Clear comparison locales when disabling
          comparisonLocales: state.isComparisonMode
            ? []
            : state.comparisonLocales,
        }))
      },
    }),
    {
      name: 'cldr-navigator-locale-storage',
      partialize: (state) => ({
        selectedLocale: state.selectedLocale,
        recentLocales: state.recentLocales,
      }),
    }
  )
)
