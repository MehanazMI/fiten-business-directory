import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import SiteHeader from '@/app/components/SiteHeader'

describe('SiteHeader — default (directory page)', () => {
  it('renders the FiTEN logo text', () => {
    render(<SiteHeader />)
    expect(screen.getByText('Fi')).toBeInTheDocument()
    expect(screen.getByText('TEN')).toBeInTheDocument()
  })

  it('logo links to home', () => {
    render(<SiteHeader />)
    const logoLink = screen.getByRole('link', { name: /FiTEN.*Business Directory/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('shows "Add Your Business" button in hdr-right linking to /form', () => {
    render(<SiteHeader />)
    const hdrRight = document.querySelector('.hdr-right') as HTMLElement
    const btn = within(hdrRight).getByRole('link', { name: /Get Listed/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('href', '/form')
  })

  it('does not show "View Directory" link', () => {
    render(<SiteHeader />)
    expect(screen.queryByRole('link', { name: /View Directory/i })).not.toBeInTheDocument()
  })

  it('renders the primary nav menu links', () => {
    render(<SiteHeader />)
    const nav = document.querySelector('.nav-hdr') as HTMLElement
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(nav).getByRole('link', { name: 'Directory' })).toHaveAttribute('href', '/directory')
    expect(within(nav).getByRole('link', { name: 'Connect' })).toHaveAttribute('href', '/connect')
    expect(within(nav).getByRole('link', { name: 'Events' })).toHaveAttribute('href', '/events')
    expect(within(nav).getByRole('link', { name: 'Get Listed' })).toHaveAttribute('href', '/form')
  })

  it('applies active class to the correct nav link', () => {
    render(<SiteHeader activeLink="events" />)
    const nav = document.querySelector('.nav-hdr') as HTMLElement
    const eventsLink = within(nav).getByRole('link', { name: 'Events' })
    expect(eventsLink.className).toContain('active')
  })

  it('renders without crashing when AuthButton is in loading state (default)', () => {
    const { container } = render(<SiteHeader />)
    expect(container.querySelector('.site-header')).toBeInTheDocument()
  })
})

describe('SiteHeader — form page (page="form")', () => {
  it('renders the FiTEN logo text', () => {
    render(<SiteHeader page="form" />)
    expect(screen.getByText('Fi')).toBeInTheDocument()
    expect(screen.getByText('TEN')).toBeInTheDocument()
  })

  it('logo still links to home', () => {
    render(<SiteHeader activeLink="form" />)
    const logoLink = screen.getByRole('link', { name: /FiTEN.*Business Directory/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('shows "Get Listed" CTA in hdr-right', () => {
    render(<SiteHeader activeLink="form" />)
    const hdrRight = document.querySelector('.hdr-right') as HTMLElement
    expect(within(hdrRight).getByRole('link', { name: /Get Listed/i })).toBeInTheDocument()
  })
})
