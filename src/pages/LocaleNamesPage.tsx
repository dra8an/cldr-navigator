import { useState, useMemo } from 'react'
import { Loader2, AlertCircle, Search } from 'lucide-react'
import { useLocaleStore } from '@/store/localeStore'
import { useLocaleNames } from '@/hooks/useCldrData'
import { buildJsonPath } from '@/lib/mapping/resolver'
import { normalizeLocaleForCldr } from '@/lib/cldr/loader'
import SourceBadge from '@/components/source/SourceBadge'

type TabType = 'overview' | 'languages' | 'territories' | 'scripts-variants'

export default function LocaleNamesPage() {
  const { selectedLocale } = useLocaleStore()
  const { data, isLoading, error } = useLocaleNames(selectedLocale)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [languageSearch, setLanguageSearch] = useState('')
  const [territorySearch, setTerritorySearch] = useState('')
  const [scriptSearch, setScriptSearch] = useState('')

  const normalizedLocale = normalizeLocaleForCldr(selectedLocale)

  const localeDisplayNames = data?.main?.[normalizedLocale]?.localeDisplayNames

  // Extract data from different categories
  const languages = useMemo(() => {
    return localeDisplayNames?.languages || {}
  }, [localeDisplayNames])

  const territories = useMemo(() => {
    return localeDisplayNames?.territories || {}
  }, [localeDisplayNames])

  const scripts = useMemo(() => {
    return localeDisplayNames?.scripts || {}
  }, [localeDisplayNames])

  const variants = useMemo(() => {
    return localeDisplayNames?.variants || {}
  }, [localeDisplayNames])

  // Get all codes
  const allLanguageCodes = useMemo(() => {
    return Object.keys(languages).sort()
  }, [languages])

  const allTerritoryCodes = useMemo(() => {
    return Object.keys(territories).sort()
  }, [territories])

  const allScriptCodes = useMemo(() => {
    return Object.keys(scripts).sort()
  }, [scripts])

  const allVariantCodes = useMemo(() => {
    return Object.keys(variants).sort()
  }, [variants])

  // Filter based on search
  const filteredLanguages = useMemo(() => {
    if (!languageSearch) return allLanguageCodes

    const query = languageSearch.toLowerCase()
    return allLanguageCodes.filter(code => {
      const name = languages[code]
      return (
        code.toLowerCase().includes(query) ||
        (typeof name === 'string' && name.toLowerCase().includes(query))
      )
    })
  }, [allLanguageCodes, languageSearch, languages])

  const filteredTerritories = useMemo(() => {
    if (!territorySearch) return allTerritoryCodes

    const query = territorySearch.toLowerCase()
    return allTerritoryCodes.filter(code => {
      const name = territories[code]
      return (
        code.toLowerCase().includes(query) ||
        (typeof name === 'string' && name.toLowerCase().includes(query))
      )
    })
  }, [allTerritoryCodes, territorySearch, territories])

  const filteredScripts = useMemo(() => {
    if (!scriptSearch) return allScriptCodes

    const query = scriptSearch.toLowerCase()
    return allScriptCodes.filter(code => {
      const name = scripts[code]
      return (
        code.toLowerCase().includes(query) ||
        (typeof name === 'string' && name.toLowerCase().includes(query))
      )
    })
  }, [allScriptCodes, scriptSearch, scripts])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">
          Loading locale names data for {selectedLocale}...
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
          Failed to load locale names data: {(error as Error).message}
        </p>
      </div>
    )
  }

  // Render a locale name card
  const renderNameCard = (code: string, name: string, categoryPath: string) => {
    return (
      <div key={code} className="p-3 bg-muted rounded flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm font-semibold text-muted-foreground mb-1">
            {code}
          </div>
          <div className="text-sm font-medium break-words">{name}</div>
        </div>
        <SourceBadge
          jsonPath={buildJsonPath(
            normalizedLocale,
            'localeDisplayNames',
            categoryPath,
            code
          )}
          locale={normalizedLocale}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Locale Names</h1>
        <p className="text-muted-foreground">
          Explore language, territory, script, and variant names for{' '}
          <span className="font-mono font-semibold text-foreground">
            {selectedLocale}
          </span>
          {' '}(using CLDR data for <span className="font-mono">{normalizedLocale}</span>)
        </p>
        <div className="mt-3 px-4 py-2 bg-muted/50 border border-muted rounded-md text-sm">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> CLDR includes names for 700+ languages, 325+ territories, 220+ scripts, and 60+ variants.
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
            onClick={() => setActiveTab('languages')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'languages'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Languages ({allLanguageCodes.length})
          </button>
          <button
            onClick={() => setActiveTab('territories')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'territories'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Territories ({allTerritoryCodes.length})
          </button>
          <button
            onClick={() => setActiveTab('scripts-variants')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'scripts-variants'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Scripts & Variants
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Locale Display Names Overview</h2>
            <p className="text-sm text-muted-foreground mb-6">
              CLDR provides localized names for languages, territories (countries/regions), writing scripts, and language variants. These names are used in UI elements like language selectors and region pickers.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-muted rounded">
                <h3 className="text-lg font-semibold mb-2">Languages</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Names for {allLanguageCodes.length} languages and regional variants
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-mono text-muted-foreground">en</span>
                    <span>{languages.en}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-muted-foreground">fr</span>
                    <span>{languages.fr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-muted-foreground">zh</span>
                    <span>{languages.zh}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded">
                <h3 className="text-lg font-semibold mb-2">Territories</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Names for {allTerritoryCodes.length} countries, regions, and areas
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-mono text-muted-foreground">US</span>
                    <span>{territories.US}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-muted-foreground">GB</span>
                    <span>{territories.GB}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-muted-foreground">JP</span>
                    <span>{territories.JP}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded">
                <h3 className="text-lg font-semibold mb-2">Scripts</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Names for {allScriptCodes.length} writing systems
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-mono text-muted-foreground">Latn</span>
                    <span>{scripts.Latn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-muted-foreground">Cyrl</span>
                    <span>{scripts.Cyrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-muted-foreground">Arab</span>
                    <span>{scripts.Arab}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded">
                <h3 className="text-lg font-semibold mb-2">Variants</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Names for {allVariantCodes.length} language variants and orthographies
                </p>
                <div className="space-y-2 text-sm">
                  {allVariantCodes.slice(0, 3).map(code => (
                    <div key={code} className="flex justify-between">
                      <span className="font-mono text-muted-foreground">{code}</span>
                      <span className="text-right">{variants[code]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Languages Tab */}
      {activeTab === 'languages' && (
        <div className="space-y-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Language Names</h2>
              <div className="text-sm text-muted-foreground">
                {filteredLanguages.length} of {allLanguageCodes.length} languages
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by code or name..."
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Language Grid */}
            {filteredLanguages.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                {filteredLanguages.map(code => renderNameCard(code, languages[code] as string, 'languages'))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No languages found matching "{languageSearch}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Territories Tab */}
      {activeTab === 'territories' && (
        <div className="space-y-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Territory Names</h2>
              <div className="text-sm text-muted-foreground">
                {filteredTerritories.length} of {allTerritoryCodes.length} territories
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by code or name..."
                  value={territorySearch}
                  onChange={(e) => setTerritorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Territory Grid */}
            {filteredTerritories.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                {filteredTerritories.map(code => renderNameCard(code, territories[code] as string, 'territories'))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No territories found matching "{territorySearch}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scripts & Variants Tab */}
      {activeTab === 'scripts-variants' && (
        <div className="space-y-8">
          {/* Scripts */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Script Names</h2>
              <div className="text-sm text-muted-foreground">
                {filteredScripts.length} of {allScriptCodes.length} scripts
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by code or name..."
                  value={scriptSearch}
                  onChange={(e) => setScriptSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Script Grid */}
            {filteredScripts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                {filteredScripts.map(code => renderNameCard(code, scripts[code] as string, 'scripts'))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No scripts found matching "{scriptSearch}"
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Variant Names</h2>
              <div className="text-sm text-muted-foreground">
                {allVariantCodes.length} variants
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Language variants include orthographies, romanization systems, and phonetic representations.
            </p>

            {/* Variant Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allVariantCodes.map(code => renderNameCard(code, variants[code] as string, 'variants'))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
