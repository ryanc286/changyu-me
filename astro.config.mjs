import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://changyu.me',
  // Keep URLs like /credit-card-voucher (no trailing slash), same as the Framer site
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [mdx(), sitemap()],
});
