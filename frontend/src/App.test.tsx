import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { MotionProvider } from '@/context/MotionContext'
import { ThemeProvider } from '@/context/ThemeContext'

function renderApp(initialPath: string) {
  localStorage.setItem('theme', 'light')
  localStorage.setItem('stars-paused', 'true')

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <MotionProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MotionProvider>
    </MemoryRouter>,
  )
}

describe('App not found routes', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.backgroundColor = ''
    document.documentElement.style.colorScheme = ''
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.backgroundColor = ''
    document.documentElement.style.colorScheme = ''
  })

  it('renders the frontend 404 page for invalid standalone routes', () => {
    renderApp('/aaaaaaaaa')

    expect(screen.getByRole('heading', { name: 'Page not found', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('/aaaaaaaaa')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Return Home/i })).toHaveAttribute('href', '/')
  })

  it('renders the frontend 404 page for invalid nested wonders routes', () => {
    renderApp('/wonders-of-the-universe/apodaa')

    expect(screen.getByRole('heading', { name: 'Page not found', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('/wonders-of-the-universe/apodaa')).toBeInTheDocument()
    expect(document.title).toBe('404 | Home & Beyond')
  })
})
