import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  define: {
    'process.env.NODE_ENV': '"development"'
  },
  
  build: {
    outDir: 'dist/js',
    emptyOutDir: false,
    lib: {
      entry: 'src/gutenberg-main.jsx',
      name: 'GutenbergInlineManager',
      fileName: () => 'gutenberg-inline-manager.js',
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    sourcemap: true,
    minify: false
  },
  
  server: {
    port: 3001,
    host: true
  }
});