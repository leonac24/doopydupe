# doopydupe

Fashion dupe finder. Paste any product link — get material info, sizing, and similar items from cheaper brands.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4)

---

## What it does

- **Product info** — paste a product URL and see the material breakdown, available sizes, colors, and price pulled directly from the retailer's page
- **Dupe finder** — uses Bing Visual Search to find visually similar items from different brands, with price deltas shown
- **Side-by-side compare** — pull up two products at once and compare material, price, and sizing

Supported sites: ASOS, Zara, H&M, SHEIN, Uniqlo, Madewell, Anthropologie, Nordstrom, Net-a-Porter, Farfetch, SSENSE

No AI, no required API keys to get started.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Dupe finding | Bing Visual Search API (optional) |
| Scraping | Fetch + Schema.org / ASOS JSON parsing |
| Language | TypeScript |

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/yourusername/doopydupe
cd doopydupe
npm install
```

### 2. Set up environment variables (optional)

```bash
cp .env.local.example .env.local
```

Both keys are optional:

```env
# Needed for Zara, SHEIN, SSENSE (anti-bot protection)
# Free tier: 1,000 calls/month — https://www.scraperapi.com
SCRAPER_API_KEY=

# Needed for the dupe finder feature
# Free tier: 1,000 calls/month via Azure — https://www.microsoft.com/en-us/bing/apis/bing-visual-search-api
BING_VISUAL_SEARCH_KEY=
```

> ASOS and Nordstrom work out of the box without any keys. Add ScraperAPI for sites with anti-bot protection. Add the Bing key to enable dupe finding.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/
  page.tsx                  # Homepage with URL input
  product/
    page.tsx                # Product page (server component)
    ProductAnalysis.tsx     # Product display (client component)
  compare/
    page.tsx                # Side-by-side comparison
  api/
    analyze/route.ts        # POST { url } → scraped product data
    dupes/route.ts          # POST { imageUrl } → Bing dupe results

lib/
  types.ts                  # Shared TypeScript types
  parser.ts                 # Extracts product data from HTML (Schema.org, meta tags, ASOS JSON)
  bing.ts                   # Bing Visual Search API
  scrapers/
    index.ts                # Scraper router (picks strategy by domain)
    asos.ts                 # ASOS-specific JSON extraction

components/
  URLInput.tsx              # URL paste + submit form
  DupeCard.tsx              # Dupe result card
```

---

## How it works

1. **Scraping** — fetches the product page HTML. For ASOS, extracts the `__NEXT_DATA__` JSON blob. For all other sites, looks for Schema.org `Product` JSON-LD (common on most major retailers) and falls back to OpenGraph meta tags.

2. **Parsing** — `lib/parser.ts` maps the scraped data into a structured product object: name, brand, price, material (with percentage breakdown), sizes, colors, and images.

3. **Dupe finding** — submits the product's first image to Bing Visual Search, which returns visually similar product pages. Results show name, brand, price, and how much cheaper/more expensive they are vs. the original.

---

## Roadmap

- [ ] Wishlist / boards (save items to custom folders)
- [ ] Optional user account (Supabase auth)
- [ ] User size + color palette profile
- [ ] Chrome extension
- [ ] More site-specific scrapers for better data accuracy
