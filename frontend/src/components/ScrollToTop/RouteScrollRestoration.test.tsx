import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RouteScrollRestoration from '@/components/ScrollToTop/RouteScrollRestoration'

function TestApp() {
  return (
    <MemoryRouter initialEntries={['/one']}>
      <RouteScrollRestoration />
      <Routes>
        <Route path="/one" element={<Link to="/two">Go to two</Link>} />
        <Route path="/two" element={<div>Page two</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('RouteScrollRestoration', () => {
  const originalScrollTo = window.scrollTo

  afterEach(() => {
    window.scrollTo = originalScrollTo
    vi.restoreAllMocks()
  })

  it('scrolls to the top when the pathname changes', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo

    render(<TestApp />)

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })

    scrollTo.mockClear()
    await user.click(screen.getByRole('link', { name: 'Go to two' }))

    expect(await screen.findByText('Page two')).toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })
})
