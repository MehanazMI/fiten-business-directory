import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DirectoryClient from '@/app/directory/DirectoryClient'
import { SAMPLE_BUSINESSES, makeBusiness } from './fixtures'
import { onSnapshot } from 'firebase/firestore'

function setup(businesses = SAMPLE_BUSINESSES) {
  const user = userEvent.setup()
  render(<DirectoryClient initialData={businesses} />)
  return { user }
}

function getSidebar() {
  return document.querySelector('.sidebar') as HTMLElement
}

beforeEach(() => {
  localStorage.clear()
  vi.mocked(onSnapshot).mockReturnValue(vi.fn())
})

// ---------------------------------------------------------------------------
// Initial render
// ---------------------------------------------------------------------------
describe('DirectoryClient — initial render', () => {
  it('shows all businesses on load', () => {
    setup()
    expect(screen.getByText(`${SAMPLE_BUSINESSES.length} businesses`)).toBeInTheDocument()
  })

  it('renders the FiTEN header logo', () => {
    setup()
    expect(screen.getByText((_, el) => el?.className === 'logo-text' && el.textContent === 'FiTEN')).toBeInTheDocument()
  })

  it('renders category sidebar with All item', () => {
    setup()
    expect(within(getSidebar()).getByText('Categories')).toBeInTheDocument()
    // sidebar has its own "All" list item — scope to sidebar to avoid FilterRow pill ambiguity
    expect(within(getSidebar()).getByText(/^All$/)).toBeInTheDocument()
  })

  it('renders B2B Signals sidebar chips', () => {
    setup()
    const sidebar = getSidebar()
    expect(within(sidebar).getByRole('button', { name: /^Partner$/i })).toBeInTheDocument()
    expect(within(sidebar).getByRole('button', { name: /Hiring/i })).toBeInTheDocument()
    expect(within(sidebar).getByRole('button', { name: /Seeking Clients/i })).toBeInTheDocument()
    expect(within(sidebar).getByRole('button', { name: /Seeking Investment/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
describe('DirectoryClient — search', () => {
  it('filters by business name', async () => {
    const { user } = setup()
    await user.type(screen.getByRole('textbox'), 'Alpha')
    expect(screen.getByText('1 businesses')).toBeInTheDocument()
    expect(screen.getByText('Alpha Tech')).toBeInTheDocument()
  })

  it('filters by description', async () => {
    const biz = [
      makeBusiness({ id: 'x1', businessName: 'X', description: 'specialist in yoga' }),
      makeBusiness({ id: 'x2', businessName: 'Y', description: 'unrelated' }),
    ]
    const { user } = setup(biz)
    await user.type(screen.getByRole('textbox'), 'yoga')
    expect(screen.getByText('1 businesses')).toBeInTheDocument()
  })

  it('filters by category text', async () => {
    const { user } = setup()
    await user.type(screen.getByRole('textbox'), 'tech')
    expect(screen.getByText('Alpha Tech')).toBeInTheDocument()
  })

  it('is case-insensitive', async () => {
    const { user } = setup()
    await user.type(screen.getByRole('textbox'), 'ALPHA')
    expect(screen.getByText('Alpha Tech')).toBeInTheDocument()
  })

  it('shows 0 businesses when no match', async () => {
    const { user } = setup()
    await user.type(screen.getByRole('textbox'), 'xyznonexistent')
    expect(screen.getByText('0 businesses')).toBeInTheDocument()
  })

  it('resets to full list when search is cleared', async () => {
    const { user } = setup()
    const input = screen.getByRole('textbox')
    await user.type(input, 'Alpha')
    await user.clear(input)
    expect(screen.getByText(`${SAMPLE_BUSINESSES.length} businesses`)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Category filter
// ---------------------------------------------------------------------------
describe('DirectoryClient — category filter', () => {
  it('filters businesses by selected category (Tech)', async () => {
    const { user } = setup()
    // Sidebar shows mapped names ("Tech") matching b.category
    await user.click(within(getSidebar()).getByText(/^Tech$/))
    expect(screen.getByText('1 businesses')).toBeInTheDocument()
    expect(screen.getByText('Alpha Tech')).toBeInTheDocument()
  })

  it('shows all businesses when All category is clicked', async () => {
    const { user } = setup()
    await user.click(within(getSidebar()).getByText(/^Tech$/))
    await user.click(within(getSidebar()).getByText(/^All$/))
    expect(screen.getByText(`${SAMPLE_BUSINESSES.length} businesses`)).toBeInTheDocument()
  })

  it('shows count badge for each category', () => {
    setup()
    const sidebar = getSidebar()
    // Tech: 1 business (Alpha Tech)
    const techItem = within(sidebar).getByText(/^Tech$/).closest('li')!
    expect(within(techItem).getByText('1')).toBeInTheDocument()
  })

  it('shows all count in All category badge', () => {
    setup()
    const sidebar = getSidebar()
    const allItem = within(sidebar).getByText(/^All$/).closest('li')!
    expect(within(allItem).getByText(String(SAMPLE_BUSINESSES.length))).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Pro filter
// ---------------------------------------------------------------------------
describe('DirectoryClient — Pro filter', () => {
  it('shows only Pro businesses when Pro is selected', async () => {
    const { user } = setup()
    await user.click(within(getSidebar()).getByRole('button', { name: /🏅 FeTNA Sponsor/i }))
    const proCount = SAMPLE_BUSINESSES.filter(b => b.pro).length
    expect(screen.getByText(`${proCount} businesses`)).toBeInTheDocument()
  })

  it('restores all when PRO chip is toggled off', async () => {
    const { user } = setup()
    const proChip = within(getSidebar()).getByRole('button', { name: /🏅 FeTNA Sponsor/i })
    await user.click(proChip)
    await user.click(proChip)
    expect(screen.getByText(`${SAMPLE_BUSINESSES.length} businesses`)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// B2B Signals filter (sidebar checkboxes)
// ---------------------------------------------------------------------------
describe('DirectoryClient — B2B signals filter', () => {
  it('filters to businesses matching a single signal', async () => {
    const { user } = setup()
    await user.click(within(getSidebar()).getByRole('button', { name: /Hiring/i }))
    // b1 (hire), b7 (hire)
    expect(screen.getByText('2 businesses')).toBeInTheDocument()
  })

  it('applies AND logic for multiple signals', async () => {
    const { user } = setup()
    await user.click(within(getSidebar()).getByRole('button', { name: /^Partner$/i }))
    await user.click(within(getSidebar()).getByRole('button', { name: /Hiring/i }))
    // only b1 has both partner AND hire
    expect(screen.getByText('1 businesses')).toBeInTheDocument()
    expect(screen.getByText('Alpha Tech')).toBeInTheDocument()
  })

  it('deselecting a signal removes its filter', async () => {
    const { user } = setup()
    const chip = within(getSidebar()).getByRole('button', { name: /Hiring/i })
    await user.click(chip)
    await user.click(chip)
    expect(screen.getByText(`${SAMPLE_BUSINESSES.length} businesses`)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------
describe('DirectoryClient — sorting', () => {
  it('default sort puts PRO businesses first', () => {
    setup()
    const firstCard = document.querySelector('.biz-card')!
    expect(firstCard).toHaveClass('pro-card')
  })

  it('A-Z sort orders alphabetically', async () => {
    const { user } = setup()
    await user.selectOptions(screen.getByRole('combobox'), 'az')
    const cards = Array.from(document.querySelectorAll('.biz-name')).map(el => el.textContent!)
    const sorted = [...cards].sort((a, b) => a.localeCompare(b))
    expect(cards).toEqual(sorted)
  })

  it('reviews sort orders by review count descending', async () => {
    const { user } = setup()
    await user.selectOptions(screen.getByRole('combobox'), 'reviews')
    // Alpha Tech has reviews=20, highest in fixtures → first card
    expect(document.querySelectorAll('.biz-card')[0].textContent).toContain('Alpha')
  })

  it('views sort orders by view count descending', async () => {
    const { user } = setup()
    await user.selectOptions(screen.getByRole('combobox'), 'views')
    // Alpha Tech has views=500, highest → first card
    expect(document.querySelectorAll('.biz-card')[0].textContent).toContain('Alpha')
  })
})

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------
describe('DirectoryClient — favorites', () => {
  it('toggles favorite on heart click', async () => {
    const { user } = setup()
    await user.click(screen.getAllByLabelText('Add to favourites')[0])
    expect(screen.getAllByLabelText('Remove from favourites').length).toBe(1)
  })

  it('persists favorites to localStorage', async () => {
    const { user } = setup()
    await user.click(screen.getAllByLabelText('Add to favourites')[0])
    const stored = JSON.parse(localStorage.getItem('fiten_favorites') ?? '[]')
    expect(stored.length).toBe(1)
  })

  it('loads favorites from localStorage on mount', () => {
    localStorage.setItem('fiten_favorites', JSON.stringify(['b1']))
    setup()
    expect(screen.getByLabelText('Remove from favourites')).toBeInTheDocument()
  })

  it('shows only favorited businesses when Saved filter is active', async () => {
    localStorage.setItem('fiten_favorites', JSON.stringify(['b1']))
    const { user } = setup()
    await user.click(screen.getAllByRole('button', { name: /Saved/i })[0])
    expect(screen.getByText('1 businesses')).toBeInTheDocument()
    expect(screen.getByText('Alpha Tech')).toBeInTheDocument()
  })

  it('shows 0 businesses when Saved filter is active and no favorites', async () => {
    const { user } = setup()
    await user.click(screen.getAllByRole('button', { name: /Saved/i })[0])
    expect(screen.getByText('0 businesses')).toBeInTheDocument()
  })

  it('un-favoriting removes from Saved list', async () => {
    localStorage.setItem('fiten_favorites', JSON.stringify(['b1']))
    const { user } = setup()
    await user.click(screen.getAllByRole('button', { name: /Saved/i })[0])
    await user.click(screen.getByLabelText('Remove from favourites'))
    expect(screen.getByText('0 businesses')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Language toggle
// ---------------------------------------------------------------------------
describe('DirectoryClient — language toggle', () => {
  it('switches hero text to Tamil on தமிழ் click', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'தமிழ்' }))
    expect(screen.getByPlaceholderText('வணிகங்களைத் தேடுங்கள்...')).toBeInTheDocument()
  })

  it('switches back to English on EN click', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'தமிழ்' }))
    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByPlaceholderText('Search businesses, keywords...')).toBeInTheDocument()
  })

  it('EN button has active class by default', () => {
    setup()
    expect(screen.getByRole('button', { name: 'EN' })).toHaveClass('active')
  })
})

// ---------------------------------------------------------------------------
// View toggle
// ---------------------------------------------------------------------------
describe('DirectoryClient — view toggle', () => {
  it('switches to region view', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /Region view/i }))
    expect(screen.getByRole('button', { name: /Region view/i })).toHaveClass('active')
  })

  it('switches back to grid view', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /Region view/i }))
    await user.click(screen.getByRole('button', { name: /Grid view/i }))
    expect(screen.getByRole('button', { name: /Grid view/i })).toHaveClass('active')
  })
})

// ---------------------------------------------------------------------------
// Modals
// ---------------------------------------------------------------------------
describe('DirectoryClient — Add Business link', () => {
  it('header Add Your Business is a link to /form', () => {
    setup()
    const header = document.querySelector('header') as HTMLElement
    const link = within(header).getByRole('link', { name: /Add Your Business/i })
    expect(link).toHaveAttribute('href', '/form')
  })

  it('CTA Add Your Business is a link to /form', () => {
    setup()
    const cta = document.querySelector('.cta-listing') as HTMLElement
    const link = within(cta).getByRole('link', { name: /Add Your Business/i })
    expect(link).toHaveAttribute('href', '/form')
  })
})

describe('DirectoryClient — business detail modal', () => {
  it('opens BusinessModal when a card is clicked', async () => {
    const { user } = setup()
    await user.click(document.querySelectorAll('.biz-card')[0] as HTMLElement)
    // Modal shows detail-panel with a detail-sec "About" heading
    expect(document.querySelector('.detail-panel')).toBeInTheDocument()
    expect(document.querySelector('.detail-sec')).toHaveTextContent('About')
  })

  it('closes BusinessModal when × is clicked', async () => {
    const { user } = setup()
    await user.click(document.querySelectorAll('.biz-card')[0] as HTMLElement)
    expect(document.querySelector('.detail-panel')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '×' }))
    expect(document.querySelector('.detail-panel')).not.toBeInTheDocument()
  })

  it('opens ClaimModal from non-pro business card', async () => {
    const { user } = setup()
    // Beta Foods is non-pro → index 2 after pro-first sort (Alpha Tech, Delta Finance come first)
    await user.click(document.querySelectorAll('.biz-card')[2] as HTMLElement)
    // Opens BusinessModal with Claim Listing footer button
    await user.click(screen.getByRole('button', { name: 'Claim Listing' }))
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
describe('DirectoryClient — pagination', () => {
  it('shows Load more button when results exceed PAGE_SIZE', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      makeBusiness({ id: `pg-${i}`, businessName: `Paged Business ${i}` })
    )
    setup(many) // 10 items > PAGE_SIZE (9)
    expect(screen.getByRole('button', { name: /Load \d+ more/ })).toBeInTheDocument()
  })

  it('hides Load more when results fit in one page', async () => {
    const { user } = setup()
    await user.type(screen.getByRole('textbox'), 'Alpha')
    expect(screen.queryByRole('button', { name: /Load \d+ more/ })).not.toBeInTheDocument()
  })

  it('shows more cards when Load more is clicked', async () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      makeBusiness({ id: `biz-${i}`, businessName: `Business ${i}` })
    )
    const { user } = setup(many)
    const initialCards = document.querySelectorAll('.biz-card').length
    await user.click(screen.getByRole('button', { name: /Load \d+ more/ }))
    expect(document.querySelectorAll('.biz-card').length).toBeGreaterThan(initialCards)
  })

  it('resets pagination when search query changes', async () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      makeBusiness({ id: `biz-${i}`, businessName: `Business ${i}` })
    )
    const { user } = setup(many)
    await user.click(screen.getByRole('button', { name: /Load \d+ more/ }))
    expect(document.querySelectorAll('.biz-card').length).toBe(12)
    await user.type(screen.getByRole('textbox'), 'Business')
    // After typing, visibleCount resets to PAGE_SIZE=9
    expect(document.querySelectorAll('.biz-card').length).toBeLessThanOrEqual(9)
  })

  it('shows showing X of Y count below Load more button', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      makeBusiness({ id: `pg2-${i}`, businessName: `Paged Business ${i}` })
    )
    setup(many) // 10 items > PAGE_SIZE (9) → Load more + count shown
    expect(screen.getByText(/Showing \d+ of \d+/)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Firebase live updates
// ---------------------------------------------------------------------------
describe('DirectoryClient — live Firestore updates', () => {
  it('shows error banner when onSnapshot errors', async () => {
    vi.mocked(onSnapshot).mockImplementation((_q, _onNext, onError) => {
      if (onError) onError(new Error('Permission denied'))
      return vi.fn()
    })
    setup()
    await waitFor(() =>
      expect(screen.getByText(/Live updates unavailable/)).toBeInTheDocument()
    )
  })

  it('replaces list with full snapshot from Firestore', async () => {
    vi.mocked(onSnapshot).mockImplementation((_q, onNext) => {
      const snap = {
        docs: [
          {
            id: 'existing',
            data: () => ({ businessName: 'Existing Biz', status: 'active', category: 'Services', looking: [], pro: false, speaker: false, women: false, convention: false, rating: 0, reviews: 0, views: 0, createdAt: '' }),
          },
          {
            id: 'live-new',
            data: () => ({ businessName: 'Live New Biz', status: 'active', category: 'Services', looking: [], pro: false, speaker: false, women: false, convention: false, rating: 0, reviews: 0, views: 0, createdAt: '' }),
          },
        ],
      }
      ;(onNext as (s: typeof snap) => void)(snap)
      return vi.fn()
    })
    setup([makeBusiness({ id: 'existing', businessName: 'Existing Biz' })])
    await waitFor(() => expect(screen.getByText('Live New Biz')).toBeInTheDocument())
    expect(screen.getByText('Existing Biz')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Combined filter scenarios (corner cases)
// ---------------------------------------------------------------------------
describe('DirectoryClient — combined filters', () => {
  it('search + category filter together narrow results correctly', async () => {
    const { user } = setup()
    await user.click(within(getSidebar()).getByText(/^Tech$/))
    await user.type(screen.getByRole('textbox'), 'alpha')
    expect(screen.getByText('1 businesses')).toBeInTheDocument()
  })

  it('Pro filter + B2B signal together', async () => {
    const { user } = setup()
    await user.click(within(getSidebar()).getByRole('button', { name: /🏅 FeTNA Sponsor/i }))
    await user.click(within(getSidebar()).getByRole('button', { name: /^Partner$/i }))
    // Only b1 is pro AND has partner
    expect(screen.getByText('1 businesses')).toBeInTheDocument()
  })

  it('empty state shows no-results message', async () => {
    const { user } = setup()
    await user.type(screen.getByRole('textbox'), '!!!no match!!!')
    expect(screen.getByText(/No businesses found/i)).toBeInTheDocument()
  })

  it('category + B2B signal together', async () => {
    const { user } = setup()
    await user.click(within(getSidebar()).getByText(/^Healthcare$/))
    await user.click(within(getSidebar()).getByRole('button', { name: /Seeking Investment/i }))
    // Only b3 is Healthcare with invest
    expect(screen.getByText('1 businesses')).toBeInTheDocument()
    expect(screen.getByText('Gamma Health')).toBeInTheDocument()
  })

  it('Saved + search filters together', async () => {
    localStorage.setItem('fiten_favorites', JSON.stringify(['b1', 'b2']))
    const { user } = setup()
    await user.click(screen.getAllByRole('button', { name: /Saved/i })[0])
    await user.type(screen.getByRole('textbox'), 'Alpha')
    expect(screen.getByText('1 businesses')).toBeInTheDocument()
  })
})
