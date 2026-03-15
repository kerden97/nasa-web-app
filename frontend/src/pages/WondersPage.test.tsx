import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import WondersPage from '@/pages/WondersPage'

function renderPage(initialPath = '/wonders-of-the-universe/apod') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <WondersPage />
    </MemoryRouter>,
  )
}

describe('WondersPage', () => {
  it('sets the document title on mount', () => {
    renderPage()
    expect(document.title).toBe('Wonders of the Universe | Home & Beyond')
  })

  it('renders the page heading and description', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { name: 'Wonders of the Universe', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Explore NASA's featured daily stories/)).toBeInTheDocument()
  })

  it('renders all three navigation tabs', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Astronomy Picture of the Day' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'NASA Image Library' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'EPIC' })).toBeInTheDocument()
  })

  it('links tabs to the correct sub-routes', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Astronomy Picture of the Day' })).toHaveAttribute(
      'href',
      '/apod',
    )
    expect(screen.getByRole('link', { name: 'NASA Image Library' })).toHaveAttribute(
      'href',
      '/nasa-image-library',
    )
    expect(screen.getByRole('link', { name: 'EPIC' })).toHaveAttribute('href', '/epic')
  })
})
