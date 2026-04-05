'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function URLInput({ defaultValue = '' }: { defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue)
  const router = useRouter()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    router.push(`/product?url=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a product URL…"
          className="flex-1 px-4 py-3.5 text-base border-2 border-black focus:outline-none focus:border-accent bg-white placeholder:text-zinc-400"
          required
        />
        <button
          type="submit"
          className="px-7 py-3.5 bg-accent text-white font-black text-sm uppercase tracking-wider hover:bg-black transition-colors whitespace-nowrap"
        >
          Look it up →
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-400">
        ASOS · Zara · H&M · Nordstrom · Net-a-Porter · Farfetch + more
      </p>
    </form>
  )
}
