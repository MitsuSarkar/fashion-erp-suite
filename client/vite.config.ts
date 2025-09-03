import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repo = '<fashion-erp-suite>' // e.g. retail-erp-fashion-suite

export default defineConfig({
  plugins: [react()],
  base: `/${repo}/`, // needed for GitHub Pages
  server: {
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/health': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
