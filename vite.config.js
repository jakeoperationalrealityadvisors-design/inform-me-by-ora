import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Clean Vite config — no InForm' Me by ORA
export default defineConfig({
  logLevel: 'error',
  plugins: [
    react(),
  ],
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
})
