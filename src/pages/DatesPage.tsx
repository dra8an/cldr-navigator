import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'
import { useLocaleStore } from '@/store/localeStore'
import { useDateData } from '@/hooks/useCldrData'
import { buildJsonPath } from '@/lib/mapping/resolver'
import { normalizeLocaleForCldr } from '@/lib/cldr/loader'
import { formatWithSkeletonSync, hasUnsupportedFeatures } from '@/lib/cldr/skeletonFormatter'
import SourceBadge from '@/components/source/SourceBadge'

type TabType = 'overview' | 'names' | 'available-formats' | 'intervals'

export default function DatesPage() {
  const { selectedLocale } = useLocaleStore()
  const { data, isLoading, error } = useDateData(selectedLocale)
  const [customDate, setCustomDate] = useState(new Date())
  const [intervalEndDate, setIntervalEndDate] = useState(() => {
    const end = new Date()
    end.setDate(end.getDate() + 7)
    return end
  })
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [copiedOverview, setCopiedOverview] = useState(false)
  const [copiedAvailable, setCopiedAvailable] = useState(false)
  const [copiedInterval, setCopiedInterval] = useState(false)

  // Get the normalized locale for accessing CLDR data
  const normalizedLocale = normalizeLocaleForCldr(selectedLocale)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">
          Loading date/time data for {selectedLocale}...
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
          Failed to load date/time data: {(error as Error).message}
        </p>
      </div>
    )
  }

  const gregorian = data?.main?.[normalizedLocale]?.dates?.calendars?.gregorian

  // Month and day keys
  const monthKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Format helpers
  const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => {
    try {
      return new Intl.DateTimeFormat(selectedLocale, options).format(date)
    } catch {
      return date.toLocaleDateString()
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    if (!isNaN(newDate.getTime())) {
      setCustomDate(newDate)
    }
  }

  const handleIntervalEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    if (!isNaN(newDate.getTime())) {
      setIntervalEndDate(newDate)
    }
  }

  // Convert Date to datetime-local input format
  const dateToInputValue = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Copy code to clipboard
  const copyToClipboard = async (text: string, type: 'overview' | 'available' | 'interval') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'overview') {
        setCopiedOverview(true)
        setTimeout(() => setCopiedOverview(false), 2000)
      } else if (type === 'available') {
        setCopiedAvailable(true)
        setTimeout(() => setCopiedAvailable(false), 2000)
      } else {
        setCopiedInterval(true)
        setTimeout(() => setCopiedInterval(false), 2000)
      }
    } catch {
      // Silently fail if clipboard API is not available
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dates & Times</h1>
        <p className="text-muted-foreground">
          Explore date and time formatting patterns, month and day names for{' '}
          <span className="font-mono font-semibold text-foreground">
            {selectedLocale}
          </span>
          {' '}(using CLDR data for <span className="font-mono">{normalizedLocale}</span>)
        </p>
        <div className="mt-3 px-4 py-2 bg-muted/50 border border-muted rounded-md text-sm">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> This page displays data for the{' '}
            <span className="font-mono font-semibold">Gregorian calendar</span>. CLDR includes data for multiple calendar systems (Chinese, Hebrew, Islamic, etc.) which may be added in future updates.
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
            Standard Formats
          </button>
          <button
            onClick={() => setActiveTab('names')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'names'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Months & Days
          </button>
          <button
            onClick={() => setActiveTab('available-formats')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'available-formats'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Available Formats
          </button>
          <button
            onClick={() => setActiveTab('intervals')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'intervals'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Intervals
          </button>
        </nav>
      </div>

      {/* Standard Formats Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Date Formats */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Date Format Patterns</h2>
            <div className="space-y-4">
              {gregorian?.dateFormats?.full && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Full Date Format
                    </label>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'dates',
                        'calendars',
                        'gregorian',
                        'dateFormats',
                        'full'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="font-mono text-sm mb-2">
                    {gregorian.dateFormats.full}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Example: {formatDate(customDate, { dateStyle: 'full' })}
                  </div>
                </div>
              )}

              {gregorian?.dateFormats?.long && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Long Date Format
                    </label>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'dates',
                        'calendars',
                        'gregorian',
                        'dateFormats',
                        'long'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="font-mono text-sm mb-2">
                    {gregorian.dateFormats.long}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Example: {formatDate(customDate, { dateStyle: 'long' })}
                  </div>
                </div>
              )}

              {gregorian?.dateFormats?.medium && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Medium Date Format
                    </label>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'dates',
                        'calendars',
                        'gregorian',
                        'dateFormats',
                        'medium'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="font-mono text-sm mb-2">
                    {gregorian.dateFormats.medium}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Example: {formatDate(customDate, { dateStyle: 'medium' })}
                  </div>
                </div>
              )}

              {gregorian?.dateFormats?.short && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Short Date Format
                    </label>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'dates',
                        'calendars',
                        'gregorian',
                        'dateFormats',
                        'short'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="font-mono text-sm mb-2">
                    {gregorian.dateFormats.short}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Example: {formatDate(customDate, { dateStyle: 'short' })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Time Formats */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Time Format Patterns</h2>
            <div className="space-y-4">
              {gregorian?.timeFormats?.full && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Full Time Format
                    </label>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'dates',
                        'calendars',
                        'gregorian',
                        'timeFormats',
                        'full'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="font-mono text-sm mb-2">
                    {gregorian.timeFormats.full}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Example: {formatDate(customDate, { timeStyle: 'full' })}
                  </div>
                </div>
              )}

              {gregorian?.timeFormats?.long && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Long Time Format
                    </label>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'dates',
                        'calendars',
                        'gregorian',
                        'timeFormats',
                        'long'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="font-mono text-sm mb-2">
                    {gregorian.timeFormats.long}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Example: {formatDate(customDate, { timeStyle: 'long' })}
                  </div>
                </div>
              )}

              {gregorian?.timeFormats?.medium && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Medium Time Format
                    </label>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'dates',
                        'calendars',
                        'gregorian',
                        'timeFormats',
                        'medium'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="font-mono text-sm mb-2">
                    {gregorian.timeFormats.medium}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Example: {formatDate(customDate, { timeStyle: 'medium' })}
                  </div>
                </div>
              )}

              {gregorian?.timeFormats?.short && (
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Short Time Format
                    </label>
                    <SourceBadge
                      jsonPath={buildJsonPath(
                        normalizedLocale,
                        'dates',
                        'calendars',
                        'gregorian',
                        'timeFormats',
                        'short'
                      )}
                      locale={normalizedLocale}
                    />
                  </div>
                  <div className="font-mono text-sm mb-2">
                    {gregorian.timeFormats.short}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Example: {formatDate(customDate, { timeStyle: 'short' })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Date Formatter */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Try It Yourself</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select a date and time to see how it's formatted in {selectedLocale}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select a date and time:
                </label>
                <input
                  type="datetime-local"
                  value={dateToInputValue(customDate)}
                  onChange={handleDateChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Full Date
                  </div>
                  <div className="text-lg font-mono">
                    {formatDate(customDate, { dateStyle: 'full' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Long Date
                  </div>
                  <div className="text-lg font-mono">
                    {formatDate(customDate, { dateStyle: 'long' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Medium Date
                  </div>
                  <div className="text-lg font-mono">
                    {formatDate(customDate, { dateStyle: 'medium' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Short Date
                  </div>
                  <div className="text-lg font-mono">
                    {formatDate(customDate, { dateStyle: 'short' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Full Time
                  </div>
                  <div className="text-lg font-mono">
                    {formatDate(customDate, { timeStyle: 'full' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Long Time
                  </div>
                  <div className="text-lg font-mono">
                    {formatDate(customDate, { timeStyle: 'long' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Medium Time
                  </div>
                  <div className="text-lg font-mono">
                    {formatDate(customDate, { timeStyle: 'medium' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Short Time
                  </div>
                  <div className="text-lg font-mono">
                    {formatDate(customDate, { timeStyle: 'short' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded md:col-span-2">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Full Date & Time
                  </div>
                  <div className="text-lg font-mono">
                    {formatDate(customDate, { dateStyle: 'full', timeStyle: 'short' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Using with JavaScript */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Using with JavaScript</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You can use the native <code className="px-1 py-0.5 bg-muted rounded text-xs">Intl.DateTimeFormat</code> API to format dates and times in your code:
            </p>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Date & Time Formatting Example:
                </div>
                <div className="relative">
                  <div className="font-mono text-sm bg-slate-950 text-green-400 px-4 py-3 rounded-lg border border-slate-800 overflow-x-auto">
                    <pre className="whitespace-pre">{`const date = new Date()

// Full date
const fullDateFormatter = new Intl.DateTimeFormat('${selectedLocale}', {
  dateStyle: 'full'
})
console.log(fullDateFormatter.format(date))
// Output: "${formatDate(customDate, { dateStyle: 'full' })}"

// Medium date with short time
const dateTimeFormatter = new Intl.DateTimeFormat('${selectedLocale}', {
  dateStyle: 'medium',
  timeStyle: 'short'
})
console.log(dateTimeFormatter.format(date))
// Output: "${formatDate(customDate, { dateStyle: 'medium', timeStyle: 'short' })}"`}</pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(
                      `const date = new Date()\n\n// Full date\nconst fullDateFormatter = new Intl.DateTimeFormat('${selectedLocale}', {\n  dateStyle: 'full'\n})\nconsole.log(fullDateFormatter.format(date))\n// Output: "${formatDate(customDate, { dateStyle: 'full' })}"\n\n// Medium date with short time\nconst dateTimeFormatter = new Intl.DateTimeFormat('${selectedLocale}', {\n  dateStyle: 'medium',\n  timeStyle: 'short'\n})\nconsole.log(dateTimeFormatter.format(date))\n// Output: "${formatDate(customDate, { dateStyle: 'medium', timeStyle: 'short' })}"`,
                      'overview'
                    )}
                    className="absolute top-2 right-2 p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedOverview ? (
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
      )}

      {/* Names Tab */}
      {activeTab === 'names' && (
        <div className="space-y-8">
          {/* Month Names */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Month Names</h2>

            {/* Wide Month Names */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Full Names</h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {monthKeys.map((monthKey) => {
                  const monthName = gregorian?.months?.format?.wide?.[monthKey]
                  return monthName ? (
                    <div key={`wide-${monthKey}`} className="p-3 bg-muted rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Month {monthKey}</span>
                        <SourceBadge
                          jsonPath={buildJsonPath(
                            normalizedLocale,
                            'dates',
                            'calendars',
                            'gregorian',
                            'months',
                            'format',
                            'wide',
                            monthKey
                          )}
                          locale={normalizedLocale}
                        />
                      </div>
                      <div className="font-medium">{monthName}</div>
                    </div>
                  ) : null
                })}
              </div>
            </div>

            {/* Abbreviated Month Names */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Abbreviated</h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {monthKeys.map((monthKey) => {
                  const monthName = gregorian?.months?.format?.abbreviated?.[monthKey]
                  return monthName ? (
                    <div key={`abbr-${monthKey}`} className="p-3 bg-muted rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Month {monthKey}</span>
                        <SourceBadge
                          jsonPath={buildJsonPath(
                            normalizedLocale,
                            'dates',
                            'calendars',
                            'gregorian',
                            'months',
                            'format',
                            'abbreviated',
                            monthKey
                          )}
                          locale={normalizedLocale}
                        />
                      </div>
                      <div className="font-medium">{monthName}</div>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </div>

          {/* Day Names */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Day Names</h2>

            {/* Wide Day Names */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Full Names</h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {dayKeys.map((dayKey, index) => {
                  const dayName = gregorian?.days?.format?.wide?.[dayKey]
                  return dayName ? (
                    <div key={`wide-${dayKey}`} className="p-3 bg-muted rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{dayLabels[index]}</span>
                        <SourceBadge
                          jsonPath={buildJsonPath(
                            normalizedLocale,
                            'dates',
                            'calendars',
                            'gregorian',
                            'days',
                            'format',
                            'wide',
                            dayKey
                          )}
                          locale={normalizedLocale}
                        />
                      </div>
                      <div className="font-medium">{dayName}</div>
                    </div>
                  ) : null
                })}
              </div>
            </div>

            {/* Abbreviated Day Names */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Abbreviated</h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {dayKeys.map((dayKey, index) => {
                  const dayName = gregorian?.days?.format?.abbreviated?.[dayKey]
                  return dayName ? (
                    <div key={`abbr-${dayKey}`} className="p-3 bg-muted rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{dayLabels[index]}</span>
                        <SourceBadge
                          jsonPath={buildJsonPath(
                            normalizedLocale,
                            'dates',
                            'calendars',
                            'gregorian',
                            'days',
                            'format',
                            'abbreviated',
                            dayKey
                          )}
                          locale={normalizedLocale}
                        />
                      </div>
                      <div className="font-medium">{dayName}</div>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </div>

          {/* Day Periods */}
          {gregorian?.dayPeriods?.format?.wide && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Day Periods</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {gregorian.dayPeriods.format.wide.am && (
                  <div className="p-4 bg-muted rounded">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">AM</label>
                      <SourceBadge
                        jsonPath={buildJsonPath(
                          normalizedLocale,
                          'dates',
                          'calendars',
                          'gregorian',
                          'dayPeriods',
                          'format',
                          'wide',
                          'am'
                        )}
                        locale={normalizedLocale}
                      />
                    </div>
                    <div className="text-lg font-medium">
                      {gregorian.dayPeriods.format.wide.am}
                    </div>
                  </div>
                )}

                {gregorian.dayPeriods.format.wide.pm && (
                  <div className="p-4 bg-muted rounded">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">PM</label>
                      <SourceBadge
                        jsonPath={buildJsonPath(
                          normalizedLocale,
                          'dates',
                          'calendars',
                          'gregorian',
                          'dayPeriods',
                          'format',
                          'wide',
                          'pm'
                        )}
                        locale={normalizedLocale}
                      />
                    </div>
                    <div className="text-lg font-medium">
                      {gregorian.dayPeriods.format.wide.pm}
                    </div>
                  </div>
                )}

                {gregorian.dayPeriods.format.wide.midnight && (
                  <div className="p-4 bg-muted rounded">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">Midnight</label>
                      <SourceBadge
                        jsonPath={buildJsonPath(
                          normalizedLocale,
                          'dates',
                          'calendars',
                          'gregorian',
                          'dayPeriods',
                          'format',
                          'wide',
                          'midnight'
                        )}
                        locale={normalizedLocale}
                      />
                    </div>
                    <div className="text-lg font-medium">
                      {gregorian.dayPeriods.format.wide.midnight}
                    </div>
                  </div>
                )}

                {gregorian.dayPeriods.format.wide.noon && (
                  <div className="p-4 bg-muted rounded">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">Noon</label>
                      <SourceBadge
                        jsonPath={buildJsonPath(
                          normalizedLocale,
                          'dates',
                          'calendars',
                          'gregorian',
                          'dayPeriods',
                          'format',
                          'wide',
                          'noon'
                        )}
                        locale={normalizedLocale}
                      />
                    </div>
                    <div className="text-lg font-medium">
                      {gregorian.dayPeriods.format.wide.noon}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Formats Tab */}
      {activeTab === 'available-formats' && (
        <div className="space-y-8">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Available Date/Time Formats</h2>
            <p className="text-sm text-muted-foreground mb-4">
              These are skeleton format patterns that can be used with formatting libraries. Each pattern represents a commonly used date/time format.
            </p>
            {gregorian?.dateTimeFormats?.availableFormats ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(gregorian.dateTimeFormats.availableFormats)
                  .filter(([formatId]) => !hasUnsupportedFeatures(formatId))
                  .map(([formatId, pattern]) => {
                  // Use formatWithSkeletonSync to properly render CLDR skeleton patterns
                  const formattedExample = formatWithSkeletonSync(customDate, formatId, selectedLocale)
                  const example = formattedExample || '(formatting unavailable)'

                  return (
                    <div key={formatId} className="p-4 bg-muted rounded">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground font-mono">
                          {formatId}
                        </label>
                        <SourceBadge
                          jsonPath={buildJsonPath(
                            normalizedLocale,
                            'dates',
                            'calendars',
                            'gregorian',
                            'dateTimeFormats',
                            'availableFormats',
                            formatId
                          )}
                          locale={normalizedLocale}
                        />
                      </div>
                      <div className="font-mono text-sm mb-2">
                        {pattern}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Example: {example}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No available formats data found for this locale.
              </p>
            )}
          </div>

          {/* Try It Yourself */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Try It Yourself</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select a date and time to see the format patterns in action
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select a date and time:
                </label>
                <input
                  type="datetime-local"
                  value={dateToInputValue(customDate)}
                  onChange={handleDateChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="p-4 bg-muted/50 rounded border text-sm text-muted-foreground">
                Note: Examples are rendered using @formatjs/intl with full CLDR skeleton pattern support.
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {gregorian?.dateTimeFormats?.availableFormats &&
                  Object.entries(gregorian.dateTimeFormats.availableFormats)
                    .filter(([formatId]) => !hasUnsupportedFeatures(formatId))
                    .slice(0, 12)
                    .map(([formatId]) => {
                    const formatted = formatWithSkeletonSync(customDate, formatId, selectedLocale)
                    return (
                      <div key={formatId} className="p-3 bg-muted rounded">
                        <div className="text-xs font-medium text-muted-foreground font-mono mb-1">
                          {formatId}
                        </div>
                        <div className="font-mono text-sm">
                          {formatted || '(unavailable)'}
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>

          {/* Using with JavaScript */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Using with JavaScript</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You can use the native <code className="px-1 py-0.5 bg-muted rounded text-xs">Intl.DateTimeFormat</code> API with specific options to achieve similar results:
            </p>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Custom Format Example:
                </div>
                <div className="relative">
                  <div className="font-mono text-sm bg-slate-950 text-green-400 px-4 py-3 rounded-lg border border-slate-800 overflow-x-auto">
                    <pre className="whitespace-pre">{`const date = new Date()

// Year and month (like skeleton "yMMMM")
const formatter1 = new Intl.DateTimeFormat('${selectedLocale}', {
  year: 'numeric',
  month: 'long'
})
console.log(formatter1.format(date))
// Output: "${formatDate(customDate, { year: 'numeric', month: 'long' })}"

// Full date with weekday (like skeleton "yMMMMEEEEd")
const formatter2 = new Intl.DateTimeFormat('${selectedLocale}', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})
console.log(formatter2.format(date))
// Output: "${formatDate(customDate, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}"`}</pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(
                      `const date = new Date()\n\n// Year and month (like skeleton "yMMMM")\nconst formatter1 = new Intl.DateTimeFormat('${selectedLocale}', {\n  year: 'numeric',\n  month: 'long'\n})\nconsole.log(formatter1.format(date))\n// Output: "${formatDate(customDate, { year: 'numeric', month: 'long' })}"\n\n// Full date with weekday (like skeleton "yMMMMEEEEd")\nconst formatter2 = new Intl.DateTimeFormat('${selectedLocale}', {\n  year: 'numeric',\n  month: 'long',\n  day: 'numeric',\n  weekday: 'long'\n})\nconsole.log(formatter2.format(date))\n// Output: "${formatDate(customDate, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}"`,
                      'available'
                    )}
                    className="absolute top-2 right-2 p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedAvailable ? (
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
      )}

      {/* Intervals Tab */}
      {activeTab === 'intervals' && (
        <div className="space-y-8">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Interval Formats</h2>
            <p className="text-sm text-muted-foreground mb-4">
              These patterns define how to format date/time ranges (e.g., "Jan 1-5" or "2:00 PM - 4:00 PM").
            </p>
            {gregorian?.dateTimeFormats?.intervalFormats ? (
              <div className="space-y-6">
                {/* Fallback pattern */}
                {gregorian.dateTimeFormats.intervalFormats.intervalFormatFallback && (
                  <div className="p-4 bg-muted/50 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">
                        Fallback Pattern
                      </label>
                      <SourceBadge
                        jsonPath={buildJsonPath(
                          normalizedLocale,
                          'dates',
                          'calendars',
                          'gregorian',
                          'dateTimeFormats',
                          'intervalFormats',
                          'intervalFormatFallback'
                        )}
                        locale={normalizedLocale}
                      />
                    </div>
                    <div className="font-mono text-sm mb-2">
                      {gregorian.dateTimeFormats.intervalFormats.intervalFormatFallback}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Example: {formatDate(customDate, { dateStyle: 'medium' })} – {formatDate(intervalEndDate, { dateStyle: 'medium' })}
                    </div>
                  </div>
                )}

                {/* Specific interval formats */}
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(gregorian.dateTimeFormats.intervalFormats)
                    .filter(([key]) => key !== 'intervalFormatFallback')
                    .map(([formatId, value]) => {
                      if (typeof value === 'string') {
                        return (
                          <div key={formatId} className="p-4 bg-muted rounded">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-muted-foreground font-mono">
                                {formatId}
                              </label>
                              <SourceBadge
                                jsonPath={buildJsonPath(
                                  normalizedLocale,
                                  'dates',
                                  'calendars',
                                  'gregorian',
                                  'dateTimeFormats',
                                  'intervalFormats',
                                  formatId
                                )}
                                locale={normalizedLocale}
                              />
                            </div>
                            <div className="font-mono text-sm">{value}</div>
                          </div>
                        )
                      } else if (typeof value === 'object' && value !== null) {
                        // Get unique patterns
                        const patterns = [...new Set(Object.values(value))]
                        return (
                          <div key={formatId} className="p-4 bg-muted rounded">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-muted-foreground font-mono">
                                {formatId}
                              </label>
                              <SourceBadge
                                jsonPath={buildJsonPath(
                                  normalizedLocale,
                                  'dates',
                                  'calendars',
                                  'gregorian',
                                  'dateTimeFormats',
                                  'intervalFormats',
                                  formatId
                                )}
                                locale={normalizedLocale}
                              />
                            </div>
                            <div className="space-y-1">
                              {patterns.map((pattern, idx) => (
                                <div key={idx} className="font-mono text-sm">
                                  {pattern}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No interval formats data found for this locale.
              </p>
            )}
          </div>

          {/* Try It Yourself */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Try It Yourself</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select a date range to see interval formatting examples
            </p>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Start date and time:
                  </label>
                  <input
                    type="datetime-local"
                    value={dateToInputValue(customDate)}
                    onChange={handleDateChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    End date and time:
                  </label>
                  <input
                    type="datetime-local"
                    value={dateToInputValue(intervalEndDate)}
                    onChange={handleIntervalEndDateChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded border text-sm text-muted-foreground">
                Note: The examples below show approximations using standard Intl.DateTimeFormat.
                Actual interval patterns may require specialized formatting libraries for exact rendering based on the greatest difference.
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Date Range (Full)
                  </div>
                  <div className="font-mono text-sm">
                    {formatDate(customDate, { dateStyle: 'full' })} – {formatDate(intervalEndDate, { dateStyle: 'full' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Date Range (Long)
                  </div>
                  <div className="font-mono text-sm">
                    {formatDate(customDate, { dateStyle: 'long' })} – {formatDate(intervalEndDate, { dateStyle: 'long' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Date Range (Medium)
                  </div>
                  <div className="font-mono text-sm">
                    {formatDate(customDate, { dateStyle: 'medium' })} – {formatDate(intervalEndDate, { dateStyle: 'medium' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Date Range (Short)
                  </div>
                  <div className="font-mono text-sm">
                    {formatDate(customDate, { dateStyle: 'short' })} – {formatDate(intervalEndDate, { dateStyle: 'short' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Time Range
                  </div>
                  <div className="font-mono text-sm">
                    {formatDate(customDate, { timeStyle: 'short' })} – {formatDate(intervalEndDate, { timeStyle: 'short' })}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Month/Year Range
                  </div>
                  <div className="font-mono text-sm">
                    {formatDate(customDate, { year: 'numeric', month: 'long' })} – {formatDate(intervalEndDate, { year: 'numeric', month: 'long' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Using with JavaScript */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Using with JavaScript</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You can format date ranges by formatting each date separately and joining them:
            </p>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Date Range Formatting Example:
                </div>
                <div className="relative">
                  <div className="font-mono text-sm bg-slate-950 text-green-400 px-4 py-3 rounded-lg border border-slate-800 overflow-x-auto">
                    <pre className="whitespace-pre">{`const startDate = new Date()
const endDate = new Date()
endDate.setDate(endDate.getDate() + 7)

// Format a date range
const formatter = new Intl.DateTimeFormat('${selectedLocale}', {
  dateStyle: 'medium'
})
const dateRange = \`\${formatter.format(startDate)} – \${formatter.format(endDate)}\`
console.log(dateRange)
// Output: "${formatDate(customDate, { dateStyle: 'medium' })} – ${formatDate(intervalEndDate, { dateStyle: 'medium' })}"

// Time range
const timeFormatter = new Intl.DateTimeFormat('${selectedLocale}', {
  timeStyle: 'short'
})
const timeRange = \`\${timeFormatter.format(startDate)} – \${timeFormatter.format(endDate)}\`
console.log(timeRange)
// Output: "${formatDate(customDate, { timeStyle: 'short' })} – ${formatDate(intervalEndDate, { timeStyle: 'short' })}"`}</pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(
                      `const startDate = new Date()\nconst endDate = new Date()\nendDate.setDate(endDate.getDate() + 7)\n\n// Format a date range\nconst formatter = new Intl.DateTimeFormat('${selectedLocale}', {\n  dateStyle: 'medium'\n})\nconst dateRange = \`\${formatter.format(startDate)} – \${formatter.format(endDate)}\`\nconsole.log(dateRange)\n// Output: "${formatDate(customDate, { dateStyle: 'medium' })} – ${formatDate(intervalEndDate, { dateStyle: 'medium' })}"\n\n// Time range\nconst timeFormatter = new Intl.DateTimeFormat('${selectedLocale}', {\n  timeStyle: 'short'\n})\nconst timeRange = \`\${timeFormatter.format(startDate)} – \${timeFormatter.format(endDate)}\`\nconsole.log(timeRange)\n// Output: "${formatDate(customDate, { timeStyle: 'short' })} – ${formatDate(intervalEndDate, { timeStyle: 'short' })}"`,
                      'interval'
                    )}
                    className="absolute top-2 right-2 p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedInterval ? (
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
      )}
    </div>
  )
}
