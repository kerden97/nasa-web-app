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

  it('renders the hero section content', () => {
    renderPage()

    expect(screen.getByText('NASA Data Explorer')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Home & Beyond', level: 1 })).toBeInTheDocument()
    expect(
      screen.getByText(/A space-focused web experience built around NASA's open APIs\./i),
    ).toBeInTheDocument()
  })

  it('renders the main call-to-action links to Wonders of the Universe', () => {
    renderPage()

    const enterLink = screen.getByRole('link', {
      name: 'Enter Wonders of the Universe',
    })
    const exploreLink = screen.getByRole('link', {
      name: 'Explore Wonders',
    })

    expect(enterLink).toBeInTheDocument()
    expect(enterLink).toHaveAttribute('href', '/wonders-of-the-universe')

    expect(exploreLink).toBeInTheDocument()
    expect(exploreLink).toHaveAttribute('href', '/wonders-of-the-universe')
  })

  it('renders the featured destination section', () => {
    renderPage()

    expect(screen.getByText('Featured destination')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Wonders of the Universe', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Three NASA APIs in one hub:/i)).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Highlights')).toBeInTheDocument()
  })

  it('renders the three homepage feature cards', () => {
    renderPage()

    expect(screen.getByText('Astronomy Picture of the Day')).toBeInTheDocument()
    expect(screen.getByText('NASA Image Library')).toBeInTheDocument()
    expect(screen.getByText('EPIC Earth Imagery')).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Begin with a story, not just a thumbnail',
        level: 3,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Search 140,000+ images, videos, and audio files',
        level: 3,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Full-disk Earth photos from deep space',
        level: 3,
      }),
    ).toBeInTheDocument()
  })

  it('renders the coming next section and roadmap points', () => {
    renderPage()

    expect(screen.getByText('Coming next')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'A homepage built to welcome new space experiences',
        level: 2,
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('1. Discover a calm, curated starting point')).toBeInTheDocument()
    expect(
      screen.getByText('2. Enter focused destinations with their own character'),
    ).toBeInTheDocument()
    expect(screen.getByText('3. Return whenever new explorations arrive')).toBeInTheDocument()
  })
})
