import { NavLink } from 'react-router-dom'
import {
  Home,
  Hash,
  Calendar,
  DollarSign,
  Globe2,
  ListOrdered,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/numbers', icon: Hash, label: 'Numbers' },
  { to: '/dates', icon: Calendar, label: 'Dates & Times', disabled: true },
  { to: '/currencies', icon: DollarSign, label: 'Currencies', disabled: true },
  { to: '/locales', icon: Globe2, label: 'Locale Names', disabled: true },
  { to: '/plurals', icon: ListOrdered, label: 'Plural Rules', disabled: true },
]

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card p-4">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isDisabled = item.disabled

          if (isDisabled) {
            return (
              <div
                key={item.to}
                className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground opacity-50 cursor-not-allowed"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                <span className="ml-auto text-xs">(Soon)</span>
              </div>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-8 p-3 bg-muted rounded-md text-xs text-muted-foreground">
        <p className="font-semibold mb-1">About</p>
        <p>
          Click the document icon next to any data value to view its XML source
          in the CLDR repository.
        </p>
      </div>
    </aside>
  )
}
