import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '',
  optimizeDeps: {
    include: ['astrology-js'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  define: {
    'import.meta.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
  }
});