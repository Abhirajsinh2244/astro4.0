// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'server',

  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});