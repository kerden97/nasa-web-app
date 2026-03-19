import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Navbar from '@/components/Header/Navbar'
import { MotionProvider } from '@/context/MotionContext'
import { ThemeProvider } from '@/context/ThemeContext'

const activeClassFragment = 'bg-[rgba(37,99,235,0.08)]'

function setWindowWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
}

function renderNavbar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <MotionProvider>
        <ThemeProvider>
          <Navbar />
        </ThemeProvider>
      </MotionProvider>
    </MemoryRouter>,
  )
}

async function openMobileMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /open mobile menu/i }))
  expect(screen.getByRole('button', { name: /close mobile menu/i })).toBeInTheDocument()
}

function getWondersMenuLinks() {
  return [
    screen.getByRole('link', { name: 'Wonders' }),
    screen.getByRole('link', { name: 'Astronomy Picture of the Day' }),
    screen.getByRole('link', { name: 'NASA Image Library' }),
    screen.getByRole('link', { name: 'EPIC' }),
  ]
}

describe('Navbar mobile menu', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.style.overflow = ''
    document.documentElement.classList.remove('dark')
    setWindowWidth(390)
  })

  afterEach(() => {
    document.body.style.overflow = ''
    document.documentElement.classList.remove('dark')
  })

  it('opens and closes the mobile menu and restores body scroll', async () => {
    const user = userEvent.setup()
    document.body.style.overflow = 'auto'

    renderNavbar('/')

    expect(screen.queryByRole('button', { name: /close mobile menu/i })).not.toBeInTheDocument()

    await openMobileMenu(user)

    expect(
      screen.getByText(/Pick a destination and keep moving through the app/i),
    ).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')

    await user.click(screen.getByRole('button', { name: /close mobile menu/i }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /close mobile menu/i })).not.toBeInTheDocument()
    })
    expect(document.body.style.overflow).toBe('auto')
  })

  it('closes the mobile menu when Escape is pressed and restores body scroll', async () => {
    const user = userEvent.setup()
    document.body.style.overflow = 'scroll'

    renderNavbar('/wonders-of-the-universe')
    await openMobileMenu(user)

    fireEvent.keyDown(window, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /close mobile menu/i })).not.toBeInTheDocument()
    })
    expect(document.body.style.overflow).toBe('scroll')
  })

  it('closes the mobile menu on resize to desktop width and restores body scroll', async () => {
    const user = userEvent.setup()
    document.body.style.overflow = 'clip'

    renderNavbar('/wonders-of-the-universe/apod')
    await openMobileMenu(user)

    setWindowWidth(1024)
    fireEvent(window, new Event('resize'))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /close mobile menu/i })).not.toBeInTheDocument()
    })
    expect(document.body.style.overflow).toBe('clip')
  })

  it('shows only the Wonders parent as active on the hub route', async () => {
    const user = userEvent.setup()

    renderNavbar('/wonders-of-the-universe')
    await openMobileMenu(user)

    const [wondersLink, apodLink, imageLink, epicLink] = getWondersMenuLinks()
    const activeLinks = getWondersMenuLinks().filter((link) =>
      link.className.includes(activeClassFragment),
    )

    expect(activeLinks).toHaveLength(1)
    expect(wondersLink.className).toContain(activeClassFragment)
    expect(apodLink.className).not.toContain(activeClassFragment)
    expect(imageLink.className).not.toContain(activeClassFragment)
    expect(epicLink.className).not.toContain(activeClassFragment)
  })

  it('shows only the current Wonders child as active on a subroute', async () => {
    const user = userEvent.setup()

    renderNavbar('/wonders-of-the-universe/nasa-image-library')
    await openMobileMenu(user)

    const [wondersLink, apodLink, imageLink, epicLink] = getWondersMenuLinks()
    const activeLinks = getWondersMenuLinks().filter((link) =>
      link.className.includes(activeClassFragment),
    )

    expect(activeLinks).toHaveLength(1)
    expect(wondersLink.className).not.toContain(activeClassFragment)
    expect(apodLink.className).not.toContain(activeClassFragment)
    expect(imageLink.className).toContain(activeClassFragment)
    expect(epicLink.className).not.toContain(activeClassFragment)
  })

  it('does not treat invalid Wonders subpaths as active child routes', async () => {
    renderNavbar('/wonders-of-the-universe/apodaa')

    expect(screen.getByRole('button', { name: 'Wonders' })).toBeInTheDocument()

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Wonders' }))

    const apodLink = await screen.findByRole('menuitem', {
      name: 'Astronomy Picture of the Day',
    })

    expect(apodLink.className).not.toContain('bg-slate-100')
  })
})
