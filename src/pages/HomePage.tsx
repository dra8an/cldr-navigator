import { Link } from 'react-router-dom'
import { Hash, ArrowRight, FileText } from 'lucide-react'
import { useLocaleStore } from '@/store/localeStore'

export default function HomePage() {
  const { selectedLocale } = useLocaleStore()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to CLDR Navigator
        </h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Explore Common Locale Data Repository (CLDR) data with direct links
          to XML sources. Every data point links back to its source in the CLDR
          repository.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/numbers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://cldr.unicode.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium"
          >
            Learn About CLDR
          </a>
        </div>
      </div>

      {/* Current Locale */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-2">Current Locale</h2>
        <p className="text-lg text-muted-foreground mb-4">
          You are currently viewing data for:{' '}
          <span className="font-mono text-primary font-semibold">
            {selectedLocale}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Use the locale selector in the header to change locales and compare
          different localizations.
        </p>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border rounded-lg p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">XML Source Linking</h3>
            <p className="text-muted-foreground">
              Every data value has a clickable "Source" button that shows the
              exact XPath and links to the XML file in the CLDR GitHub
              repository.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Hash className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Interactive Demos
            </h3>
            <p className="text-muted-foreground">
              Explore number formatting, date/time patterns, currency symbols,
              and more through interactive demonstrations.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Categories */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">
          Explore Demo Categories
        </h2>
        <div className="space-y-4">
          <Link
            to="/numbers"
            className="block bg-card border rounded-lg p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Number Formatting
                </h3>
                <p className="text-muted-foreground">
                  Decimal patterns, grouping separators, numbering systems, and
                  scientific notation
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          <Link
            to="/dates"
            className="block bg-card border rounded-lg p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Dates & Times</h3>
                <p className="text-muted-foreground">
                  Calendar systems, date patterns, month/day names, and time
                  zones
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          <Link
            to="/currency"
            className="block bg-card border rounded-lg p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Currencies</h3>
                <p className="text-muted-foreground">
                  Currency symbols, decimal handling, symbol placement, and
                  accounting formats
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          <Link
            to="/locale-names"
            className="block bg-card border rounded-lg p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Locale Names</h3>
                <p className="text-muted-foreground">
                  Language, territory, script, and variant display names across
                  locales
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          <Link
            to="/plural-rules"
            className="block bg-card border rounded-lg p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Plural Rules</h3>
                <p className="text-muted-foreground">
                  Cardinal and ordinal plural categories with interactive
                  examples
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </div>

      {/* About CLDR */}
      <div className="bg-muted rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">About CLDR</h2>
        <p className="text-muted-foreground mb-3">
          The Unicode Common Locale Data Repository (CLDR) provides key building
          blocks for software to support the world's languages. It includes:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Locale-specific patterns for formatting numbers, dates, times</li>
          <li>Translations of language, territory, and currency names</li>
          <li>Rules for plural forms, collation, and text segmentation</li>
          <li>Calendar data and time zone information</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          This application uses CLDR v48.0.0 and provides direct links to the
          source XML files for educational purposes.
        </p>
      </div>
    </div>
  )
}
