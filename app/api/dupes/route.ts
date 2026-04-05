import { NextRequest, NextResponse } from 'next/server'
import { findDupes } from '@/lib/bing'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const { imageUrl, originalPrice, currency } = await req.json()

  if (!imageUrl) {
    return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
  }

  try {
    const dupes = await findDupes(
      imageUrl,
      originalPrice ?? 0,
      currency ?? 'USD'
    )
    return NextResponse.json({ dupes })
  } catch (err) {
    console.error('[dupes]', err)
    return NextResponse.json({ error: 'Failed to find dupes' }, { status: 500 })
  }
}
