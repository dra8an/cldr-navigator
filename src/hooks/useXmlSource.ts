import { useQuery } from '@tanstack/react-query'
import type { LocaleCode, SourceLocation } from '@/types'
import {
  fetchXmlFromGitHub,
  getGitHubWebUrl,
  extractXmlSnippet,
  cacheXmlInLocalStorage,
  getCachedXml,
} from '@/lib/xml/fetcher'
import { resolveXPath } from '@/lib/mapping/resolver'

/**
 * Hook to fetch XML source for a CLDR JSON path
 */
export function useXmlSource(jsonPath: string, locale: LocaleCode) {
  const mapping = resolveXPath(jsonPath, locale)

  const { data: xmlContent, isLoading, error } = useQuery({
    queryKey: ['xml-source', mapping.xmlFile],
    queryFn: async () => {
      // Try to get from cache first
      const cached = getCachedXml(mapping.xmlFile)
      if (cached) {
        return cached
      }

      // Fetch from GitHub
      const xml = await fetchXmlFromGitHub(mapping.xmlFile)

      // Cache for future use
      cacheXmlInLocalStorage(mapping.xmlFile, xml)

      return xml
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  })

  // Extract snippet and line number from XML
  const snippetData = xmlContent
    ? extractXmlSnippet(xmlContent, mapping.xpath)
    : null

  const sourceLocation: SourceLocation = {
    jsonPath,
    xpath: mapping.xpath,
    xmlFile: mapping.xmlFile,
    githubUrl: getGitHubWebUrl(mapping.xmlFile, snippetData?.lineNumber),
    lineNumber: snippetData?.lineNumber,
  }

  return {
    sourceLocation,
    xmlSnippet: snippetData?.snippet,
    xmlContent,
    isLoading,
    error,
  }
}

/**
 * Hook to prefetch XML source (useful for hover interactions)
 */
export function usePrefetchXmlSource() {
  return (jsonPath: string, locale: LocaleCode) => {
    const mapping = resolveXPath(jsonPath, locale)
    // This will trigger the query and cache it
    return {
      queryKey: ['xml-source', mapping.xmlFile],
    }
  }
}
