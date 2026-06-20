import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import SiteHeader from '@/app/components/SiteHeader'

describe('SiteHeader — default (directory page)', () => {
  it('renders the FiTEN logo text', () => {
    render(<SiteHeader />)
    expect(screen.getByText('Fi')).toBeInTheDocument()
    expect(screen.getByText('TEN')).toBeInTheDocument()
  })

  it('logo links to /directory', () => {
    render(<SiteHeader />)
    const logoLink = screen.getByRole('link', { name: /FiTEN.*Business Directory/i })
    expect(logoLink).toHaveAttribute('href', '/directory')
  })

  it('shows "Add Your Business" button linking to /form', () => {
    render(<SiteHeader />)
    const btn = screen.getByRole('link', { name: /Add Your Business/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('href', '/form')
  })

  it('does not show "View Directory" link', () => {
    render(<SiteHeader />)
    expect(screen.queryByRole('link', { name: /View Directory/i })).not.toBeInTheDocument()
  })
})

describe('SiteHeader — form page (page="form")', () => {
  it('renders the FiTEN logo text', () => {
    render(<SiteHeader page="form" />)
    expect(screen.getByText('Fi')).toBeInTheDocument()
    expect(screen.getByText('TEN')).toBeInTheDocument()
  })

  it('logo still links to /directory', () => {
    render(<SiteHeader page="form" />)
    const logoLink = screen.getByRole('link', { name: /FiTEN.*Business Directory/i })
    expect(logoLink).toHaveAttribute('href', '/directory')
  })

  it('shows "View Directory" link to /directory', () => {
    render(<SiteHeader page="form" />)
    const link = screen.getByRole('link', { name: /View Directory/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/directory')
  })

  it('does not show "Add Your Business" button', () => {
    render(<SiteHeader page="form" />)
    expect(screen.queryByRole('link', { name: /Add Your Business/i })).not.toBeInTheDocument()
  })
})
