'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Product } from '@/lib/types'

function CompareInner() {
  const params = useSearchParams()
  const [url1, setUrl1] = useState(params.get('url1') ?? '')
  const [url2, setUrl2] = useState(params.get('url2') ?? '')
  const [result1, setResult1] = useState<Product | null>(null)
  const [result2, setResult2] = useState<Product | null>(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  async function analyze(
    url: string,
    set: (p: Product) => void,
    setLoading: (b: boolean) => void
  ) {
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!data.error) set(data.product)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const u1 = params.get('url1')
    if (u1) analyze(u1, setResult1, setLoading1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (url1) analyze(url1, setResult1, setLoading1)
    if (url2) analyze(url2, setResult2, setLoading2)
  }

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-4xl font-black">Compare</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Paste two product URLs to compare side by side.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        {[
          { label: 'Item 1', value: url1, set: setUrl1 },
          { label: 'Item 2', value: url2, set: setUrl2 },
        ].map(({ label, value, set }) => (
          <div key={label} className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
              {label}
            </label>
            <input
              type="url"
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 text-sm border-2 border-black focus:outline-none focus:border-accent"
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-accent text-white font-black text-sm uppercase tracking-wider hover:bg-black transition-colors"
          >
            Compare →
          </button>
        </div>
      </form>

      {(result1 || result2 || loading1 || loading2) && (
        <div className="grid sm:grid-cols-2 gap-6 border-t-2 border-black pt-8">
          {[
            { result: result1, loading: loading1 },
            { result: result2, loading: loading2 },
          ].map(({ result, loading }, i) => (
            <div key={i} className="space-y-4">
              {loading && (
                <div className="text-center py-10">
                  <div className="flex justify-center gap-1.5 mb-3">
                    {[0, 1, 2].map((j) => (
                      <span
                        key={j}
                        className="w-2 h-2 rounded-full bg-accent animate-bounce"
                        style={{ animationDelay: `${j * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
                    Fetching…
                  </p>
                </div>
              )}

              {result && (
                <>
                  {result.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={result.images[0]}
                      alt={result.name}
                      className="w-full aspect-[3/4] object-cover border-2 border-black"
                    />
                  )}

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {result.brand}
                    </p>
                    <p className="font-black text-lg leading-tight">{result.name}</p>
                    {result.price > 0 && (
                      <p className="text-accent font-black text-lg">
                        {result.currency} {result.price.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Material */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                      Material
                    </p>
                    {result.materialBreakdown.length > 0 ? (
                      <div className="space-y-1.5">
                        {result.materialBreakdown.map((m) => (
                          <div key={m.fiber}>
                            <div className="flex justify-between text-xs font-bold mb-0.5">
                              <span>{m.fiber}</span>
                              <span>{m.percentage}%</span>
                            </div>
                            <div className="h-1 bg-zinc-100">
                              <div
                                className="h-full bg-black"
                                style={{ width: `${m.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400">{result.material || '—'}</p>
                    )}
                  </div>

                  {/* Sizes */}
                  {result.availableSizes.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                        Sizes
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.availableSizes.map((s) => (
                          <span
                            key={s}
                            className="text-xs font-bold px-2 py-1 border border-black"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareInner />
    </Suspense>
  )
}
