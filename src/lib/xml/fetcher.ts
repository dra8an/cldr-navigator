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
 * Improved version that follows the full path context
 */
export function extractXmlSnippet(
  xmlContent: string,
  xpath: string,
  contextLines = 3
): { snippet: string; lineNumber?: number } {
  // Parse XPath to extract path components
  // Example: "//ldml/numbers/decimalFormats[@numberSystem='latn']/decimalFormatLength/decimalFormat/pattern"
  const pathParts = xpath.split('/').filter(p => p && p !== '')

  if (pathParts.length === 0) {
    return {
      snippet: '<!-- Invalid XPath -->',
      lineNumber: undefined,
    }
  }

  // Remove 'ldml' from the start since all CLDR files start with it
  if (pathParts[0] === 'ldml') {
    pathParts.shift()
  }

  const lines = xmlContent.split('\n')

  // Strategy: Find the target element by looking for it within its parent context
  // We'll search for key parent elements first to narrow down the search area

  let searchStartLine = 0
  let searchEndLine = lines.length

  // Extract distinguishing parts from the path (elements with attributes or unique parents)
  const keyElements: Array<{ element: string; attr?: { name: string; value: string } }> = []

  for (const part of pathParts) {
    const element = part.split('[')[0]
    const attrMatch = part.match(/\[@(\w+)='([^']+)'\]/)

    if (attrMatch) {
      keyElements.push({
        element,
        attr: { name: attrMatch[1], value: attrMatch[2] }
      })
    } else if (keyElements.length === 0 || pathParts.indexOf(part) < 2) {
      // Include first few elements to establish context
      keyElements.push({ element })
    }
  }

  // Search for the most specific parent element first
  for (let i = keyElements.length - 2; i >= 0; i--) {
    const key = keyElements[i]
    const foundIndex = lines.findIndex((line, idx) => {
      if (idx < searchStartLine || idx >= searchEndLine) return false

      if (key.attr) {
        return line.includes(`<${key.element}`) &&
               line.includes(`${key.attr.name}="${key.attr.value}"`)
      } else {
        return line.includes(`<${key.element}>`) || line.includes(`<${key.element} `)
      }
    })

    if (foundIndex !== -1) {
      searchStartLine = foundIndex
      // Find the closing tag to limit search scope
      const closingTag = `</${key.element}>`
      const endIndex = lines.findIndex((line, idx) =>
        idx > foundIndex && line.includes(closingTag)
      )
      if (endIndex !== -1) {
        searchEndLine = endIndex + 1
      }
      break
    }
  }

  // Now search for the final element within the narrowed scope
  const lastElement = pathParts[pathParts.length - 1]
  const elementName = lastElement.split('[')[0]

  let foundLineIndex = -1

  // Check if the last element has attributes
  const lastAttrMatch = lastElement.match(/\[@(\w+)='([^']+)'\]/)

  if (lastAttrMatch) {
    const [, attrName, attrValue] = lastAttrMatch
    foundLineIndex = lines.findIndex((line, idx) =>
      idx >= searchStartLine && idx < searchEndLine &&
      line.includes(`<${elementName}`) &&
      line.includes(`${attrName}="${attrValue}"`)
    )
  } else {
    // Search within the narrowed scope
    foundLineIndex = lines.findIndex((line, idx) =>
      idx >= searchStartLine && idx < searchEndLine &&
      (line.includes(`<${elementName}>`) || line.includes(`<${elementName} `))
    )
  }

  if (foundLineIndex === -1) {
    return {
      snippet: `<!-- Element ${elementName} not found in expected context -->`,
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
