'use client'
import { useState, useEffect } from 'react'
import DupeCard from '@/components/DupeCard'
import type { Product, Dupe } from '@/lib/types'

interface Props {
  url: string
}

export default function ProductAnalysis({ url }: Props) {
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingDupes, setLoadingDupes] = useState(false)
  const [dupes, setDupes] = useState<Dupe[] | null>(null)

  useEffect(() => {
    if (!url) return
    setProduct(null)
    setError(null)
    setDupes(null)

    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setProduct(data.product)
      })
      .catch(() => setError('Something went wrong. Try again.'))
  }, [url])

  async function handleFindDupes() {
    if (!product) return
    const imageUrl = product.images[0]
    if (!imageUrl) return

    setLoadingDupes(true)
    try {
      const res = await fetch('/api/dupes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          originalPrice: product.price,
          currency: product.currency,
        }),
      })
      const data = await res.json()
      setDupes(data.dupes ?? [])
    } finally {
      setLoadingDupes(false)
    }
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-4xl font-black mb-3">Hmm.</p>
        <p className="text-zinc-500 mb-6">{error}</p>
        <a href="/" className="text-sm font-bold underline underline-offset-4">
          ← Try another URL
        </a>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">
          Fetching…
        </p>
        <p className="text-xs text-zinc-300 max-w-xs mx-auto break-all">{url}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">

      {/* ── Product Overview ── */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Image */}
        <div>
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full aspect-[3/4] object-cover border-2 border-black"
            />
          ) : (
            <div className="w-full aspect-[3/4] bg-zinc-100 border-2 border-black flex items-center justify-center text-zinc-300">
              No image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
              {product.brand}
            </p>
            <h1 className="text-3xl font-black leading-tight mt-1">
              {product.name}
            </h1>
            {product.price > 0 && (
              <p className="text-2xl font-black text-accent mt-2">
                {product.currency} {product.price.toFixed(2)}
              </p>
            )}
            {product.description && (
              <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 border-t border-zinc-100 pt-4">
            {/* Sizes */}
            {product.availableSizes.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Sizes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.availableSizes.map((s) => (
                    <span key={s} className="text-xs font-bold px-2 py-1 border border-black">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.availableColors.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Colors
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.availableColors.map((c) => (
                    <span key={c} className="text-xs font-bold px-2 py-1 border border-black">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Material */}
            {(product.material || product.materialBreakdown.length > 0) && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Material
                </p>
                {product.materialBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {product.materialBreakdown.map((m) => (
                      <div key={m.fiber}>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>{m.fiber}</span>
                          <span>{m.percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-100">
                          <div className="h-full bg-black" style={{ width: `${m.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-600">{product.material}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Dupes ── */}
      <div className="border-t-2 border-black pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Find Dupes</h2>
            <p className="text-sm text-zinc-500">
              Same {product.itemType || 'vibe'}, different brand.
            </p>
          </div>
          {!dupes && (
            <button
              onClick={handleFindDupes}
              disabled={loadingDupes || !product.images[0]}
              className="px-5 py-2.5 bg-accent text-white font-black text-sm uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-40"
            >
              {loadingDupes ? 'Searching…' : 'Find Dupes →'}
            </button>
          )}
        </div>

        {dupes?.length === 0 && (
          <p className="text-sm text-zinc-400">No dupes found. Try a different product.</p>
        )}

        {dupes && dupes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {dupes.map((dupe, i) => (
              <DupeCard
                key={i}
                dupe={dupe}
                originalPrice={product.price}
                currency={product.currency}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Compare CTA ── */}
      <div className="border-t-2 border-black pt-6 text-center">
        <a
          href={`/compare?url1=${encodeURIComponent(url)}`}
          className="inline-block px-6 py-3 border-2 border-black font-black text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
        >
          Compare This Item →
        </a>
      </div>
    </div>
  )
}
