import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use /Ai-web/ for production (GitHub Pages), but root for local dev
  base: mode === 'production' ? '/Ai-web/' : '/',
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  // Build করার সময় কোনো সমস্যা এড়াতে এটি যোগ করা হয়েছে
  build: {
    outDir: 'dist',
  }
}))