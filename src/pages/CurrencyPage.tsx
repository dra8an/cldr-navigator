import { useState, useMemo } from 'react'
import { Loader2, AlertCircle, Search } from 'lucide-react'
import { useLocaleStore } from '@/store/localeStore'
import { useCurrencyData, useNumberData } from '@/hooks/useCldrData'
import { buildJsonPath } from '@/lib/mapping/resolver'
import { normalizeLocaleForCldr } from '@/lib/cldr/loader'
import SourceBadge from '@/components/source/SourceBadge'

type TabType = 'overview' | 'major' | 'all' | 'try-it'

const MAJOR_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY',
  'HKD', 'NZD', 'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR',
  'RUB', 'ZAR', 'TRY', 'BRL', 'TWD', 'DKK', 'PLN', 'THB'
]

export default function CurrencyPage() {
  const { selectedLocale } = useLocaleStore()
  const { data: currencyData, isLoading: currencyLoading, error: currencyError } = useCurrencyData(selectedLocale)
  const { data: numberData, isLoading: numberLoading, error: numberError } = useNumberData(selectedLocale)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [amount, setAmount] = useState(1234.56)

  const normalizedLocale = normalizeLocaleForCldr(selectedLocale)

  const isLoading = currencyLoading || numberLoading
  const error = currencyError || numberError

  const currencies = currencyData?.main?.[normalizedLocale]?.numbers?.currencies
  const numbers = numberData?.main?.[normalizedLocale]?.numbers
  const currencyFormats = numbers?.['currencyFormats-numberSystem-latn']

  // Get all currency codes - must be called before any early returns
  const allCurrencyCodes = useMemo(() => {
    return Object.keys(currencies || {}).sort()
  }, [currencies])

  // Filter currencies based on search - must be called before any early returns
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return allCurrencyCodes

    const query = searchQuery.toLowerCase()
    return allCurrencyCodes.filter(code => {
      const currency = currencies?.[code]
      return (
        code.toLowerCase().includes(query) ||
        currency?.displayName?.toLowerCase().includes(query) ||
        currency?.symbol?.toLowerCase().includes(query)
      )
    })
  }, [allCurrencyCodes, searchQuery, currencies])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">
          Loading currency data for {selectedLocale}...
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
          Failed to load currency data: {(error as Error).message}
        </p>
      </div>
    )
  }

  // Format currency helper
  const formatCurrency = (value: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat(selectedLocale, {
        style: 'currency',
        currency: currencyCode,
      }).format(value)
    } catch {
      return `${currencyCode} ${value}`
    }
  }

  // Format currency with accounting style
  const formatCurrencyAccounting = (value: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat(selectedLocale, {
        style: 'currency',
        currency: currencyCode,
        currencySign: 'accounting',
      }).format(value)
    } catch {
      return `${currencyCode} ${value}`
    }
  }

  // Render a currency card
  const renderCurrencyCard = (code: string) => {
    const currency = currencies?.[code]
    if (!currency) return null

    return (
      <div key={code} className="p-4 bg-muted rounded">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-lg font-mono font-semibold">{code}</div>
            {currency.symbol && (
              <div className="text-2xl font-semibold mt-1">{currency.symbol}</div>
            )}
          </div>
          <div className="flex flex-col gap-1 items-end">
            {currency.displayName && (
              <SourceBadge
                jsonPath={buildJsonPath(
                  normalizedLocale,
                  'numbers',
                  'currencies',
                  code,
                  'displayName'
                )}
                locale={normalizedLocale}
              />
            )}
            {currency.symbol && (
              <SourceBadge
                jsonPath={buildJsonPath(
                  normalizedLocale,
                  'numbers',
                  'currencies',
                  code,
                  'symbol'
                )}
                locale={normalizedLocale}
              />
            )}
          </div>
        </div>
        {currency.displayName && (
          <div className="text-sm font-medium mb-2">{currency.displayName}</div>
        )}
        <div className="text-xs text-muted-foreground">
          Example: {formatCurrency(1234.56, code)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Currency</h1>
        <p className="text-muted-foreground">
          Explore currency symbols, display names, and formatting patterns for{' '}
          <span className="font-mono font-semibold text-foreground">
            {selectedLocale}
          </span>
          {' '}(using CLDR data for <span className="font-mono">{normalizedLocale}</span>)
        </p>
        <div className="mt-3 px-4 py-2 bg-muted/50 border border-muted rounded-md text-sm">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> CLDR includes data for 300+ currencies including modern, historical, and special currency codes.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('major')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'major'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Major Currencies
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            All Currencies
          </button>
          <button
            onClick={() => setActiveTab('try-it')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'try-it'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Try It Yourself
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Currency Format Patterns */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Currency Format Patterns</h2>
            <p className="text-sm text-muted-foreground mb-4">
              These patterns define how currency values are formatted. The ¤ symbol represents the currency symbol placeholder.
            </p>
            <div className="space-y-4">
              {currencyFormats?.standard && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Standard Format
                    </label>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
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
                    Example: {formatCurrency(1234.56, 'USD')}
                  </div>
                </div>
              )}

              {currencyFormats?.accounting && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Accounting Format
                    </label>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'numbers',
                        'currencyFormats-numberSystem-latn',
                        'accounting'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="font-mono text-sm mb-2">
                    {currencyFormats.accounting}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Positive: {formatCurrencyAccounting(1234.56, 'USD')} | Negative: {formatCurrencyAccounting(-1234.56, 'USD')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Currency Examples */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Sample Currencies</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CNY'].map(code => renderCurrencyCard(code))}
            </div>
          </div>
        </div>
      )}

      {/* Major Currencies Tab */}
      {activeTab === 'major' && (
        <div className="space-y-8">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Major World Currencies</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The most commonly used currencies in international trade and finance.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MAJOR_CURRENCIES.filter(code => currencies?.[code]).map(code => renderCurrencyCard(code))}
            </div>
          </div>
        </div>
      )}

      {/* All Currencies Tab */}
      {activeTab === 'all' && (
        <div className="space-y-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">All Currencies</h2>
              <div className="text-sm text-muted-foreground">
                {filteredCurrencies.length} of {allCurrencyCodes.length} currencies
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by code, name, or symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Currency Grid */}
            {filteredCurrencies.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {filteredCurrencies.map(code => renderCurrencyCard(code))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No currencies found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Try It Yourself Tab */}
      {activeTab === 'try-it' && (
        <div className="space-y-8">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Interactive Currency Formatter</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter an amount and select a currency to see how it's formatted in {selectedLocale}
            </p>

            {/* Input Controls */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Amount:
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Currency:
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {MAJOR_CURRENCIES.filter(code => currencies?.[code]).map(code => (
                    <option key={code} value={code}>
                      {code} - {currencies?.[code]?.displayName || code}
                    </option>
                  ))}
                  <optgroup label="All Other Currencies">
                    {allCurrencyCodes
                      .filter(code => !MAJOR_CURRENCIES.includes(code) && currencies?.[code])
                      .map(code => (
                        <option key={code} value={code}>
                          {code} - {currencies?.[code]?.displayName || code}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Output Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Standard Format
                </div>
                <div className="text-2xl font-mono font-semibold">
                  {formatCurrency(amount, selectedCurrency)}
                </div>
              </div>

              <div className="p-4 bg-muted rounded">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Accounting Format
                </div>
                <div className="text-2xl font-mono font-semibold">
                  {formatCurrencyAccounting(amount, selectedCurrency)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {amount >= 0 ? 'Positive values use standard format' : 'Negative values shown in parentheses'}
                </div>
              </div>

              {currencies?.[selectedCurrency]?.symbol && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Currency Symbol
                    </div>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'numbers',
                        'currencies',
                        selectedCurrency,
                        'symbol'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="text-4xl font-semibold">
                    {currencies[selectedCurrency].symbol}
                  </div>
                </div>
              )}

              {currencies?.[selectedCurrency]?.['symbol-alt-narrow'] && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Narrow Symbol
                    </div>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'numbers',
                        'currencies',
                        selectedCurrency,
                        'symbol-alt-narrow'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="text-4xl font-semibold">
                    {currencies[selectedCurrency]['symbol-alt-narrow']}
                  </div>
                </div>
              )}

              {currencies?.[selectedCurrency]?.displayName && (
                <div className="p-4 bg-muted rounded md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Display Name
                    </div>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'numbers',
                        'currencies',
                        selectedCurrency,
                        'displayName'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="text-lg font-medium">
                    {currencies[selectedCurrency].displayName}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
