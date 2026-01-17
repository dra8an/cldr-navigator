import { useState } from 'react'
import { FileText } from 'lucide-react'
import type { SourceBadgeProps } from '@/types'
import SourcePanel from './SourcePanel'

export default function SourceBadge({ jsonPath, locale }: SourceBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors border border-primary/20 hover:border-primary/40"
        title="View XML source"
      >
        <FileText className="w-3 h-3" />
        <span>Source</span>
      </button>

      {isOpen && (
        <SourcePanel
          jsonPath={jsonPath}
          locale={locale}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
