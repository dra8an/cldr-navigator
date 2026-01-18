import { useState, useMemo } from 'react'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'
import { useLocaleStore } from '@/store/localeStore'
import { usePluralRules } from '@/hooks/useCldrData'
import { normalizeLocaleForCldr } from '@/lib/cldr/loader'

type TabType = 'cardinal' | 'ordinal'
type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

interface PluralRule {
  category: PluralCategory
  condition: string
  examples: {
    integers: string
    decimals: string
  }
}

export default function PluralRulesPage() {
  const { selectedLocale } = useLocaleStore()
  const { data: cardinalData, isLoading: cardinalLoading } = usePluralRules(selectedLocale, 'cardinal')
  const { data: ordinalData, isLoading: ordinalLoading } = usePluralRules(selectedLocale, 'ordinal')
  const [activeTab, setActiveTab] = useState<TabType>('cardinal')
  const [testNumber, setTestNumber] = useState('1')
  const [copiedCardinal, setCopiedCardinal] = useState(false)
  const [copiedOrdinal, setCopiedOrdinal] = useState(false)

  const normalizedLocale = normalizeLocaleForCldr(selectedLocale)

  const isLoading = cardinalLoading || ordinalLoading

  // Parse plural rules from CLDR data
  const parseRules = useMemo(() => {
    return (data: unknown, type: 'cardinal' | 'ordinal'): PluralRule[] => {
      if (!data || typeof data !== 'object') return []

      const supplemental = (data as { supplemental?: Record<string, unknown> }).supplemental
      if (!supplemental) return []

      const rulesData = supplemental[`plurals-type-${type}`] as Record<string, Record<string, string>> | undefined
      const localeRules = rulesData?.[normalizedLocale]
      if (!localeRules) return []

      const rules: PluralRule[] = []

      Object.entries(localeRules).forEach(([key, value]) => {
        const match = key.match(/pluralRule-count-(.+)/)
        if (!match) return

        const category = match[1] as PluralCategory
        const ruleText = value as string

        // Parse the rule text to extract condition and examples
        // Format: "condition @integer examples @decimal examples"
        const intMatch = ruleText.match(/@integer\s+([^@]+)/)
        const decMatch = ruleText.match(/@decimal\s+(.+)/)
        const condition = ruleText.split('@')[0].trim()

        rules.push({
          category,
          condition: condition || '(all others)',
          examples: {
            integers: intMatch ? intMatch[1].trim() : '',
            decimals: decMatch ? decMatch[1].trim() : '',
          },
        })
      })

      // Sort by category order
      const order: PluralCategory[] = ['zero', 'one', 'two', 'few', 'many', 'other']
      return rules.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category))
    }
  }, [normalizedLocale])

  const cardinalRules = useMemo(
    () => parseRules(cardinalData, 'cardinal'),
    [cardinalData, parseRules]
  )

  const ordinalRules = useMemo(
    () => parseRules(ordinalData, 'ordinal'),
    [ordinalData, parseRules]
  )

  const currentRules = activeTab === 'cardinal' ? cardinalRules : ordinalRules

  // Get plural category for a number using Intl.PluralRules
  const getCategory = useMemo(() => {
    return (num: number, type: 'cardinal' | 'ordinal'): string => {
      try {
        const pr = new Intl.PluralRules(selectedLocale, { type })
        return pr.select(num)
      } catch {
        return 'other'
      }
    }
  }, [selectedLocale])

  const testCategory = useMemo(() => {
    const num = parseFloat(testNumber)
    if (isNaN(num)) return 'invalid'
    return getCategory(num, activeTab)
  }, [testNumber, activeTab, getCategory])

  // Generate example text for cardinal numbers (quantity)
  const getCardinalExample = (num: number): string[] => {
    const category = getCategory(num, 'cardinal')
    const numStr = num.toString()

    // Return multiple examples showing quantity
    return [
      `${numStr} apple${category === 'one' ? '' : 's'}`,
      `${numStr} item${category === 'one' ? '' : 's'}`,
      `${numStr} person${category === 'one' ? '' : category === 'other' ? 's' : 's'}`,
      `${numStr} day${category === 'one' ? '' : 's'}`,
    ]
  }

  // Generate example text for ordinal numbers (position)
  const getOrdinalExample = (num: number): string[] => {
    // Use Intl.PluralRules to get the ordinal suffix category
    const pr = new Intl.PluralRules(selectedLocale, { type: 'ordinal' })
    const category = pr.select(num)

    // For English, map categories to suffixes
    let suffix = 'th'
    if (selectedLocale.startsWith('en')) {
      const suffixMap: Record<string, string> = {
        one: 'st',
        two: 'nd',
        few: 'rd',
        other: 'th',
      }
      suffix = suffixMap[category] || 'th'
    }

    const numStr = num.toString()

    // Return multiple examples showing position/ranking
    return [
      `${numStr}${suffix} place`,
      `${numStr}${suffix} floor`,
      `${numStr}${suffix} position`,
      `${numStr}${suffix} day`,
    ]
  }

  // Copy code to clipboard
  const copyToClipboard = async (text: string, type: 'cardinal' | 'ordinal') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'cardinal') {
        setCopiedCardinal(true)
        setTimeout(() => setCopiedCardinal(false), 2000)
      } else {
        setCopiedOrdinal(true)
        setTimeout(() => setCopiedOrdinal(false), 2000)
      }
    } catch {
      // Silently fail if clipboard API is not available
    }
  }

  // Get category badge color
  const getCategoryColor = (category: PluralCategory) => {
    const colors: Record<PluralCategory, string> = {
      zero: 'bg-slate-100 text-slate-800 border-slate-300',
      one: 'bg-blue-100 text-blue-800 border-blue-300',
      two: 'bg-green-100 text-green-800 border-green-300',
      few: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      many: 'bg-orange-100 text-orange-800 border-orange-300',
      other: 'bg-purple-100 text-purple-800 border-purple-300',
    }
    return colors[category] || colors.other
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">
          Loading plural rules for {selectedLocale}...
        </span>
      </div>
    )
  }

  if (!cardinalRules.length && !ordinalRules.length) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
        <div className="flex items-center gap-2 text-destructive mb-2">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-semibold">No Plural Rules Found</h3>
        </div>
        <p className="text-sm">
          No plural rules data available for locale: {normalizedLocale}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Plural Rules</h1>
        <p className="text-muted-foreground">
          Explore plural categorization rules for{' '}
          <span className="font-mono font-semibold text-foreground">
            {selectedLocale}
          </span>
          {' '}(using CLDR data for <span className="font-mono">{normalizedLocale}</span>)
        </p>
        <div className="mt-3 px-4 py-2 bg-muted/50 border border-muted rounded-md text-sm">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> CLDR defines plural categories (zero, one, two, few, many, other) used for correct pluralization in different languages. Not all languages use all categories.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('cardinal')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'cardinal'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Cardinal ({cardinalRules.length} categories)
          </button>
          <button
            onClick={() => setActiveTab('ordinal')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'ordinal'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Ordinal ({ordinalRules.length} categories)
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Overview */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {activeTab === 'cardinal' ? 'Cardinal' : 'Ordinal'} Plural Rules
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {activeTab === 'cardinal'
              ? 'Cardinal numbers express quantity (e.g., "1 apple", "5 apples"). These rules determine which plural form to use based on the count.'
              : 'Ordinal numbers express position or ranking (e.g., "1st place", "22nd floor"). These rules determine the ordinal suffix based on the number.'}
          </p>

          <div className="space-y-4">
            {currentRules.map((rule) => (
              <div key={rule.category} className="p-4 bg-muted rounded">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                      rule.category
                    )}`}
                  >
                    {rule.category}
                  </span>
                </div>

                {/* Condition */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Condition:
                  </div>
                  <div className="font-mono text-sm bg-background px-3 py-2 rounded border">
                    {rule.condition || '(default - matches all other numbers)'}
                  </div>
                </div>

                {/* Examples */}
                <div className="grid md:grid-cols-2 gap-4">
                  {rule.examples.integers && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Integer Examples:
                      </div>
                      <div className="text-sm font-mono bg-background px-3 py-2 rounded border">
                        {rule.examples.integers}
                      </div>
                    </div>
                  )}

                  {rule.examples.decimals && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Decimal Examples:
                      </div>
                      <div className="text-sm font-mono bg-background px-3 py-2 rounded border">
                        {rule.examples.decimals}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Tester */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Try It Yourself</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Enter a number to see which {activeTab} plural category it belongs to for {selectedLocale}.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Enter a number:
              </label>
              <input
                type="text"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                placeholder="e.g., 1, 2.5, 21, 100"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {testCategory !== 'invalid' && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Category:
                    </span>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${getCategoryColor(
                        testCategory as PluralCategory
                      )}`}
                    >
                      {testCategory}
                    </span>
                  </div>

                  {/* Show examples */}
                  <div className="mb-4">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      {activeTab === 'cardinal'
                        ? 'Examples (quantity):'
                        : 'Examples (position/ranking):'}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(activeTab === 'cardinal'
                        ? getCardinalExample(parseFloat(testNumber))
                        : getOrdinalExample(parseFloat(testNumber))
                      ).map((example, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-background rounded border text-sm font-medium"
                        >
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Show the rule for this category */}
                  {currentRules.find((r) => r.category === testCategory) && (
                    <div className="pt-4 border-t border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Rule Applied:
                      </div>
                      <div className="font-mono text-sm bg-background px-3 py-2 rounded border">
                        {currentRules.find((r) => r.category === testCategory)?.condition}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {testCategory === 'invalid' && testNumber && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
                Please enter a valid number
              </div>
            )}
          </div>
        </div>

        {/* Quick Reference */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Reference</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5, 10, 11, 20, 21, 22, 100, 101, 1000].map((num) => {
                const cat = getCategory(num, activeTab)
                return (
                  <div key={num} className="p-2 bg-muted rounded text-center">
                    <div className="font-mono font-semibold text-lg">{num}</div>
                    <div
                      className={`mt-1 px-2 py-0.5 rounded text-xs font-medium border ${getCategoryColor(
                        cat as PluralCategory
                      )}`}
                    >
                      {cat}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Using with Intl.PluralRules */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Using with JavaScript</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You can use the native <code className="px-1 py-0.5 bg-muted rounded text-xs">Intl.PluralRules</code> API to determine plural categories in your code:
          </p>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Cardinal Example:
              </div>
              <div className="relative">
                <div className="font-mono text-sm bg-slate-950 text-green-400 px-4 py-3 rounded-lg border border-slate-800 overflow-x-auto">
                  <pre className="whitespace-pre">{`const pr = new Intl.PluralRules('${selectedLocale}', { type: 'cardinal' })
console.log(pr.select(1))    // "${getCategory(1, 'cardinal')}"
console.log(pr.select(2))    // "${getCategory(2, 'cardinal')}"
console.log(pr.select(5))    // "${getCategory(5, 'cardinal')}"`}</pre>
                </div>
                <button
                  onClick={() => copyToClipboard(
                    `const pr = new Intl.PluralRules('${selectedLocale}', { type: 'cardinal' })\nconsole.log(pr.select(1))    // "${getCategory(1, 'cardinal')}"\nconsole.log(pr.select(2))    // "${getCategory(2, 'cardinal')}"\nconsole.log(pr.select(5))    // "${getCategory(5, 'cardinal')}"`,
                    'cardinal'
                  )}
                  className="absolute top-2 right-2 p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedCardinal ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Ordinal Example:
              </div>
              <div className="relative">
                <div className="font-mono text-sm bg-slate-950 text-green-400 px-4 py-3 rounded-lg border border-slate-800 overflow-x-auto">
                  <pre className="whitespace-pre">{`const pr = new Intl.PluralRules('${selectedLocale}', { type: 'ordinal' })
console.log(pr.select(1))    // "${getCategory(1, 'ordinal')}"
console.log(pr.select(2))    // "${getCategory(2, 'ordinal')}"
console.log(pr.select(21))   // "${getCategory(21, 'ordinal')}"`}</pre>
                </div>
                <button
                  onClick={() => copyToClipboard(
                    `const pr = new Intl.PluralRules('${selectedLocale}', { type: 'ordinal' })\nconsole.log(pr.select(1))    // "${getCategory(1, 'ordinal')}"\nconsole.log(pr.select(2))    // "${getCategory(2, 'ordinal')}"\nconsole.log(pr.select(21))   // "${getCategory(21, 'ordinal')}"`,
                    'ordinal'
                  )}
                  className="absolute top-2 right-2 p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedOrdinal ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
