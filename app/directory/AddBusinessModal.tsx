'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRecaptcha } from '@/lib/useRecaptcha'
import { useAuth } from '@/lib/auth-context'

interface Props {
  onClose: () => void
}

const CATEGORIES = [
  'Technology', 'Healthcare', 'Finance & Insurance', 'Food & Beverage',
  'Retail', 'Real Estate', 'Education', 'Services', 'Legal', 'Entertainment', 'Other',
]

const REGIONS = [
  'Greater Toronto Area', 'Montreal', 'Vancouver', 'Ottawa', 'Calgary',
  'Edmonton', 'Winnipeg', 'Halifax', 'USA', 'UK', 'Other',
]

const B2B_OPTIONS = [
  { value: 'partner', label: 'Open to Partnerships' },
  { value: 'client',  label: 'Seeking Clients' },
  { value: 'invest',  label: 'Seeking Investment' },
  { value: 'hire',    label: 'Hiring Now' },
  { value: 'mentor',  label: 'Open to Mentoring' },
]


export default function AddBusinessModal({ onClose }: Props) {
  const { getToken, loadRecaptcha } = useRecaptcha()
  useEffect(() => { loadRecaptcha() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const { user } = useAuth()
  const [form, setForm] = useState({
    businessName: '', category: '', region: '', email: '', phone: '', city: '', website: '', logoUrl: '', description: '',
  })
  const [looking, setLooking] = useState<string[]>([])
  const [women, setWomen] = useState(false)
  const [speaker, setSpeaker] = useState(false)
  const [convention, setConvention] = useState(false)
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const toggleLooking = (val: string) =>
    setLooking(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])

  const handleSubmit = async () => {
    if (!form.businessName || !form.category || !form.email || !form.city || !form.description) {
      setError('Please fill in all required fields.')
      return
    }
    if (!consent) {
      setError('Please agree to the Terms of Use and Privacy Policy to continue.')
      return
    }
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
      setError('Form submissions are disabled on preview deployments.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const captchaToken = await getToken('submit_business')
      const captchaRes = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      })
      if (!captchaRes.ok) {
        throw new Error('Security check failed. Please try again.')
      }

      const res = await fetch('/api/submit-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, looking, women, speaker, convention,
          consentGiven: true, consentAt: new Date().toISOString(),
          ...(user && { submittedByUid: user.uid, submittedByEmail: user.email }),
        }),
      })
      if (!res.ok) {
        if (res.status === 409) throw new Error('A listing with this email already exists.')
        console.error('submit-business failed', res.status)
        throw new Error('Something went wrong. Please try again.')
      }
      setSuccess(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(msg.startsWith('Security check') ? msg : 'Something went wrong. Please try again.')
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
            <i className="ti ti-circle-check" style={{ fontSize: '3rem', color: 'var(--teal)', marginBottom: '1rem', display: 'inline-block' }} aria-hidden="true" />
            <h3 style={{ color: 'var(--teal)', marginBottom: '0.5rem' }}>Submitted!</h3>
            <p style={{ color: 'var(--cream-70)', lineHeight: 1.6 }}>
              Check your email for a verification link to activate your listing instantly. If you prefer, our team can also approve it manually within 5 business days.
            </p>
            <button className="modal-submit" style={{ marginTop: '1.5rem' }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h3>List Your Business</h3>
            <p style={{ color: 'var(--cream-70)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Your listing will go live after a quick review — usually within 5 business days.
            </p>

            {error && (
              <div style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--cream)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 1rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
                {error}
              </div>
            )}

            <input className="modal-input" placeholder="Business name *" value={form.businessName} onChange={set('businessName')} />
            <select className="modal-input" value={form.category} onChange={set('category')}>
              <option value="">Select category *</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="modal-input" value={form.region} onChange={set('region')}>
              <option value="">Select region (optional)</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input className="modal-input" type="email" placeholder="Email *" value={form.email} onChange={set('email')} />
            <input className="modal-input" type="tel" placeholder="Phone *" value={form.phone} onChange={set('phone')} />
            <input className="modal-input" placeholder="City *" value={form.city} onChange={set('city')} />
            <input className="modal-input" type="url" placeholder="Website (optional)" value={form.website} onChange={set('website')} />
            <input className="modal-input" type="url" placeholder="Logo / profile image URL (optional)" value={form.logoUrl} onChange={set('logoUrl')} />
            <textarea
              className="modal-input"
              placeholder="Business description *"
              rows={3}
              value={form.description}
              onChange={set('description')}
              style={{ resize: 'vertical' }}
            />

            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cream-70)', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0.8rem 0 0.5rem' }}>
              B2B Signals (optional)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
              {B2B_OPTIONS.map(o => (
                <label key={o.value} className="filter-check" style={{ padding: '0.3rem 0' }}>
                  <input type="checkbox" checked={looking.includes(o.value)} onChange={() => toggleLooking(o.value)} />
                  {o.label}
                </label>
              ))}
            </div>

            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cream-70)', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0.8rem 0 0.5rem' }}>
              Community (optional)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
              <label className="filter-check" style={{ padding: '0.3rem 0' }}>
                <input type="checkbox" checked={women} onChange={e => setWomen(e.target.checked)} />
                Women-Led Business
              </label>
              <label className="filter-check" style={{ padding: '0.3rem 0' }}>
                <input type="checkbox" checked={speaker} onChange={e => setSpeaker(e.target.checked)} />
                Available as Speaker
              </label>
              <label className="filter-check" style={{ padding: '0.3rem 0' }}>
                <input type="checkbox" checked={convention} onChange={e => setConvention(e.target.checked)} />
                FeTNA Convention Participant
              </label>
            </div>

            <label className="filter-check" style={{ padding: '0.4rem 0', marginBottom: '1rem', fontSize: '0.82rem', lineHeight: 1.5, alignItems: 'flex-start' }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '0.15rem', flexShrink: 0 }} />
              <span>
                I agree to the{' '}
                <Link href="/terms" target="_blank" style={{ color: 'var(--teal)' }}>Terms of Use</Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" style={{ color: 'var(--teal)' }}>Privacy Policy</Link>
                , and consent to my business information being publicly displayed in the FiTEN directory. *
              </span>
            </label>

            <button className="modal-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Add My Business'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
