// @ts-check
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://pointerpodcast.it',
  output: 'static',
  trailingSlash: 'always',
  integrations: [pagefind()],
  build: {
    // Pagefind needs clean HTML to index; this is the default.
    format: 'directory',
  },
});
