import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://idhaniel.github.io',
  integrations: [react()],
  // Inline the CSS so it doesn't block the first paint (it's small).
  build: { inlineStylesheets: 'always' },
  vite: {
    server: {
      // Dev only: lets Daniel preview on his phone through an ngrok tunnel.
      allowedHosts: ['wagon-feminism-strum.ngrok-free.dev'],
    },
  },
});
