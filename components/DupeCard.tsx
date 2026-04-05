import type { Dupe } from '@/lib/types'

interface Props {
  dupe: Dupe
  originalPrice?: number
  currency?: string
}

export default function DupeCard({ dupe, originalPrice }: Props) {
  const hasDelta = dupe.priceDelta !== null && originalPrice && originalPrice > 0
  const cheaper = hasDelta && dupe.priceDelta! < 0
  const pctDiff =
    hasDelta && originalPrice
      ? Math.round((dupe.priceDelta! / originalPrice) * 100)
      : null

  return (
    <a
      href={dupe.productUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border-2 border-black hover:border-accent transition-colors"
    >
      {/* Image */}
      <div className="aspect-[3/4] bg-zinc-100 overflow-hidden relative">
        {dupe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dupe.imageUrl}
            alt={dupe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 text-sm">
            No image
          </div>
        )}

        {/* Price delta badge */}
        {pctDiff !== null && (
          <div
            className={`absolute top-2 right-2 text-white text-xs font-black px-2 py-1 ${
              cheaper ? 'bg-green-500' : 'bg-zinc-600'
            }`}
          >
            {cheaper ? `${pctDiff}%` : `+${pctDiff}%`}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          {dupe.source}
        </p>
        <p className="text-sm font-bold text-black leading-tight line-clamp-2">
          {dupe.name}
        </p>
        {dupe.price !== null ? (
          <p className="text-sm font-black text-accent">
            {dupe.currency} {dupe.price.toFixed(2)}
          </p>
        ) : (
          <p className="text-xs text-zinc-400">Price unavailable</p>
        )}
      </div>
    </a>
  )
}
