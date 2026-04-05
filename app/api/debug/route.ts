import { NextRequest, NextResponse } from 'next/server'
import { scrapeProduct } from '@/lib/scrapers'

// Only available in development
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug only available in development' }, { status: 403 })
  }

  const { url } = await req.json()
  const { structuredJson } = await scrapeProduct(url)
  return NextResponse.json({ structuredJson })
}
