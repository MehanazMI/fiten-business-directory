'use client'

import { useState } from 'react'

const CATEGORIES = [
  'Technology', 'Healthcare', 'Finance & Insurance', 'Food & Beverage',
  'Retail', 'Real Estate', 'Education', 'Legal', 'Marketing',
  'Logistics', 'Human Resources', 'Agriculture', 'Entertainment', 'Services', 'Other',
]

const REGIONS = [
  'New York, NY', 'New Jersey, NJ', 'California', 'Texas', 'Illinois',
  'Massachusetts', 'Georgia', 'Washington', 'Pennsylvania', 'Florida', 'Other USA',
  'Greater Toronto Area', 'Vancouver', 'Montreal', 'Ottawa', 'Calgary', 'Edmonton', 'Other Canada',
  'Chennai, India', 'Coimbatore, India', 'Madurai, India', 'Bengaluru, India',
  'Mumbai, India', 'Delhi, India', 'Other India',
  'UK', 'Europe', 'Middle East', 'Singapore', 'Australia', 'Other',
]

const B2B_OPTIONS = [
  { value: 'partner', label: 'Partner' },
  { value: 'client', label: 'Seeking Clients' },
  { value: 'invest', label: 'Seeking Investment' },
  { value: 'hire', label: 'Hiring' },
]

const DESCRIPTION_MAX = 300

const FS_URL = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/businesses`
  + `?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`

function toFields(obj: Record<string, unknown>) {
  const fields: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'boolean') fields[k] = { booleanValue: v }
    else if (typeof v === 'number') fields[k] = { doubleValue: v }
    else if (Array.isArray(v)) fields[k] = { arrayValue: { values: v.map(s => ({ stringValue: s })) } }
    else fields[k] = { stringValue: String(v) }
  }
  return { fields }
}

type Errors = Record<string, string>
const required = ['businessName', 'category', 'city', 'email', 'phone', 'description'] as const

function validate(form: Record<string, string>): Errors {
  const errs: Errors = {}
  if (!form.businessName.trim()) errs.businessName = 'Business name is required.'
  if (!form.category) errs.category = 'Please select a category.'
  if (!form.city.trim()) errs.city = 'City is required.'
  if (!form.email.trim()) errs.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.'
  if (!form.phone.trim()) errs.phone = 'Phone number is required.'
  if (!form.description.trim()) errs.description = 'Please add a business description.'
  else if (form.description.trim().length < 20) errs.description = 'Description must be at least 20 characters.'
  return errs
}

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.35rem',
  letterSpacing: '0.1px',
}

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  border: '1px solid #D1D5DB',
  borderRadius: '0.4rem',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  color: '#111827',
  background: 'white',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box',
  marginBottom: 0,
}

export default function AddBusinessStandalone() {
  const [form, setForm] = useState({
    businessName: '', nameTamil: '', category: '',
    region: '', city: '', email: '', phone: '', website: '', description: '',
  })
  const [looking, setLooking] = useState<string[]>([])
  const [women, setWomen] = useState(false)
  const [speaker, setSpeaker] = useState(false)
  const [convention, setConvention] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newDocId, setNewDocId] = useState('')

  const fieldErrors = validate(form)
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))
  const touch = (field: string) => () => setTouched(t => ({ ...t, [field]: true }))
  const toggleLooking = (val: string) =>
    setLooking(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])

  const handleSubmit = async () => {
    const allTouched = Object.fromEntries(required.map(f => [f, true]))
    setTouched(t => ({ ...t, ...allTouched }))
    if (Object.keys(fieldErrors).length > 0) return
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
      setSubmitError('Form submissions are disabled on preview deployments.')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch(FS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFields({
          businessName: form.businessName.trim(),
          nameTamil: form.nameTamil.trim(),
          category: form.category,
          region: form.region,
          city: form.city.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          website: form.website.trim(),
          description: form.description.trim(),
          looking, women, speaker, convention,
          status: 'active', pro: false, rating: 0, reviews: 0, views: 0,
          createdAt: new Date().toISOString(),
        })),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error?.message ?? `HTTP ${res.status}`)
      }
      const data = await res.json()
      setNewDocId(data.name?.split('/').pop() ?? '')
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const showErr = (field: string) => touched[field] && fieldErrors[field]
  const fieldStyle = (field: string): React.CSSProperties => ({
    ...inputBase,
    borderColor: showErr(field) ? '#EF4444' : '#D1D5DB',
    boxShadow: showErr(field) ? '0 0 0 3px rgba(239,68,68,0.1)' : undefined,
  })

  if (success) {
    return (
      <div style={{ maxWidth: 540 }}>
        <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '3rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 8px 24px rgba(13,35,64,0.08)', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem', color: 'white' }}>✓</div>
          <h2 style={{ color: '#0D2340', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>You&rsquo;re live!</h2>
          <p style={{ color: '#6B7280', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
            <strong style={{ color: '#0D2340' }}>{form.businessName}</strong> is now listed in the FiTEN Business Directory and visible to the Tamil community worldwide.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={newDocId ? `/directory/${newDocId}` : '/directory'}
              style={{ padding: '0.8rem 1.75rem', background: '#0D2340', color: '#fff', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              View My Listing →
            </a>
            <a href="/directory"
              style={{ padding: '0.8rem 1.75rem', background: '#F5E9CC', color: '#0D2340', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              Browse Directory
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 580 }}>
      <a href="/directory" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        ← Back to Directory
      </a>

      <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(13,35,64,0.07)', border: '1px solid #F3F4F6' }}>

        {submitError && (
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.8rem 1rem', borderRadius: '0.4rem', marginBottom: '1.5rem', borderLeft: '4px solid #EF4444', fontSize: '0.875rem', fontWeight: 500 }}>
            {submitError}
          </div>
        )}

        {/* Business Name */}
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={label}>Business Name *</label>
          <input style={fieldStyle('businessName')} placeholder="e.g. Kumaran Software Labs"
            value={form.businessName} onChange={set('businessName')} onBlur={touch('businessName')} />
          {showErr('businessName') && <Err>{fieldErrors.businessName}</Err>}
        </div>

        {/* Tamil Name */}
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={label}>Business Name in Tamil <Opt /></label>
          <input style={inputBase} placeholder="e.g. குமரன்"
            value={form.nameTamil} onChange={set('nameTamil')} />
        </div>

        {/* Category + City */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
          <div>
            <label style={label}>Primary Sector *</label>
            <select style={fieldStyle('category')} value={form.category}
              onChange={set('category')} onBlur={touch('category')}>
              <option value="">Select…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {showErr('category') && <Err>{fieldErrors.category}</Err>}
          </div>
          <div>
            <label style={label}>City *</label>
            <input style={fieldStyle('city')} placeholder="e.g. Edison, NJ"
              value={form.city} onChange={set('city')} onBlur={touch('city')} />
            {showErr('city') && <Err>{fieldErrors.city}</Err>}
          </div>
        </div>

        {/* Region + Website */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
          <div>
            <label style={label}>Region <Opt /></label>
            <select style={inputBase} value={form.region} onChange={set('region')}>
              <option value="">Select…</option>
              <optgroup label="USA">{REGIONS.slice(0, 11).map(r => <option key={r} value={r}>{r}</option>)}</optgroup>
              <optgroup label="Canada">{REGIONS.slice(11, 18).map(r => <option key={r} value={r}>{r}</option>)}</optgroup>
              <optgroup label="India">{REGIONS.slice(18, 25).map(r => <option key={r} value={r}>{r}</option>)}</optgroup>
              <optgroup label="International">{REGIONS.slice(25).map(r => <option key={r} value={r}>{r}</option>)}</optgroup>
            </select>
          </div>
          <div>
            <label style={label}>Website <Opt /></label>
            <input style={inputBase} type="url" placeholder="https://yoursite.com"
              value={form.website} onChange={set('website')} />
          </div>
        </div>

        {/* Work Email + Phone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
          <div>
            <label style={label}>Work Email *</label>
            <input style={fieldStyle('email')} type="email" placeholder="name@business.com"
              value={form.email} onChange={set('email')} onBlur={touch('email')} />
            {showErr('email') && <Err>{fieldErrors.email}</Err>}
          </div>
          <div>
            <label style={label}>Phone / WhatsApp *</label>
            <input style={fieldStyle('phone')} type="tel" placeholder="+1 212…"
              value={form.phone} onChange={set('phone')} onBlur={touch('phone')} />
            {showErr('phone') && <Err>{fieldErrors.phone}</Err>}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={label}>Business Summary *</label>
          <textarea
            style={{ ...fieldStyle('description'), resize: 'vertical', minHeight: 96 }}
            placeholder="Describe what your business does and who it serves in the Tamil community."
            rows={4} maxLength={DESCRIPTION_MAX}
            value={form.description} onChange={set('description')} onBlur={touch('description')}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
            {showErr('description') ? <Err>{fieldErrors.description}</Err> : <span />}
            <span style={{ fontSize: '0.74rem', color: form.description.length > DESCRIPTION_MAX * 0.9 ? '#EF4444' : '#9CA3AF' }}>
              {form.description.length} / {DESCRIPTION_MAX}
            </span>
          </div>
        </div>

        {/* B2B Signals */}
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={label}>B2B Signals <span style={{ fontWeight: 400, color: '#9CA3AF' }}>— what are you looking for?</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
            {B2B_OPTIONS.map(o => (
              <label key={o.value} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 0.85rem', borderRadius: '100px', cursor: 'pointer',
                border: `1.5px solid ${looking.includes(o.value) ? '#0D2340' : '#D1D5DB'}`,
                background: looking.includes(o.value) ? '#EEF2FF' : '#FAFAFA',
                fontSize: '0.825rem', fontWeight: looking.includes(o.value) ? 600 : 400,
                color: looking.includes(o.value) ? '#0D2340' : '#6B7280',
                transition: 'all 0.12s', userSelect: 'none',
              }}>
                <input type="checkbox" checked={looking.includes(o.value)}
                  onChange={() => toggleLooking(o.value)}
                  style={{ accentColor: '#0D2340', width: 13, height: 13 }} />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        {/* Community */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={label}>Community <Opt /></label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
            {[
              { state: women, set: setWomen, label: 'Women-Led Business' },
              { state: speaker, set: setSpeaker, label: 'Available as Conference Speaker' },
              { state: convention, set: setConvention, label: 'FeTNA Convention Participant' },
            ].map(o => (
              <label key={o.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', color: '#374151' }}>
                <input type="checkbox" checked={o.state} onChange={e => o.set(e.target.checked)}
                  style={{ accentColor: '#0D2340', width: 15, height: 15 }} />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #F3F4F6', marginBottom: '1.5rem' }} />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', padding: '0.875rem 1.5rem',
            background: submitting ? '#9CA3AF' : '#0D2340',
            color: '#fff', border: 'none', borderRadius: '0.5rem',
            fontSize: '0.9rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', letterSpacing: '0.2px', transition: 'background 0.15s',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit Business Listing'}
        </button>

        <p style={{ fontSize: '0.77rem', color: '#9CA3AF', textAlign: 'center', marginTop: '0.85rem', lineHeight: 1.5 }}>
          By submitting, you agree to FiTEN&rsquo;s community guidelines. Your listing goes live instantly. Free, always.
        </p>
      </div>
    </div>
  )
}

function Opt() {
  return <span style={{ fontWeight: 400, color: '#9CA3AF', fontSize: '0.75rem' }}>(optional)</span>
}

function Err({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '0.25rem 0 0', fontWeight: 500 }}>{children}</p>
}
