'use client'

import { useState } from 'react'

const CATEGORIES = [
  'Technology', 'Healthcare', 'Finance & Insurance', 'Food & Beverage',
  'Retail', 'Real Estate', 'Education', 'Legal', 'Marketing',
  'Logistics', 'Human Resources', 'Agriculture', 'Entertainment', 'Services', 'Other',
]

const REGIONS = [
  // North America — USA
  'New York, NY', 'New Jersey, NJ', 'California', 'Texas', 'Illinois',
  'Massachusetts', 'Georgia', 'Washington', 'Pennsylvania', 'Florida', 'Other USA',
  // North America — Canada
  'Greater Toronto Area', 'Vancouver', 'Montreal', 'Ottawa', 'Calgary', 'Edmonton', 'Other Canada',
  // India
  'Chennai, India', 'Coimbatore, India', 'Madurai, India', 'Bengaluru, India',
  'Mumbai, India', 'Delhi, India', 'Other India',
  // International
  'UK', 'Europe', 'Middle East', 'Singapore', 'Australia', 'Other',
]

const B2B_OPTIONS = [
  { value: 'partner', label: 'Seeking Business Partners' },
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

  const touch = (field: string) => () =>
    setTouched(t => ({ ...t, [field]: true }))

  const toggleLooking = (val: string) =>
    setLooking(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])

  const handleSubmit = async () => {
    // Mark all required fields as touched to show errors
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
          looking,
          women,
          speaker,
          convention,
          status: 'active',
          pro: false,
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
      const data = await res.json()
      const id = data.name?.split('/').pop() ?? ''
      setNewDocId(id)
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const showErr = (field: string) => touched[field] && fieldErrors[field]

  const inputStyle = (field: string): React.CSSProperties => ({
    marginBottom: showErr(field) ? '0.25rem' : '0',
    borderColor: showErr(field) ? 'var(--red)' : undefined,
  })

  if (success) {
    return (
      <div style={{ maxWidth: 540, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ background: '#fff', borderRadius: '0.8rem', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.75rem' }}>✓</div>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>You&rsquo;re live!</h2>
          <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            <strong>{form.businessName}</strong> is now listed in the FiTEN Business Directory and visible to the Tamil community worldwide.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={newDocId ? `/directory/${newDocId}` : '/directory'}
              style={{ padding: '0.75rem 1.5rem', background: 'var(--navy)', color: '#fff', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
            >
              View My Listing
            </a>
            <a
              href="/directory"
              style={{ padding: '0.75rem 1.5rem', background: 'var(--gold-10)', color: 'var(--navy)', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Browse Directory
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 580 }}>
      <a href="/directory" style={{ color: 'var(--navy)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        ← Back to Directory
      </a>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.4rem' }}>Add Your Business</h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Join the FiTEN Business Directory and connect with Tamil entrepreneurs worldwide. Your listing goes live instantly.
        </p>
      </div>

      {submitError && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.8rem 1rem', borderRadius: '0.4rem', marginBottom: '1.25rem', borderLeft: '4px solid var(--red)', fontSize: '0.9rem' }}>
          {submitError}
        </div>
      )}

      {/* ── Section 1: Business Info ── */}
      <Section label="Business Information">
        <FieldWrap>
          <input
            className="form-input"
            placeholder="Business name *"
            value={form.businessName}
            onChange={set('businessName')}
            onBlur={touch('businessName')}
            style={inputStyle('businessName')}
          />
          {showErr('businessName') && <FieldError>{fieldErrors.businessName}</FieldError>}
        </FieldWrap>

        <FieldWrap>
          <input
            className="form-input"
            placeholder="Business name in Tamil (optional) — e.g. குமரன்"
            value={form.nameTamil}
            onChange={set('nameTamil')}
            style={{ marginBottom: 0 }}
          />
        </FieldWrap>

        <FieldWrap>
          <select
            className="form-select"
            value={form.category}
            onChange={set('category')}
            onBlur={touch('category')}
            style={inputStyle('category')}
          >
            <option value="">Category *</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {showErr('category') && <FieldError>{fieldErrors.category}</FieldError>}
        </FieldWrap>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <FieldWrap>
            <input
              className="form-input"
              placeholder="City *"
              value={form.city}
              onChange={set('city')}
              onBlur={touch('city')}
              style={inputStyle('city')}
            />
            {showErr('city') && <FieldError>{fieldErrors.city}</FieldError>}
          </FieldWrap>

          <FieldWrap>
            <select
              className="form-select"
              value={form.region}
              onChange={set('region')}
              style={{ marginBottom: 0 }}
            >
              <option value="">Region (optional)</option>
              <optgroup label="USA">
                {REGIONS.slice(0, 11).map(r => <option key={r} value={r}>{r}</option>)}
              </optgroup>
              <optgroup label="Canada">
                {REGIONS.slice(11, 18).map(r => <option key={r} value={r}>{r}</option>)}
              </optgroup>
              <optgroup label="India">
                {REGIONS.slice(18, 25).map(r => <option key={r} value={r}>{r}</option>)}
              </optgroup>
              <optgroup label="International">
                {REGIONS.slice(25).map(r => <option key={r} value={r}>{r}</option>)}
              </optgroup>
            </select>
          </FieldWrap>
        </div>

        <FieldWrap>
          <input
            className="form-input"
            type="url"
            placeholder="Website (optional) — https://yoursite.com"
            value={form.website}
            onChange={set('website')}
            style={{ marginBottom: 0 }}
          />
        </FieldWrap>
      </Section>

      {/* ── Section 2: Contact ── */}
      <Section label="Contact Details">
        <FieldWrap>
          <input
            className="form-input"
            type="email"
            placeholder="Email address *"
            value={form.email}
            onChange={set('email')}
            onBlur={touch('email')}
            style={inputStyle('email')}
          />
          {showErr('email') && <FieldError>{fieldErrors.email}</FieldError>}
        </FieldWrap>

        <FieldWrap>
          <input
            className="form-input"
            type="tel"
            placeholder="Phone / WhatsApp *"
            value={form.phone}
            onChange={set('phone')}
            onBlur={touch('phone')}
            style={inputStyle('phone')}
          />
          {showErr('phone') && <FieldError>{fieldErrors.phone}</FieldError>}
        </FieldWrap>
      </Section>

      {/* ── Section 3: About ── */}
      <Section label="About Your Business">
        <FieldWrap>
          <textarea
            className="form-textarea"
            placeholder="Describe what your business does, who you serve, and what makes you unique *"
            rows={4}
            maxLength={DESCRIPTION_MAX}
            value={form.description}
            onChange={set('description')}
            onBlur={touch('description')}
            style={{ resize: 'vertical', marginBottom: showErr('description') ? '0.25rem' : '0' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {showErr('description')
              ? <FieldError>{fieldErrors.description}</FieldError>
              : <span />}
            <span style={{ fontSize: '0.78rem', color: form.description.length > DESCRIPTION_MAX * 0.9 ? 'var(--red)' : 'var(--text2)' }}>
              {form.description.length} / {DESCRIPTION_MAX}
            </span>
          </div>
        </FieldWrap>
      </Section>

      {/* ── Section 4: B2B Signals ── */}
      <Section label="B2B Signals" hint="What are you looking for right now?">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {B2B_OPTIONS.map(o => (
            <CheckCard
              key={o.value}
              checked={looking.includes(o.value)}
              onChange={() => toggleLooking(o.value)}
              label={o.label}
            />
          ))}
        </div>
      </Section>

      {/* ── Section 5: Community ── */}
      <Section label="Community" hint="Help the community find and recognize you.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <CheckCard checked={women} onChange={e => setWomen(e.target.checked)} label="Women-Led Business" />
          <CheckCard checked={speaker} onChange={e => setSpeaker(e.target.checked)} label="Available as Conference Speaker" />
          <CheckCard checked={convention} onChange={e => setConvention(e.target.checked)} label="FeTNA Convention Participant" />
        </div>
      </Section>

      <button
        className="form-submit"
        onClick={handleSubmit}
        disabled={submitting}
        style={{ marginTop: '0.5rem', fontSize: '0.95rem', fontWeight: 700, padding: '1rem' }}
      >
        {submitting ? 'Publishing...' : 'Publish My Listing'}
      </button>
      <p style={{ fontSize: '0.8rem', color: 'var(--text2)', textAlign: 'center', marginTop: '0.75rem' }}>
        Your listing goes live instantly — no approval needed.
      </p>
    </div>
  )
}

// ── Shared sub-components ──────────────────────────────

function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: '0.8rem', padding: '1.5rem', boxShadow: 'var(--shadow-md)', marginBottom: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: hint ? '0.2rem' : 0 }}>
          {label}
        </p>
        {hint && <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{hint}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {children}
      </div>
    </div>
  )
}

function FieldWrap({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '0.78rem', color: 'var(--red)', margin: '0.2rem 0 0', fontWeight: 500 }}>{children}</p>
}

function CheckCard({ checked, onChange, label }: { checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.65rem 0.9rem', borderRadius: '0.5rem', cursor: 'pointer',
      border: `1.5px solid ${checked ? 'var(--navy)' : 'var(--border)'}`,
      background: checked ? '#f0f4ff' : '#fafafa',
      fontSize: '0.88rem', fontWeight: checked ? 600 : 400,
      transition: 'all 0.15s',
    }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: 'var(--navy)' }} />
      {label}
    </label>
  )
}
