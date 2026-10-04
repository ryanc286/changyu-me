# changyu.me

Personal portfolio, built with [Astro](https://astro.build).

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs static site to dist/
```

## Where things live

| What | File |
|---|---|
| Colors, fonts, spacing | `src/styles/tokens.css` |
| Homepage intro text | `src/pages/index.astro` |
| Case studies | `src/content/work/*.mdx` (file name = URL, e.g. `credit-card-voucher.mdx` → `/credit-card-voucher`) |
| Tools | `src/content/tools/*.mdx` |
| Footer links | `src/components/Footer.astro` |
| Images | `public/images/` |

## Add a case study

Create `src/content/work/my-case.mdx`:

```mdx
---
title: My Case
company: PayPay
summary: One line shown on the homepage
result: +10% something
order: 6
cover: /images/my-case/cover.jpg
---

Write the case study here.
```

The homepage list updates on its own. Set `draft: true` to hide a case.

## Languages

English is the default (`/`), Traditional Chinese lives under `/zh-tw`.

| What | File |
|---|---|
| Interface text in both languages | `src/i18n/ui.ts` |
| Homepage intro (both languages) | `src/components/Home.astro` |
| Chinese summary / result for a case | `zh:` block in each `src/content/work/*.mdx` (falls back to English) |

Chinese font: IBM Plex Sans TC, self-hosted in `public/fonts/plex-sans-tc/` and split by
unicode-range (`src/styles/plex-sans-tc.css`), so a page only downloads the slices it uses.
Generated from the `@ibm/plex-sans-tc` npm package.

## Copy lives in Notion

All homepage text is in `src/i18n/copy.json`, mirrored in the Notion page
**changyu.me 網站 → 文案** (one row per key, English + 中文).

To sync after editing in Notion:

1. Export the database rows (`Key`, `English`, `中文`) to a JSON file
2. `node scripts/apply-notion-copy.mjs rows.json`
3. Build, check, commit, push

The script refuses unknown or missing keys and a missing `{AAPD}` marker, so a
bad edit never reaches the live site. Section and note fields stay in copy.json.
