import type { Dupe } from './types'

interface BingImageResult {
  name?: string
  contentUrl?: string
  hostPageUrl: string
  thumbnailUrl?: string
  insightsMetadata?: {
    aggregateOffer?: {
      name?: string
      priceCurrency?: string
      lowPrice?: number
      offerCount?: number
      seller?: { name?: string }
    }
  }
}

export async function findDupes(
  imageUrl: string,
  originalPrice: number,
  currency: string
): Promise<Dupe[]> {
  const apiKey = process.env.BING_VISUAL_SEARCH_KEY
  if (!apiKey) return []

  const knowledgeRequest = JSON.stringify({
    imageInfo: { url: imageUrl },
  })

  const formData = new FormData()
  formData.append('knowledgeRequest', knowledgeRequest)

  const res = await fetch(
    'https://api.bing.microsoft.com/v7.0/images/visualsearch',
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
      body: formData,
    }
  )

  if (!res.ok) return []

  const data = await res.json()
  const dupes: Dupe[] = []

  for (const tag of data.tags ?? []) {
    for (const action of tag.actions ?? []) {
      if (
        action.actionType === 'SimilarProducts' ||
        action.actionType === 'VisualSearch'
      ) {
        for (const item of (action.data?.value ?? []) as BingImageResult[]) {
          if (!item.hostPageUrl) continue

          const offer = item.insightsMetadata?.aggregateOffer
          const price = offer?.lowPrice ?? null
          const priceDelta =
            price !== null && originalPrice > 0
              ? price - originalPrice
              : null

          let source = ''
          try {
            source = new URL(item.hostPageUrl).hostname.replace('www.', '')
          } catch {
            source = 'unknown'
          }

          const brand =
            offer?.seller?.name ?? capFirst(source.split('.')[0])

          dupes.push({
            imageUrl: item.thumbnailUrl ?? item.contentUrl ?? '',
            productUrl: item.hostPageUrl,
            name: item.name ?? offer?.name ?? 'Similar Item',
            brand,
            price,
            currency: offer?.priceCurrency ?? currency,
            priceDelta,
            source,
          })

          if (dupes.length >= 8) break
        }
      }
      if (dupes.length >= 8) break
    }
    if (dupes.length >= 8) break
  }

  return dupes
}

function capFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
