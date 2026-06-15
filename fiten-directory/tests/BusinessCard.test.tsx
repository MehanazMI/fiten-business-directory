import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BusinessCard from '@/app/directory/BusinessCard'
import { makeBusiness } from './fixtures'

function setup(overrides = {}, isFavorited = false) {
  const business = makeBusiness(overrides)
  const onSelect = vi.fn()
  const onFavorite = vi.fn()
  const user = userEvent.setup()
  render(<BusinessCard business={business} isFavorited={isFavorited} onSelect={onSelect} onFavorite={onFavorite} lang="en" />)
  return { user, business, onSelect, onFavorite }
}

describe('BusinessCard — display', () => {
  it('renders the business name', () => {
    setup()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders category and city', () => {
    setup()
    expect(screen.getByText(/Tech/)).toBeInTheDocument()
    expect(screen.getByText(/Toronto/)).toBeInTheDocument()
  })

  it('renders initials badge when no logoUrl', () => {
    setup()
    const badge = document.querySelector('.card-initials') as HTMLElement
    expect(badge).toBeInTheDocument()
  })

  it('renders description', () => {
    setup()
    expect(screen.getByText('A great tech company')).toBeInTheDocument()
  })

  it('shows PRO badge for pro businesses', () => {
    setup({ pro: true })
    expect(screen.getByText('🏅 FeTNA Sponsor')).toBeInTheDocument()
  })

  it('does not show PRO badge for non-pro businesses', () => {
    setup({ pro: false })
    expect(screen.queryByText('🏅 FeTNA Sponsor', { selector: '.pro-badge' })).not.toBeInTheDocument()
  })
})

describe('BusinessCard — B2B signals', () => {
  it('renders "partner" signal', () => {
    setup({ looking: ['partner'] })
    expect(screen.getByText('Partner')).toBeInTheDocument()
  })

  it('renders "hire" signal', () => {
    setup({ looking: ['hire'] })
    expect(screen.getByText(/Hiring/)).toBeInTheDocument()
  })

  it('renders speaker badge', () => {
    setup({ speaker: true })
    expect(screen.getByText(/Speaker/)).toBeInTheDocument()
  })

  it('renders women-led inline in location', () => {
    setup({ women: true })
    expect(screen.getByText(/Women-led/)).toBeInTheDocument()
  })

  it('shows FeTNA Sponsor badge when pro is true', () => {
    setup({ pro: true })
    expect(screen.getByText('🏅 FeTNA Sponsor')).toBeInTheDocument()
  })

  it('renders no signal badges when looking is empty and all flags false', () => {
    setup({ looking: [], speaker: false, women: false, convention: false })
    expect(screen.queryByText('Partner')).not.toBeInTheDocument()
    expect(screen.queryByText(/Hiring/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Speaker/)).not.toBeInTheDocument()
  })
})

describe('BusinessCard — favorites', () => {
  it('shows unfavorited heart when not favorited', () => {
    setup()
    expect(screen.getByLabelText('Add to favourites')).toBeInTheDocument()
  })

  it('shows filled heart when favorited', () => {
    const business = makeBusiness()
    render(<BusinessCard business={business} isFavorited={true} onSelect={vi.fn()} onFavorite={vi.fn()} lang="en" />)
    expect(screen.getByLabelText('Remove from favourites')).toBeInTheDocument()
  })

  it('calls onFavorite with business id when heart is clicked', async () => {
    const { user, onFavorite, business } = setup()
    await user.click(screen.getByLabelText('Add to favourites'))
    expect(onFavorite).toHaveBeenCalledWith(business.id)
  })

  it('does not call onSelect when heart is clicked (stopPropagation)', async () => {
    const { user, onSelect } = setup()
    await user.click(screen.getByLabelText('Add to favourites'))
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('BusinessCard — interactions', () => {
  it('calls onSelect when card is clicked', async () => {
    const { user, onSelect, business } = setup()
    await user.click(screen.getByText('Acme Corp'))
    expect(onSelect).toHaveBeenCalledWith(business)
  })

  it('does not show a View button (whole card is clickable)', () => {
    setup({ pro: true })
    expect(screen.queryByRole('button', { name: 'View' })).not.toBeInTheDocument()
  })

  it('does not show PRO upgrade button', () => {
    setup({ pro: false })
    expect(screen.queryByRole('button', { name: 'PRO' })).not.toBeInTheDocument()
  })
})

describe('BusinessCard — language', () => {
  it('shows Tamil name in ta mode when nameTamil is present', () => {
    const business = makeBusiness({ nameTamil: 'அக்மே கார்ப்' })
    render(<BusinessCard business={business} isFavorited={false} onSelect={vi.fn()} onFavorite={vi.fn()} lang="ta" />)
    expect(screen.getByText('அக்மே கார்ப்')).toBeInTheDocument()
  })

  it('falls back to English name in ta mode when nameTamil is absent', () => {
    const business = makeBusiness({ nameTamil: undefined })
    render(<BusinessCard business={business} isFavorited={false} onSelect={vi.fn()} onFavorite={vi.fn()} lang="ta" />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })
})

describe('BusinessCard — star rating', () => {
  it('renders star rating in new format', () => {
    setup({ rating: 4, reviews: 1 })
    expect(screen.getByText('★')).toBeInTheDocument()
    expect(screen.getByText(/4\.0/)).toBeInTheDocument()
  })

  it('shows rating value and review count', () => {
    setup({ rating: 4.5, reviews: 12 })
    expect(screen.getByText(/4\.5/)).toBeInTheDocument()
    expect(screen.getByText(/12/)).toBeInTheDocument()
  })
})
