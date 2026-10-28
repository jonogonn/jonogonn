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
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
