import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import WondersPage from '@/pages/WondersPage'
import WondersHubPage from '@/pages/WondersHubPage'

function renderPage(initialPath = '/wonders-of-the-universe/apod') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/wonders-of-the-universe" element={<WondersPage />}>
          <Route index element={<WondersHubPage />} />
          <Route path="apod" element={<div>APOD page</div>} />
          <Route path="nasa-image-library" element={<div>Library page</div>} />
          <Route path="epic" element={<div>EPIC page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('WondersPage', () => {
  it('sets the document title on mount', () => {
    renderPage()
    expect(document.title).toBe('Wonders of the Universe | Home & Beyond')
  })

  it('renders the page heading and description on the hub route', () => {
    renderPage('/wonders-of-the-universe')
    expect(
      screen.getByRole('heading', { name: 'Wonders of the Universe', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Explore NASA's featured daily stories/)).toBeInTheDocument()
  })

  it('does not render the old hub tab row', () => {
    renderPage('/wonders-of-the-universe')

    expect(
      screen.queryByRole('link', { name: 'Astronomy Picture of the Day' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'NASA Image Library' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'EPIC' })).not.toBeInTheDocument()
  })

  it('does not render the old hub tab row on subpages', () => {
    renderPage('/wonders-of-the-universe/apod')

    expect(screen.queryByRole('link', { name: 'NASA Image Library' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'EPIC' })).not.toBeInTheDocument()
  })

  it('links the wonders breadcrumb back to the hub on subpages', () => {
    renderPage('/wonders-of-the-universe/apod')

    expect(screen.getByRole('link', { name: 'Wonders of the Universe' })).toHaveAttribute(
      'href',
      '/wonders-of-the-universe',
    )
  })
})
