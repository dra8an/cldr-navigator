import { Link } from 'react-router-dom'
import { Globe, Github } from 'lucide-react'
import LocaleSelector from '../locale/LocaleSelector'

export default function Header() {
  return (
    <header className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            <div>
              <Link to="/" className="text-xl font-bold hover:text-primary">
                CLDR Navigator
              </Link>
              <p className="text-xs text-muted-foreground">
                Explore locale data with XML source linking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LocaleSelector />
            <a
              href="https://github.com/unicode-org/cldr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Github className="w-5 h-5" />
              <span className="hidden md:inline">CLDR Repository</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
