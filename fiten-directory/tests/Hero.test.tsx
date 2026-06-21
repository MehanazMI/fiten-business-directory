import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Hero from '@/app/components/home/Hero'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

beforeEach(() => {
  push.mockClear()
})

function setup() {
  const user = userEvent.setup()
  render(<Hero businesses={26} cities={24} sectors={11} continents={3} />)
  return { user }
}

describe('Hero', () => {
  it('renders the headline', () => {
    setup()
    expect(screen.getByRole('heading', { name: /Tamil business/i })).toBeInTheDocument()
  })

  it('renders the search input', () => {
    setup()
    expect(screen.getByLabelText('Search businesses')).toBeInTheDocument()
  })

  it('navigates to /directory with query on submit', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText('Search businesses'), 'cloud security')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(push).toHaveBeenCalledWith('/directory?q=cloud%20security')
  })

  it('navigates to /directory (no query) when search is empty', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(push).toHaveBeenCalledWith('/directory')
  })

  it('navigates with the trending term when a chip is clicked', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'SAP' }))
    expect(push).toHaveBeenCalledWith('/directory?q=SAP')
  })
})
