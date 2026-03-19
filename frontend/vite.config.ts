/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function getManualChunk(id: string): string | undefined {
  const normalizedId = id.replace(/\\/g, '/')

  if (normalizedId.includes('/node_modules/')) {
    if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/')) {
      return 'react-core'
    }

    if (normalizedId.includes('/react-router-dom/')) {
      return 'router'
    }

    if (normalizedId.includes('/lucide-react/')) {
      return 'icons'
    }

    if (normalizedId.includes('/recharts/')) {
      return 'charts'
    }

    return undefined
  }

  return undefined
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: getManualChunk,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
