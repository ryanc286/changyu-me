import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One .mdx file per case study. The homepage list is built from these fields.
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    // Text (title, summary, result) lives in src/i18n/copy.json under work.<file name>.*
    company: z.string(),          // must match a name in src/data/companies.ts
    order: z.number(),            // position on the homepage (1 = top)
    cover: z.string().optional(), // e.g. /images/credit-card-voucher/cover.jpg
    draft: z.boolean().default(false),
    // Case page details. Synced from the Notion 案例內容 database (scripts/notion-case-to-mdx.mjs)
    subtitle: z.string().optional(),
    role: z.string().optional(),
    timeline: z.string().optional(),
    type: z.string().optional(),
    notion: z.string().optional(),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tools' }),
  schema: z.object({
    // Text (title, type, summary) lives in src/i18n/copy.json under tools.<file name>.*
    order: z.number(),
    link: z.string().optional(),  // external link, if the tool lives elsewhere
    cover: z.string().optional(), // preview image on the homepage, e.g. /images/tools/coach-match.jpg
  }),
});

export const collections = { work, tools };
