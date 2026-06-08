'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
}

const CATEGORIES = [
  'Technology', 'Healthcare', 'Finance & Insurance', 'Food & Beverage',
  'Retail', 'Real Estate', 'Education', 'Services', 'Legal', 'Entertainment', 'Other',
]

const FS_URL = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/businesses`
  + `?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`

function toFields(obj: Record<string, string | boolean | number>) {
  const fields: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'boolean') fields[k] = { booleanValue: v }
    else if (typeof v === 'number') fields[k] = { doubleValue: v }
    else fields[k] = { stringValue: String(v) }
  }
  return { fields }
}

export default function AddBusinessModal({ onClose }: Props) {
  const [form, setForm] = useState({
    businessName: '', category: '', email: '', phone: '', city: '', website: '', description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.businessName || !form.category || !form.email || !form.phone || !form.city || !form.description) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(FS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFields({
          ...form,
          status: 'active',
          pro: false,
          speaker: false,
          women: false,
          convention: false,
          rating: 0,
          reviews: 0,
          views: 0,
          createdAt: new Date().toISOString(),
        })),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error?.message ?? `HTTP ${res.status}`)
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="detail-overlay open" onClick={onClose}>
      <div
        className="claim-modal"
        style={{ maxWidth: 520, overflowY: 'auto', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: 'var(--red)', marginBottom: '0.5rem' }}>Business Added!</h3>
            <p style={{ color: 'var(--text2)', lineHeight: 1.6 }}>
              Your listing is now live on the FiTEN Directory. Welcome to the community! 🎉
            </p>
            <button className="modal-submit" style={{ marginTop: '1.5rem' }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h3>List Your Business</h3>
            <p style={{ color: 'var(--text2)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Your listing will be live immediately after submission.
            </p>

            {error && (
              <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.8rem', borderRadius: '0.4rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <input className="modal-input" placeholder="Business name *" value={form.businessName} onChange={set('businessName')} />
            <select className="modal-input" value={form.category} onChange={set('category')}>
              <option value="">Select category *</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="modal-input" type="email" placeholder="Email *" value={form.email} onChange={set('email')} />
            <input className="modal-input" type="tel" placeholder="Phone *" value={form.phone} onChange={set('phone')} />
            <input className="modal-input" placeholder="City *" value={form.city} onChange={set('city')} />
            <input className="modal-input" type="url" placeholder="Website (optional)" value={form.website} onChange={set('website')} />
            <textarea
              className="modal-input"
              placeholder="Business description *"
              rows={3}
              value={form.description}
              onChange={set('description')}
              style={{ resize: 'vertical' }}
            />

            <button className="modal-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Add My Business'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
