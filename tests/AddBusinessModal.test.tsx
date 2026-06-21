import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddBusinessModal from '@/app/directory/AddBusinessModal'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function makeOkResponse() {
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ name: 'businesses/new-id' }) })
}
function makeErrResponse(msg: string) {
  return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: { message: msg } }) })
}

function setup() {
  const onClose = vi.fn()
  const user = userEvent.setup()
  render(<AddBusinessModal onClose={onClose} />)
  return { user, onClose }
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText(/Business name/i), 'New Biz')
  // Two selects exist (category + region); target category by placeholder option text
  await user.selectOptions(screen.getAllByRole('combobox')[0], 'Technology')
  await user.type(screen.getByPlaceholderText(/Email/i), 'biz@new.com')
  await user.type(screen.getByPlaceholderText(/Phone/i), '123-456-7890')
  await user.type(screen.getByPlaceholderText(/City/i), 'Toronto')
  await user.type(screen.getByPlaceholderText(/description/i), 'A new business description')
}

beforeEach(() => {
  vi.resetAllMocks()
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-proj'
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-key'
})

describe('AddBusinessModal — form fields', () => {
  it('renders all required fields', () => {
    setup()
    expect(screen.getByPlaceholderText(/Business name/i)).toBeInTheDocument()
    // Two selects: category and region
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Phone/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/City/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument()
  })

  it('renders website field as optional', () => {
    setup()
    expect(screen.getByPlaceholderText(/Website.*optional/i)).toBeInTheDocument()
  })

  it('renders all 11 category options', () => {
    setup()
    // Scope to the category select (first combobox) to avoid counting region options
    const categorySelect = screen.getAllByRole('combobox')[0]
    const options = within(categorySelect).getAllByRole('option')
    // 11 categories + 1 placeholder option
    expect(options.length).toBe(12)
  })
})

describe('AddBusinessModal — validation', () => {
  it('shows error when required fields are empty on submit', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /Add My Business/i }))
    expect(screen.getByText(/fill in all required fields/i)).toBeInTheDocument()
  })

  it('does not call fetch when form is incomplete', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /Add My Business/i }))
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('clears error message when form is corrected and resubmitted', async () => {
    const { user } = setup()
    mockFetch.mockReturnValue(makeOkResponse())
    // Trigger error first
    await user.click(screen.getByRole('button', { name: /Add My Business/i }))
    expect(screen.getByText(/fill in all required fields/i)).toBeInTheDocument()
    // Fill and submit
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /Add My Business/i }))
    await waitFor(() => expect(screen.queryByText(/fill in all required fields/i)).not.toBeInTheDocument())
  })
})

describe('AddBusinessModal — successful submission', () => {
  it('shows success state after valid submission', async () => {
    mockFetch.mockReturnValue(makeOkResponse())
    const { user } = setup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /Add My Business/i }))
    await waitFor(() => expect(screen.getByText(/Business Added/i)).toBeInTheDocument())
  })

  it('shows Done button in success state', async () => {
    mockFetch.mockReturnValue(makeOkResponse())
    const { user } = setup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /Add My Business/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument())
  })

  it('calls onClose when Done is clicked after success', async () => {
    mockFetch.mockReturnValue(makeOkResponse())
    const { user, onClose } = setup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /Add My Business/i }))
    await waitFor(() => screen.getByRole('button', { name: 'Done' }))
    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('posts correct fields to Firestore', async () => {
    mockFetch.mockReturnValue(makeOkResponse())
    const { user } = setup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /Add My Business/i }))
    await waitFor(() => screen.getByText(/Business Added/i))
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.fields.businessName.stringValue).toBe('New Biz')
    expect(body.fields.category.stringValue).toBe('Technology')
    expect(body.fields.status.stringValue).toBe('active')
    expect(body.fields.pro.booleanValue).toBe(false)
  })
})

describe('AddBusinessModal — error handling', () => {
  it('shows API error message on failure', async () => {
    mockFetch.mockReturnValue(makeErrResponse('Permission denied'))
    const { user } = setup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /Add My Business/i }))
    await waitFor(() => expect(screen.getByText(/Permission denied/)).toBeInTheDocument())
  })

  it('shows generic network error when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const { user } = setup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /Add My Business/i }))
    await waitFor(() => expect(screen.getByText(/Network error/)).toBeInTheDocument())
  })

  it('disables submit button while submitting', async () => {
    // Never resolves — keeps the spinner up
    mockFetch.mockReturnValue(new Promise(() => {}))
    const { user } = setup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /Add My Business/i }))
    expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled()
  })
})

describe('AddBusinessModal — close behaviour', () => {
  it('calls onClose when × button is clicked', async () => {
    const { user, onClose } = setup()
    await user.click(screen.getByRole('button', { name: '×' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when overlay is clicked', async () => {
    const { user, onClose } = setup()
    const overlay = document.querySelector('.detail-overlay')!
    await user.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })
})
