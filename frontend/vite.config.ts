import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/services': resolve(__dirname, './src/services'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/contexts': resolve(__dirname, './src/contexts'),
      '@/hooks': resolve(__dirname, './src/hooks'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          router: ['react-router-dom'],
          window: ['react-window', 'react-window-infinite-loader'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    open: true,
    // Security headers in production should be set by the server/reverse proxy
    // Examples for production:
    // X-Frame-Options: DENY
    // X-XSS-Protection: 1; mode=block
    // X-Content-Type-Options: nosniff
    // Content-Security-Policy: default-src 'self'
  },
  preview: {
    port: 3000,
  },
})