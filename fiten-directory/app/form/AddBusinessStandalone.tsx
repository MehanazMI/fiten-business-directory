'use client'

import { useState } from 'react'

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

export default function AddBusinessStandalone() {
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
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 540, margin: '2rem auto', padding: '0 1rem' }}>
      <a href="/directory" style={{ color: 'var(--red)', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: '2rem' }}>
        ← Back to Directory
      </a>

      <div style={{ background: '#fff', borderRadius: '0.8rem', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: 'var(--red)', marginBottom: '0.5rem' }}>Business Added!</h2>
            <p style={{ color: 'var(--text2)', lineHeight: 1.6 }}>
              Your listing is now live on the FiTEN Directory.<br />
              Congratulations and welcome to the community! 🎉
            </p>
            <a href="/directory" className="modal-submit" style={{ display: 'inline-block', marginTop: '1.5rem', textDecoration: 'none', textAlign: 'center' }}>
              View Directory
            </a>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>Add your business</h1>
            <p style={{ color: 'var(--text2)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              List your business on FiTEN and reach customers in your area.
            </p>

            {error && (
              <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.8rem 1rem', borderRadius: '0.4rem', marginBottom: '1rem', borderLeft: '4px solid #c0392b', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input className="form-input" placeholder="Business name *" value={form.businessName} onChange={set('businessName')} />
              <select className="form-select" value={form.category} onChange={set('category')}>
                <option value="">Select a category *</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="form-input" type="email" placeholder="Email address *" value={form.email} onChange={set('email')} />
              <input className="form-input" type="tel" placeholder="Phone *" value={form.phone} onChange={set('phone')} />
              <input className="form-input" placeholder="City *" value={form.city} onChange={set('city')} />
              <input className="form-input" type="url" placeholder="Website (optional)" value={form.website} onChange={set('website')} />
              <textarea
                className="form-textarea"
                placeholder="Business description *"
                rows={4}
                value={form.description}
                onChange={set('description')}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              className="form-submit"
              style={{ marginTop: '1.5rem' }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Add My Business'}
            </button>
            <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', marginTop: '0.8rem' }}>
              Your listing will be live immediately
            </p>
          </>
        )}
      </div>
    </div>
  )
}
