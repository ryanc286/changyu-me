import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One .mdx file per case study. The homepage list is built from these fields.
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    company: z.string(),
    summary: z.string(),          // one line under the title on the homepage
    result: z.string().optional(), // key metric, shown after the summary
    order: z.number(),            // position on the homepage (1 = top)
    cover: z.string().optional(), // e.g. /images/credit-card-voucher/cover.jpg
    draft: z.boolean().default(false),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tools' }),
  schema: z.object({
    title: z.string(),
    type: z.string(),             // e.g. "Figma plugin"
    summary: z.string().optional(),
    order: z.number(),
    link: z.string().optional(),  // external link, if the tool lives elsewhere
  }),
});

export const collections = { work, tools };
