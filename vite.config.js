import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Clean Vite config — no Base44
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
})
