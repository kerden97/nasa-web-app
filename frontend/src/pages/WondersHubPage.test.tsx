import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import WondersHubPage from '@/pages/WondersHubPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <WondersHubPage />
    </MemoryRouter>,
  )
}

describe('WondersHubPage', () => {
  it('renders the hub introduction', () => {
    renderPage()

    expect(screen.getByText('Observatory Deck')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Pick a NASA story stream and follow it all the way through.',
        level: 2,
      }),
    ).toBeInTheDocument()
  })

  it('renders all three wonders destination cards', () => {
    renderPage()

    expect(screen.getByRole('link', { name: /Astronomy Picture of the Day/i })).toHaveAttribute(
      'href',
      '/apod',
    )
    expect(screen.getByRole('link', { name: /NASA Image Library/i })).toHaveAttribute(
      'href',
      '/nasa-image-library',
    )
    expect(screen.getByRole('link', { name: /^EPIC/i })).toHaveAttribute('href', '/epic')
  })
})
