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
