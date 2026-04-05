# Doopydupe

Paste any fashion product link. Get material info, sizing, and similar items from cheaper brands.

---

## Features

- **Product lookup** — scrapes name, brand, price, material breakdown, sizes, and colors from the product page
- **Dupe finder** — uses Bing Visual Search to find visually similar items from other brands, with price comparison
- **Side-by-side compare** — pull up two products at once to compare material, price, and sizing

Works with ASOS, Zara, H&M, SHEIN, Uniqlo, Madewell, Anthropologie, Nordstrom, Net-a-Porter, Farfetch, and SSENSE.

---

## Stack

- **Next.js 16** (App Router) — frontend + API routes
- **Tailwind CSS v4** — styling
- **Cheerio** — HTML parsing
- **Bing Visual Search API** — dupe finding (optional)
- **ScraperAPI** — bypass anti-bot protection on certain sites (optional)

---

## Setup

```bash
git clone https://github.com/yourusername/doopydupe
cd doopydupe
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### API keys

Both are optional. The app works without them for most sites.

| Key | Purpose | Cost |
|---|---|---|
| `SCRAPER_API_KEY` | Needed for Zara, SHEIN, SSENSE (anti-bot) | Free tier: 1,000 calls/mo |
| `BING_VISUAL_SEARCH_KEY` | Enables the dupe finder | Free tier: 1,000 calls/mo via Azure |

ASOS and Nordstrom work out of the box with no keys.

---

## How it works

1. Fetches the product page HTML
2. Extracts structured data — checks for ASOS `__NEXT_DATA__` JSON, then Schema.org `Product` JSON-LD, then falls back to OpenGraph meta tags
3. Parses material composition, sizes, colors, and price out of that data
4. For dupes: submits the product image to Bing Visual Search and returns visually similar items ranked by price delta

---

## Roadmap

- [ ] Chrome extension
- [ ] Wishlist / boards
- [ ] User size + color profile
- [ ] Optional account sync (Supabase)
