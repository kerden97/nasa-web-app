/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const devProxyTarget = env.VITE_DEV_PROXY_TARGET?.trim() || 'http://localhost:4000'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: devProxyTarget,
          changeOrigin: true,
        },
        '/healthz': {
          target: devProxyTarget,
          changeOrigin: true,
        },
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
      coverage: {
        provider: 'v8',
        reporter: ['text-summary', 'json-summary'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/types/**'],
        thresholds: {
          statements: 75,
          branches: 62,
          functions: 71,
          lines: 78,
        },
      },
    },
  }
})
