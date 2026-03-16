import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import HomePage from '@/pages/HomePage'

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  it('sets the document title on mount', () => {
    renderPage()
    expect(document.title).toBe('Home & Beyond')
  })

  it('renders the hero heading and tagline', () => {
    renderPage()
    expect(screen.getByText('NASA Open-Data Explorer')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Home & Beyond', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Four NASA APIs, one interface/)).toBeInTheDocument()
  })

  it('renders both primary CTA links', () => {
    renderPage()

    const wondersLink = screen.getByRole('link', { name: /Explore the Universe/ })
    const asteroidLink = screen.getAllByRole('link', { name: 'Asteroid Watch' })[0]!

    expect(wondersLink).toHaveAttribute('href', '/wonders-of-the-universe')
    expect(asteroidLink).toHaveAttribute('href', '/asteroid-watch')
  })

  it('renders all four feature cards with correct routes', () => {
    renderPage()

    const cards = screen.getAllByRole('link').filter((el) => el.classList.contains('card-glow'))
    expect(cards).toHaveLength(4)

    const [apodCard, imageCard, epicCard, neoCard] = cards

    expect(apodCard).toHaveAttribute('href', '/wonders-of-the-universe/apod')
    expect(imageCard).toHaveAttribute('href', '/wonders-of-the-universe/nasa-image-library')
    expect(epicCard).toHaveAttribute('href', '/wonders-of-the-universe/epic')
    expect(neoCard).toHaveAttribute('href', '/asteroid-watch')
  })

  it('renders feature card headings', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Astronomy Picture of the Day', level: 3 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'NASA Image & Video Search', level: 3 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Earth from Deep Space', level: 3 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Asteroid Watch', level: 3 })).toBeInTheDocument()
  })

  it('renders the stats bar', () => {
    renderPage()

    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('NASA APIs')).toBeInTheDocument()
    expect(screen.getByText('140K+')).toBeInTheDocument()
    expect(screen.getByText('Live')).toBeInTheDocument()
  })
})
