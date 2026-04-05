import ProductAnalysis from './ProductAnalysis'

interface Props {
  searchParams: Promise<{ url?: string }>
}

export default async function ProductPage({ searchParams }: Props) {
  const { url } = await searchParams

  if (!url) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">No URL provided.</p>
          <a href="/" className="text-sm font-bold underline underline-offset-4 mt-2 inline-block">
            ← Back home
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <ProductAnalysis url={url} />
    </main>
  )
}
