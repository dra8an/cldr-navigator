import { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { useLocaleStore } from '@/store/localeStore'
import { useNumberData } from '@/hooks/useCldrData'
import { buildJsonPath } from '@/lib/mapping/resolver'
import { normalizeLocaleForCldr } from '@/lib/cldr/loader'
import SourceBadge from '@/components/source/SourceBadge'

export default function NumbersPage() {
  const { selectedLocale } = useLocaleStore()
  const { data, isLoading, error } = useNumberData(selectedLocale)
  const [customNumber, setCustomNumber] = useState('1234567.89')

  // Get the normalized locale for accessing CLDR data
  const normalizedLocale = normalizeLocaleForCldr(selectedLocale)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">
          Loading number data for {selectedLocale}...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
        <div className="flex items-center gap-2 text-destructive mb-2">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-semibold">Error Loading Data</h3>
        </div>
        <p className="text-sm">
          Failed to load number data: {(error as Error).message}
        </p>
      </div>
    )
  }

  const numbers = data?.main?.[normalizedLocale]?.numbers
  const symbols = numbers?.['symbols-numberSystem-latn']
  const decimalFormats = numbers?.['decimalFormats-numberSystem-latn']
  const percentFormats = numbers?.['percentFormats-numberSystem-latn']
  const currencyFormats = numbers?.['currencyFormats-numberSystem-latn']
  const scientificFormats = numbers?.['scientificFormats-numberSystem-latn']

  // Format a number using the locale's patterns
  const formatNumber = (num: number) => {
    try {
      return new Intl.NumberFormat(selectedLocale).format(num)
    } catch {
      return num.toString()
    }
  }

  const formatPercent = (num: number) => {
    try {
      return new Intl.NumberFormat(selectedLocale, {
        style: 'percent',
        minimumFractionDigits: 2,
      }).format(num)
    } catch {
      return num.toString()
    }
  }

  const formatCurrency = (num: number) => {
    try {
      // Use USD as default currency for demonstration
      return new Intl.NumberFormat(selectedLocale, {
        style: 'currency',
        currency: 'USD',
      }).format(num)
    } catch {
      return num.toString()
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Number Formatting</h1>
        <p className="text-muted-foreground">
          Explore number formatting patterns, symbols, and formats for{' '}
          <span className="font-mono font-semibold text-foreground">
            {selectedLocale}
          </span>
          {' '}(using CLDR data for <span className="font-mono">{normalizedLocale}</span>)
        </p>
      </div>

      {/* Debug info - can be removed later */}
      {!symbols && !decimalFormats && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-yellow-900">Debug Info:</p>
          <p className="text-yellow-800">Data loaded: {data ? 'Yes' : 'No'}</p>
          <p className="text-yellow-800">Main keys: {data?.main ? Object.keys(data.main).join(', ') : 'None'}</p>
          <p className="text-yellow-800">Numbers object: {numbers ? 'Found' : 'Not found'}</p>
          <p className="text-yellow-800">Symbols: {symbols ? 'Found' : 'Not found'}</p>
        </div>
      )}

      {/* Number Symbols */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Number Symbols</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {symbols?.decimal && (
            <div className="p-4 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Decimal Separator
                </label>
                <SourceBadge
                  jsonPath={buildJsonPath(
                    normalizedLocale,
                    'numbers',
                    'symbols-numberSystem-latn',
                    'decimal'
                  )}
                  locale={normalizedLocale}
                />
              </div>
              <div className="text-2xl font-mono">{symbols.decimal}</div>
            </div>
          )}

          {symbols?.group && (
            <div className="p-4 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Grouping Separator
                </label>
                <SourceBadge
                  jsonPath={buildJsonPath(
                    selectedLocale,
                    'numbers',
                    'symbols-numberSystem-latn',
                    'group'
                  )}
                  locale={normalizedLocale}
                />
              </div>
              <div className="text-2xl font-mono">{symbols.group}</div>
            </div>
          )}

          {symbols?.percentSign && (
            <div className="p-4 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Percent Sign
                </label>
                <SourceBadge
                  jsonPath={buildJsonPath(
                    selectedLocale,
                    'numbers',
                    'symbols-numberSystem-latn',
                    'percentSign'
                  )}
                  locale={normalizedLocale}
                />
              </div>
              <div className="text-2xl font-mono">{symbols.percentSign}</div>
            </div>
          )}

          {symbols?.plusSign && (
            <div className="p-4 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Plus Sign
                </label>
                <SourceBadge
                  jsonPath={buildJsonPath(
                    selectedLocale,
                    'numbers',
                    'symbols-numberSystem-latn',
                    'plusSign'
                  )}
                  locale={normalizedLocale}
                />
              </div>
              <div className="text-2xl font-mono">{symbols.plusSign}</div>
            </div>
          )}

          {symbols?.minusSign && (
            <div className="p-4 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Minus Sign
                </label>
                <SourceBadge
                  jsonPath={buildJsonPath(
                    selectedLocale,
                    'numbers',
                    'symbols-numberSystem-latn',
                    'minusSign'
                  )}
                  locale={normalizedLocale}
                />
              </div>
              <div className="text-2xl font-mono">{symbols.minusSign}</div>
            </div>
          )}

          {symbols?.exponential && (
            <div className="p-4 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Exponential
                </label>
                <SourceBadge
                  jsonPath={buildJsonPath(
                    selectedLocale,
                    'numbers',
                    'symbols-numberSystem-latn',
                    'exponential'
                  )}
                  locale={normalizedLocale}
                />
              </div>
              <div className="text-2xl font-mono">{symbols.exponential}</div>
            </div>
          )}
        </div>
      </div>

      {/* Number Patterns */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Number Patterns</h2>
        <div className="space-y-4">
          {decimalFormats?.standard && (
            <div className="p-4 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Decimal Format Pattern
                </label>
                <SourceBadge
                  jsonPath={buildJsonPath(
                    selectedLocale,
                    'numbers',
                    'decimalFormats-numberSystem-latn',
                    'standard'
                  )}
                  locale={normalizedLocale}
                />
              </div>
              <div className="font-mono text-sm mb-2">
                {decimalFormats.standard}
              </div>
              <div className="text-xs text-muted-foreground">
                Example: {formatNumber(1234567.89)}
              </div>
            </div>
          )}

          {percentFormats?.standard && (
            <div className="p-4 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Percent Format Pattern
                </label>
                <SourceBadge
                  jsonPath={buildJsonPath(
                    selectedLocale,
                    'numbers',
                    'percentFormats-numberSystem-latn',
                    'standard'
                  )}
                  locale={normalizedLocale}
                />
              </div>
              <div className="font-mono text-sm mb-2">
                {percentFormats.standard}
              </div>
              <div className="text-xs text-muted-foreground">
                Example: {formatPercent(0.42)}
              </div>
            </div>
          )}

          {currencyFormats?.standard && (
            <div className="p-4 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Currency Format Pattern
                </label>
                <SourceBadge
                  jsonPath={buildJsonPath(
                    selectedLocale,
                    'numbers',
                    'currencyFormats-numberSystem-latn',
                    'standard'
                  )}
                  locale={normalizedLocale}
                />
              </div>
              <div className="font-mono text-sm mb-2">
                {currencyFormats.standard}
              </div>
              <div className="text-xs text-muted-foreground">
                Example: {formatCurrency(1234.56)}
              </div>
            </div>
          )}

          {scientificFormats?.standard && (
            <div className="p-4 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Scientific Format Pattern
                </label>
                <SourceBadge
                  jsonPath={buildJsonPath(
                    selectedLocale,
                    'numbers',
                    'scientificFormats-numberSystem-latn',
                    'standard'
                  )}
                  locale={normalizedLocale}
                />
              </div>
              <div className="font-mono text-sm mb-2">
                {scientificFormats.standard}
              </div>
              <div className="text-xs text-muted-foreground">
                Example: {(1234567.89).toExponential()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Formatter */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Try It Yourself</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter a number to see how it's formatted in {selectedLocale}
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter a number:
            </label>
            <input
              type="text"
              value={customNumber}
              onChange={(e) => setCustomNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="1234567.89"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Decimal
              </div>
              <div className="text-lg font-mono">
                {formatNumber(parseFloat(customNumber) || 0)}
              </div>
            </div>

            <div className="p-4 bg-muted rounded">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Percent
              </div>
              <div className="text-lg font-mono">
                {formatPercent((parseFloat(customNumber) || 0) / 100)}
              </div>
            </div>

            <div className="p-4 bg-muted rounded">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Currency (USD)
              </div>
              <div className="text-lg font-mono">
                {formatCurrency(parseFloat(customNumber) || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Default Numbering System */}
      {numbers?.defaultNumberingSystem && (
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Default Numbering System:
              </span>
              <span className="ml-2 font-mono font-semibold">
                {numbers.defaultNumberingSystem}
              </span>
            </div>
            <SourceBadge
              jsonPath={buildJsonPath(
                selectedLocale,
                'numbers',
                'defaultNumberingSystem'
              )}
              locale={normalizedLocale}
            />
          </div>
        </div>
      )}
    </div>
  )
}
