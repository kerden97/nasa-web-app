import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionProvider } from '@/context/MotionContext'
import { ThemeProvider } from '@/context/ThemeContext'
import '@/index.css'
import App from '@/App.tsx'

// Wake the backend from Render cold sleep as early as possible
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
fetch(`${API_URL}/healthz`, { priority: 'low' } as RequestInit).catch(() => {})

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
