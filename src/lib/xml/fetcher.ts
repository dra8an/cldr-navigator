import type { LocaleCode } from '@/types'
import { normalizeLocaleForCldr } from '../cldr/loader'

const CLDR_GITHUB_BASE = 'https://raw.githubusercontent.com/unicode-org/cldr/main'
const CLDR_VERSION = 'main' // Could be made configurable

/**
 * Constructs GitHub raw URL for a CLDR XML file
 */
export function getGitHubXmlUrl(xmlPath: string): string {
  // xmlPath format: "common/main/{locale}.xml" or "common/supplemental/plurals.xml"
  return `${CLDR_GITHUB_BASE}/${xmlPath}`
}

/**
 * Constructs GitHub web URL for viewing the file
 */
export function getGitHubWebUrl(xmlPath: string, lineNumber?: number): string {
  const baseUrl = `https://github.com/unicode-org/cldr/blob/${CLDR_VERSION}/${xmlPath}`
  return lineNumber ? `${baseUrl}#L${lineNumber}` : baseUrl
}

/**
 * Gets the XML file path for a locale's main data file
 */
export function getLocaleXmlPath(locale: LocaleCode): string {
  const normalizedLocale = normalizeLocaleForCldr(locale)
  return `common/main/${normalizedLocale}.xml`
}

/**
 * Fetches XML content from GitHub
 */
export async function fetchXmlFromGitHub(xmlPath: string): Promise<string> {
  const url = getGitHubXmlUrl(xmlPath)

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch XML: ${response.status} ${response.statusText}`)
    }

    const xml = await response.text()
    return xml
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch CLDR XML from GitHub: ${error.message}`)
    }
    throw error
  }
}

/**
 * Extracts a specific XML snippet based on XPath-like selector
 * This is a simplified version - for MVP we'll show context around the element
 */
export function extractXmlSnippet(
  xmlContent: string,
  xpath: string,
  contextLines = 3
): { snippet: string; lineNumber?: number } {
  // For MVP, we'll do a simple search for key elements from the xpath
  // A full XPath parser would be ideal but is complex

  // Extract key parts from xpath
  // Example: "//ldml/numbers/symbols[@numberSystem='latn']/decimal"
  const pathParts = xpath.split('/')
  const lastElement = pathParts[pathParts.length - 1]
  const elementName = lastElement.split('[')[0]

  // Search for the element in XML
  const lines = xmlContent.split('\n')
  let foundLineIndex = -1

  // Look for element with attributes if specified
  if (lastElement.includes('[')) {
    // Parse attribute from xpath like "symbols[@numberSystem='latn']"
    const attrMatch = lastElement.match(/\[@(\w+)='([^']+)'\]/)
    if (attrMatch) {
      const [, attrName, attrValue] = attrMatch
      const elementNameOnly = lastElement.split('[')[0]

      // Find line with both element and attribute
      foundLineIndex = lines.findIndex(line =>
        line.includes(`<${elementNameOnly}`) &&
        line.includes(`${attrName}="${attrValue}"`)
      )
    }
  }

  // Fallback: search for just the element name
  if (foundLineIndex === -1) {
    foundLineIndex = lines.findIndex(line =>
      line.includes(`<${elementName}>`) || line.includes(`<${elementName} `)
    )
  }

  if (foundLineIndex === -1) {
    // Not found, return a generic message
    return {
      snippet: `<!-- Element ${elementName} not found in XML -->`,
      lineNumber: undefined,
    }
  }

  // Extract context lines around the found line
  const startLine = Math.max(0, foundLineIndex - contextLines)
  const endLine = Math.min(lines.length, foundLineIndex + contextLines + 1)
  const snippet = lines.slice(startLine, endLine).join('\n')

  return {
    snippet,
    lineNumber: foundLineIndex + 1, // 1-indexed
  }
}

/**
 * Parses XML to extract element value
 */
export function getXmlElementValue(xmlContent: string, xpath: string): string | null {
  // Simple extraction for MVP - would use proper XML parser in production
  const pathParts = xpath.split('/')
  const lastElement = pathParts[pathParts.length - 1].split('[')[0]

  const regex = new RegExp(`<${lastElement}[^>]*>([^<]+)</${lastElement}>`)
  const match = xmlContent.match(regex)

  return match ? match[1] : null
}

/**
 * Formats XML with basic indentation for display
 */
export function formatXml(xml: string): string {
  // Basic XML formatting - adds line breaks and indentation
  let formatted = ''
  let indent = 0
  const tab = '  '

  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) {
      indent-- // Closing tag
    }

    formatted += tab.repeat(indent) + '<' + node + '>\n'

    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) {
      indent++ // Opening tag
    }
  })

  return formatted.substring(1, formatted.length - 2) // Remove extra < >
}

/**
 * Stores XML in localStorage for offline access
 */
export function cacheXmlInLocalStorage(xmlPath: string, content: string): void {
  try {
    const key = `cldr-xml-${xmlPath}`
    localStorage.setItem(key, content)
  } catch (error) {
    console.warn('Failed to cache XML in localStorage:', error)
  }
}

/**
 * Retrieves cached XML from localStorage
 */
export function getCachedXml(xmlPath: string): string | null {
  try {
    const key = `cldr-xml-${xmlPath}`
    return localStorage.getItem(key)
  } catch (error) {
    console.warn('Failed to retrieve cached XML:', error)
    return null
  }
}
