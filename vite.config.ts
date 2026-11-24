import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// The Last Witness — Vite configuration
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // preview host is proxied by the Arena sandbox
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  assetsInclude: ['**/*.mp3', '**/*.webp', '**/*.woff2'],
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-motion', test: /node_modules\/(motion|framer-motion|motion-dom|motion-utils)/ },
            { name: 'vendor-audio', test: /node_modules\/howler/ },
            { name: 'vendor-react', test: /node_modules\/(react|react-dom|scheduler|react-router)/ },
          ],
        },
      },
    },
  },
})
