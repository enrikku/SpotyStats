// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()]
	},
  adapter: vercel({}),
  output: 'server',
  integrations: [react()],
});