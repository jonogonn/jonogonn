import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  resolve: {
    preserveSymlinks: true
  },
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/janogon.news/api': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        secure: false
      },
      '/janogon/api': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://127.0.0.1/janogon.news',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://127.0.0.1/janogon',
        changeOrigin: true,
        secure: false
      },
      '/janogon.news/uploads': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        secure: false
      },
      '/janogon/uploads': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('html2canvas')) {
              return 'vendor-canvas';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-helmet-async')) {
              return 'vendor-react';
            }
          }
        }
      }
    }
  }
});
