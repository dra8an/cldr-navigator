import { useLocaleStore } from '@/store/localeStore'
import { ChevronDown } from 'lucide-react'

// Common locales for quick access
const COMMON_LOCALES = [
  { code: 'en-US', name: 'English (United States)' },
  { code: 'en-GB', name: 'English (United Kingdom)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'zh-Hans-CN', name: 'Chinese (Simplified, China)' },
  { code: 'ko-KR', name: 'Korean (South Korea)' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
  { code: 'ru-RU', name: 'Russian (Russia)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'tr-TR', name: 'Turkish (Turkey)' },
  { code: 'pl-PL', name: 'Polish (Poland)' },
]

export default function LocaleSelector() {
  const { selectedLocale, setLocale, recentLocales } = useLocaleStore()

  return (
    <div className="relative">
      <select
        value={selectedLocale}
        onChange={(e) => setLocale(e.target.value)}
        className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[240px]"
      >
        {recentLocales.length > 0 && (
          <optgroup label="Recent">
            {recentLocales.map((locale) => {
              const localeName =
                COMMON_LOCALES.find((l) => l.code === locale)?.name || locale
              return (
                <option key={`recent-${locale}`} value={locale}>
                  {localeName}
                </option>
              )
            })}
          </optgroup>
        )}

        <optgroup label="Common Locales">
          {COMMON_LOCALES.map((locale) => (
            <option key={locale.code} value={locale.code}>
              {locale.name}
            </option>
          ))}
        </optgroup>
      </select>

      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}
