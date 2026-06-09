import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterRow from '@/app/directory/FilterRow'

function setup(overrides: Partial<Parameters<typeof FilterRow>[0]> = {}) {
  const props = {
    activeFilter: 'All',
    activeView: 'grid' as const,
    sort: 'default',
    showFavs: false,
    onFilterChange: vi.fn(),
    onViewChange: vi.fn(),
    onSortChange: vi.fn(),
    onFavsToggle: vi.fn(),
    ...overrides,
  }
  const user = userEvent.setup()
  render(<FilterRow {...props} />)
  return { user, ...props }
}

describe('FilterRow — filter pills', () => {
  it('renders All and Pro filter buttons', () => {
    setup()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pro' })).toBeInTheDocument()
  })

  it('marks the active filter with the active class', () => {
    setup({ activeFilter: 'Pro' })
    expect(screen.getByRole('button', { name: 'Pro' })).toHaveClass('active')
    expect(screen.getByRole('button', { name: 'All' })).not.toHaveClass('active')
  })

  it('calls onFilterChange with "Pro" when Pro is clicked', async () => {
    const { user, onFilterChange } = setup()
    await user.click(screen.getByRole('button', { name: 'Pro' }))
    expect(onFilterChange).toHaveBeenCalledWith('Pro')
  })

  it('calls onFilterChange with "All" when All is clicked', async () => {
    const { user, onFilterChange } = setup({ activeFilter: 'Pro' })
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(onFilterChange).toHaveBeenCalledWith('All')
  })
})

describe('FilterRow — favorites toggle', () => {
  it('renders Saved button', () => {
    setup()
    expect(screen.getByRole('button', { name: /Saved/i })).toBeInTheDocument()
  })

  it('marks Saved button active when showFavs is true', () => {
    setup({ showFavs: true })
    expect(screen.getByRole('button', { name: /Saved/i })).toHaveClass('active')
  })

  it('calls onFavsToggle when Saved is clicked', async () => {
    const { user, onFavsToggle } = setup()
    await user.click(screen.getByRole('button', { name: /Saved/i }))
    expect(onFavsToggle).toHaveBeenCalled()
  })
})

describe('FilterRow — view toggle', () => {
  it('marks Grid button active when view is grid', () => {
    setup({ activeView: 'grid' })
    expect(screen.getByRole('button', { name: /Grid/i })).toHaveClass('active')
    expect(screen.getByRole('button', { name: /Region/i })).not.toHaveClass('active')
  })

  it('marks Region button active when view is region', () => {
    setup({ activeView: 'region' })
    expect(screen.getByRole('button', { name: /Region/i })).toHaveClass('active')
  })

  it('calls onViewChange("region") when Region is clicked', async () => {
    const { user, onViewChange } = setup()
    await user.click(screen.getByRole('button', { name: /Region/i }))
    expect(onViewChange).toHaveBeenCalledWith('region')
  })

  it('calls onViewChange("grid") when Grid is clicked', async () => {
    const { user, onViewChange } = setup({ activeView: 'region' })
    await user.click(screen.getByRole('button', { name: /Grid/i }))
    expect(onViewChange).toHaveBeenCalledWith('grid')
  })
})

describe('FilterRow — sort dropdown', () => {
  it('renders all four sort options', () => {
    setup()
    expect(screen.getByRole('option', { name: /PRO first/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /A.Z/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Most Connected/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Most Viewed/i })).toBeInTheDocument()
  })

  it('shows the current sort value as selected', () => {
    setup({ sort: 'az' })
    expect(screen.getByRole('combobox')).toHaveValue('az')
  })

  it('calls onSortChange when a new option is selected', async () => {
    const { user, onSortChange } = setup()
    await user.selectOptions(screen.getByRole('combobox'), 'views')
    expect(onSortChange).toHaveBeenCalledWith('views')
  })
})
