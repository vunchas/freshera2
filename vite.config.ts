import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'static',
    rollupOptions: {
      output: {
        entryFileNames: 'static/js/main.js',
        chunkFileNames: 'static/js/[name].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (name.endsWith('.css')) {
            return 'static/css/main.css';
          }
          return 'static/[name].[ext]';
        }
      }
    }
  }
});