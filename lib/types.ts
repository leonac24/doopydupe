export interface MaterialItem {
  fiber: string
  percentage: number
}

export interface Product {
  id: string
  url: string
  name: string
  brand: string
  price: number
  currency: string
  images: string[]
  material: string
  materialBreakdown: MaterialItem[]
  availableSizes: string[]
  availableColors: string[]
  description: string
  itemType: string
  styleKeywords: string[]
  scrapedAt: number
}

export interface Dupe {
  imageUrl: string
  productUrl: string
  name: string
  brand: string
  price: number | null
  currency: string
  priceDelta: number | null
  source: string
}
