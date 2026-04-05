import * as cheerio from 'cheerio'
import type { Product, MaterialItem } from './types'

type ProductAttributes = Omit<Product, 'id' | 'url' | 'scrapedAt'>

export function parseProduct(
  html: string,
  url: string,
  structuredJson?: object
): ProductAttributes {
  const $ = cheerio.load(html)

  // Meta tag baseline
  const ogTitle = $('meta[property="og:title"]').attr('content') ?? ''
  const ogDesc = $('meta[property="og:description"]').attr('content') ?? ''
  const ogImage = $('meta[property="og:image"]').attr('content') ?? ''
  const ogPrice = $('meta[property="product:price:amount"]').attr('content') ?? ''
  const ogCurrency = $('meta[property="product:price:currency"]').attr('content') ?? 'USD'
  const ogBrand =
    $('meta[property="og:brand"]').attr('content') ??
    $('meta[name="brand"]').attr('content') ??
    ''

  let name = ogTitle
  let brand = ogBrand
  let price = ogPrice ? parseFloat(ogPrice) : 0
  let currency = ogCurrency
  let images: string[] = ogImage ? [ogImage] : []
  let description = ogDesc
  let material = ''
  let availableSizes: string[] = []
  let availableColors: string[] = []

  // Enrich from Schema.org JSON-LD or ASOS __NEXT_DATA__
  if (structuredJson) {
    const s = structuredJson as Record<string, unknown>

    if (s.name && typeof s.name === 'string') name = s.name

    const brandField = s.brand as Record<string, unknown> | string | undefined
    if (typeof brandField === 'string') brand = brandField
    else if (typeof brandField?.name === 'string') brand = brandField.name as string

    // Images
    if (s.image) {
      if (typeof s.image === 'string') images = [s.image]
      else if (Array.isArray(s.image)) {
        images = s.image
          .map((i) => (typeof i === 'string' ? i : (i as Record<string, unknown>)?.url as string))
          .filter(Boolean)
      }
    }

    if (typeof s.description === 'string') description = s.description
    material = findMaterial(s)

    // Offers (Schema.org)
    const offers = s.offers
    if (offers) {
      const offer = (Array.isArray(offers) ? offers[0] : offers) as Record<string, unknown>
      if (offer?.price) price = parseFloat(String(offer.price))
      if (typeof offer?.priceCurrency === 'string') currency = offer.priceCurrency as string
    }

    // Sizes from offers array (some Schema.org implementations)
    if (Array.isArray(offers) && offers.length > 1) {
      const sizes = (offers as Record<string, unknown>[])
        .map((o) => o.name as string)
        .filter(Boolean)
      if (sizes.length > 0) availableSizes = [...new Set(sizes)]
    }

    // Colors
    const color = s.color
    if (typeof color === 'string') availableColors = [color]
    else if (Array.isArray(color)) {
      availableColors = color.filter((c): c is string => typeof c === 'string')
    }

    // ASOS-specific: variants array → sizes and colors
    const variants = s.variants as Record<string, unknown>[] | undefined
    if (Array.isArray(variants)) {
      const sizes = [...new Set(variants.map((v) => v.size as string).filter(Boolean))]
      const colors = [...new Set(variants.map((v) => v.colour as string).filter(Boolean))]
      if (sizes.length > 0) availableSizes = sizes
      if (colors.length > 0) availableColors = colors
    }

    // ASOS-specific: price nested object
    const asosPriceObj = s.price as Record<string, unknown> | undefined
    if (asosPriceObj?.current) {
      const current = asosPriceObj.current as Record<string, unknown>
      if (current.value) price = parseFloat(String(current.value))
      if (typeof current.currency === 'string') currency = current.currency as string
    }

    // ASOS-specific: media.images array
    const media = s.media as Record<string, unknown> | undefined
    if (Array.isArray(media?.images)) {
      const urls = (media!.images as Record<string, unknown>[])
        .map((img) => img.url as string)
        .filter(Boolean)
      if (urls.length > 0) images = urls
    }
  }

  return {
    name: name || 'Unknown Product',
    brand: brand || capFirst(extractDomain(url)),
    price,
    currency,
    images,
    material,
    materialBreakdown: parseMaterialBreakdown(material),
    availableSizes,
    availableColors,
    description,
    itemType: '',
    styleKeywords: [],
  }
}

// Searches common retailer data structures for material/fabric info
function findMaterial(s: Record<string, unknown>): string {
  // Schema.org direct field
  if (typeof s.material === 'string' && s.material) return s.material

  // ASOS: info.aboutMe / info.sizeAndFit arrays — each item is a string
  const info = s.info as Record<string, unknown> | undefined
  for (const key of ['aboutMe', 'sizeAndFit', 'lookAfterMe']) {
    const arr = info?.[key]
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (typeof item === 'string' && looksLikeMaterial(item)) return item
      }
    }
  }

  // ASOS / general: productDescription, details, or similar arrays of {term, value}
  for (const key of ['productDescription', 'details', 'productDetails', 'specifications']) {
    const arr = s[key]
    if (Array.isArray(arr)) {
      for (const d of arr) {
        const obj = d as Record<string, unknown>
        const term = String(obj.term ?? obj.name ?? obj.label ?? '').toLowerCase()
        if (term.includes('fabric') || term.includes('material') || term.includes('composition') || term.includes('content')) {
          const val = String(obj.value ?? obj.description ?? obj.text ?? '')
          if (val) return val
        }
        // Even if no term match, grab any value that looks like a material string
        const val = String(obj.value ?? obj.description ?? obj.text ?? '')
        if (looksLikeMaterial(val)) return val
      }
    }
  }

  // Last resort: extract a material pattern from the description text
  if (typeof s.description === 'string') {
    const match = s.description.match(/\d+\s*%\s*[A-Za-z][A-Za-z\s,]+/)
    if (match) return match[0].trim()
  }

  return ''
}

function looksLikeMaterial(s: string): boolean {
  return /\d+\s*%\s*[A-Za-z]/.test(s)
}

export function parseMaterialBreakdown(material: string): MaterialItem[] {
  if (!material) return []
  const result: MaterialItem[] = []
  // Matches "80% Cotton", "80% Recycled Polyester", etc.
  const regex = /(\d+(?:\.\d+)?)\s*%\s*([A-Za-z][A-Za-z\s\-]*?)(?=[,;/]|\s*\d|$)/g
  let match
  while ((match = regex.exec(material)) !== null) {
    const percentage = parseFloat(match[1])
    const fiber = match[2].trim()
    if (fiber && percentage > 0) result.push({ fiber, percentage })
  }
  return result
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '').split('.')[0]
  } catch {
    return ''
  }
}

function capFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
