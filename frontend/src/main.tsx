import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionProvider } from '@/context/MotionContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { getApiBaseUrl } from '@/lib/apiBaseUrl'
import '@/index.css'
import App from '@/App.tsx'

// Wake the backend from Render cold sleep as early as possible
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const API_URL = getApiBaseUrl()

if (configuredApiUrl && configuredApiUrl !== window.location.origin) {
  fetch(`${API_URL}/healthz`, { priority: 'low' } as RequestInit).catch(() => {})
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MotionProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MotionProvider>
    </BrowserRouter>
  </StrictMode>,
)
