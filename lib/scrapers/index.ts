import { extractAsosJson } from './asos'

export interface ScrapeResult {
  html: string
  structuredJson?: object
}

const SUPPORTED_DOMAINS = [
  'asos.com',
  'zara.com',
  'hm.com',
  'shein.com',
  'uniqlo.com',
  'madewell.com',
  'anthropologie.com',
  'nordstrom.com',
  'net-a-porter.com',
  'farfetch.com',
  'ssense.com',
]

export function isSupportedSite(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace('www.', '')
    return SUPPORTED_DOMAINS.some((d) => host.includes(d))
  } catch {
    return false
  }
}

export async function scrapeProduct(url: string): Promise<ScrapeResult> {
  // Use ScraperAPI if key is configured (handles anti-bot, JS rendering)
  const fetchUrl = process.env.SCRAPER_API_KEY
    ? `http://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&render=true`
    : url

  const res = await fetch(fetchUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(
      `Failed to fetch page (${res.status}). Try adding a SCRAPER_API_KEY for sites with anti-bot protection.`
    )
  }

  const html = await res.text()
  const host = new URL(url).hostname.replace('www.', '')

  // Fast-path: extract structured JSON for known sites
  let structuredJson: object | undefined
  if (host.includes('asos.com')) {
    structuredJson = extractAsosJson(html)
  }

  // Generic: try Schema.org JSON-LD (works on many retailers)
  if (!structuredJson) {
    structuredJson = extractSchemaOrg(html)
  }

  return { html, structuredJson }
}

function extractSchemaOrg(html: string): object | undefined {
  const matches = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ]
  for (const match of matches) {
    try {
      const data = JSON.parse(match[1])
      const obj = Array.isArray(data) ? data[0] : data
      if (obj?.['@type'] === 'Product') return obj
    } catch {
      // continue
    }
  }
  return undefined
}
