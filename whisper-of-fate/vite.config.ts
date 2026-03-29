import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/whisper-of-fate/',
  optimizeDeps: {
    include: ['astrology-js'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});