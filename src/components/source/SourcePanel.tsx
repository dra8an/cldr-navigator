import { X, Copy, ExternalLink, Loader2, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import type { SourcePanelProps } from '@/types'
import { useXmlSource } from '@/hooks/useXmlSource'

export default function SourcePanel({
  jsonPath,
  locale,
  isOpen,
  onClose,
}: SourcePanelProps) {
  const { sourceLocation, xmlSnippet, isLoading, error } = useXmlSource(
    jsonPath,
    locale
  )
  const [copiedXPath, setCopiedXPath] = useState(false)

  if (!isOpen) return null

  const handleCopyXPath = async () => {
    await navigator.clipboard.writeText(sourceLocation.xpath)
    setCopiedXPath(true)
    setTimeout(() => setCopiedXPath(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">XML Source</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading XML source...
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">
                Failed to load XML source: {(error as Error).message}
              </p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* JSON Path */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  JSON Path
                </label>
                <div className="mt-1 p-2 bg-muted rounded font-mono text-sm">
                  {jsonPath}
                </div>
              </div>

              {/* XPath */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    XPath
                  </label>
                  <button
                    onClick={handleCopyXPath}
                    className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-accent rounded transition-colors"
                  >
                    {copiedXPath ? (
                      <>
                        <CheckCheck className="w-3 h-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-1 p-2 bg-muted rounded font-mono text-sm break-all">
                  {sourceLocation.xpath}
                </div>
              </div>

              {/* XML File */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  XML File
                </label>
                <div className="mt-1 p-2 bg-muted rounded font-mono text-sm">
                  {sourceLocation.xmlFile}
                  {sourceLocation.lineNumber && (
                    <span className="text-primary ml-2">
                      (Line {sourceLocation.lineNumber})
                    </span>
                  )}
                </div>
              </div>

              {/* GitHub Link */}
              <div>
                <a
                  href={sourceLocation.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on GitHub
                </a>
              </div>

              {/* XML Snippet */}
              {xmlSnippet && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    XML Snippet
                  </label>
                  <div className="mt-1 p-3 bg-muted rounded overflow-x-auto">
                    <pre className="font-mono text-xs text-foreground whitespace-pre">
                      {xmlSnippet}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
