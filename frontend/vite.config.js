import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/janogon/api': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        secure: false
      },
      '/janogon': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://127.0.0.1/janogon',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://127.0.0.1/janogon',
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
