import { NextRequest, NextResponse } from 'next/server'
import { scrapeProduct } from '@/lib/scrapers'
import { parseProduct } from '@/lib/parser'
import type { Product } from '@/lib/types'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  let url: string
  try {
    const body = await req.json()
    url = body.url
    new URL(url) // validate
  } catch {
    return NextResponse.json({ error: 'Invalid or missing URL' }, { status: 400 })
  }

  try {
    const { html, structuredJson } = await scrapeProduct(url)
    const attributes = parseProduct(html, url, structuredJson)

    const product: Product = {
      ...attributes,
      id: Buffer.from(url).toString('base64url').slice(0, 16),
      url,
      scrapedAt: Date.now(),
    }

    return NextResponse.json({ product })
  } catch (err) {
    console.error('[analyze]', err)
    const message = err instanceof Error ? err.message : 'Failed to fetch product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
