import URLInput from '@/components/URLInput'

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
      <div className="text-center mb-10 space-y-3">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">
          Fashion Dupe Finder
        </p>
        <h1 className="text-6xl font-black tracking-tight leading-none">
          Find the dupe.
        </h1>
        <p className="text-zinc-500 text-lg max-w-md mx-auto">
          Paste any fashion product link. Get material info, sizing, and
          similar items from cheaper brands.
        </p>
      </div>

      <URLInput />

      <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl w-full text-center">
        <div className="space-y-1">
          <p className="text-2xl font-black">Product Info</p>
          <p className="text-sm text-zinc-500">
            Material, sizing, colors — all in one place.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-black">Dupe Finder</p>
          <p className="text-sm text-zinc-500">
            Same vibe, different brand.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-black">Compare</p>
          <p className="text-sm text-zinc-500">
            Side-by-side, no guessing.
          </p>
        </div>
      </div>
    </main>
  )
}
