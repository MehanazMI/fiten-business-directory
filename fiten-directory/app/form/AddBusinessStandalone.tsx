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
  { value: 'partner', label: 'Seeking Partners', icon: '🤝' },
  { value: 'client', label: 'Seeking Clients', icon: '🎯' },
  { value: 'invest', label: 'Seeking Investment', icon: '💰' },
  { value: 'hire', label: 'Hiring', icon: '👥' },
]

const COMMUNITY_OPTIONS = [
  { key: 'women', label: 'Women-Led Business', icon: '♀' },
  { key: 'speaker', label: 'Available as Speaker', icon: '🎤' },
  { key: 'convention', label: 'FeTNA Convention Participant', icon: '🏅' },
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
  const [community, setCommunity] = useState({ women: false, speaker: false, convention: false })
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
          looking,
          women: community.women,
          speaker: community.speaker,
          convention: community.convention,
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
  const inputStyle = (field: string): React.CSSProperties => ({
    marginBottom: 0,
    borderColor: showErr(field) ? '#ef4444' : undefined,
    boxShadow: showErr(field) ? '0 0 0 3px rgba(239,68,68,0.1)' : undefined,
  })

  if (success) {
    return (
      <div style={{ maxWidth: 520 }}>
        <div style={{ background: '#fff', borderRadius: '1rem', padding: '3rem 2rem', boxShadow: '0 4px 24px rgba(13,35,64,0.10)', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '2rem', color: 'white',
          }}>✓</div>
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

      {/* Form header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0D2340', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          Add Your Business
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.65 }}>
          List your business on the FiTEN Tamil Business Directory and get discovered by founders, investors, and professionals across the community.
        </p>
      </div>

      {submitError && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.85rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', borderLeft: '4px solid #ef4444', fontSize: '0.875rem', fontWeight: 500 }}>
          {submitError}
        </div>
      )}

      {/* Section 1 — Business Info */}
      <FormSection step={1} label="Business Information">
        <Field error={showErr('businessName') ? fieldErrors.businessName : undefined}>
          <input className="form-input" placeholder="Business name *"
            value={form.businessName} onChange={set('businessName')} onBlur={touch('businessName')}
            style={inputStyle('businessName')} />
        </Field>

        <Field>
          <input className="form-input" placeholder="Business name in Tamil (optional) — e.g. குமரன்"
            value={form.nameTamil} onChange={set('nameTamil')} style={{ marginBottom: 0 }} />
        </Field>

        <Field error={showErr('category') ? fieldErrors.category : undefined}>
          <select className="form-select" value={form.category}
            onChange={set('category')} onBlur={touch('category')} style={inputStyle('category')}>
            <option value="">Select a category *</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Field error={showErr('city') ? fieldErrors.city : undefined}>
            <input className="form-input" placeholder="City *"
              value={form.city} onChange={set('city')} onBlur={touch('city')}
              style={inputStyle('city')} />
          </Field>
          <Field>
            <select className="form-select" value={form.region} onChange={set('region')} style={{ marginBottom: 0 }}>
              <option value="">Region (optional)</option>
              <optgroup label="USA">{REGIONS.slice(0, 11).map(r => <option key={r} value={r}>{r}</option>)}</optgroup>
              <optgroup label="Canada">{REGIONS.slice(11, 18).map(r => <option key={r} value={r}>{r}</option>)}</optgroup>
              <optgroup label="India">{REGIONS.slice(18, 25).map(r => <option key={r} value={r}>{r}</option>)}</optgroup>
              <optgroup label="International">{REGIONS.slice(25).map(r => <option key={r} value={r}>{r}</option>)}</optgroup>
            </select>
          </Field>
        </div>

        <Field>
          <input className="form-input" type="url" placeholder="Website (optional) — https://yoursite.com"
            value={form.website} onChange={set('website')} style={{ marginBottom: 0 }} />
        </Field>
      </FormSection>

      {/* Section 2 — Contact */}
      <FormSection step={2} label="Contact Details">
        <Field error={showErr('email') ? fieldErrors.email : undefined}>
          <input className="form-input" type="email" placeholder="Work email *"
            value={form.email} onChange={set('email')} onBlur={touch('email')}
            style={inputStyle('email')} />
        </Field>
        <Field error={showErr('phone') ? fieldErrors.phone : undefined}>
          <input className="form-input" type="tel" placeholder="Phone / WhatsApp *"
            value={form.phone} onChange={set('phone')} onBlur={touch('phone')}
            style={inputStyle('phone')} />
        </Field>
      </FormSection>

      {/* Section 3 — About */}
      <FormSection step={3} label="About Your Business">
        <Field error={showErr('description') ? fieldErrors.description : undefined}>
          <textarea className="form-textarea"
            placeholder="Describe what your business does, who you serve, and what makes you unique *"
            rows={4} maxLength={DESCRIPTION_MAX}
            value={form.description} onChange={set('description')} onBlur={touch('description')}
            style={{ resize: 'vertical', marginBottom: 0, ...inputStyle('description') }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: form.description.length > DESCRIPTION_MAX * 0.9 ? '#ef4444' : '#9CA3AF' }}>
              {form.description.length} / {DESCRIPTION_MAX}
            </span>
          </div>
        </Field>
      </FormSection>

      {/* Section 4 — B2B Signals */}
      <FormSection step={4} label="B2B Signals" hint="What are you actively looking for right now?">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          {B2B_OPTIONS.map(o => (
            <SignalCard key={o.value} icon={o.icon} label={o.label}
              checked={looking.includes(o.value)}
              onChange={() => toggleLooking(o.value)} />
          ))}
        </div>
      </FormSection>

      {/* Section 5 — Community */}
      <FormSection step={5} label="Community Badges" hint="Recognised badges displayed on your listing.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {COMMUNITY_OPTIONS.map(o => (
            <SignalCard key={o.key} icon={o.icon} label={o.label}
              checked={community[o.key as keyof typeof community]}
              onChange={e => setCommunity(c => ({ ...c, [o.key]: e.target.checked }))} />
          ))}
        </div>
      </FormSection>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%',
          padding: '1rem 1.5rem',
          background: submitting ? '#6B7280' : 'linear-gradient(135deg, #0D2340 0%, #1a3a60 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '0.6rem',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.2s',
          fontFamily: 'inherit',
          letterSpacing: '0.2px',
          marginTop: '0.25rem',
        }}
      >
        {submitting ? 'Publishing your listing…' : 'Publish My Listing →'}
      </button>

      <p style={{ fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center', marginTop: '0.75rem' }}>
        Your listing goes live instantly. Free, always.
      </p>

      {/* Trust row */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
        {['✓ Free to list', '✓ No approval needed', '✓ Live in seconds'].map(t => (
          <span key={t} style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 500 }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────

function FormSection({ step, label, hint, children }: { step: number; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 1px 4px rgba(13,35,64,0.07), 0 4px 16px rgba(13,35,64,0.05)',
      marginBottom: '1rem',
      border: '1px solid #F3F4F6',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: '#0D2340', color: '#C8972A',
          fontSize: '0.7rem', fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: '0.1rem',
        }}>
          {step}
        </div>
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0D2340', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: hint ? '0.2rem' : 0 }}>
            {label}
          </p>
          {hint && <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>{hint}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {children}
      {error && <p style={{ fontSize: '0.76rem', color: '#ef4444', margin: '0.25rem 0 0', fontWeight: 500 }}>{error}</p>}
    </div>
  )
}

function SignalCard({ icon, label, checked, onChange }: {
  icon: string; label: string; checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.7rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
      border: `1.5px solid ${checked ? '#0D2340' : '#E5E7EB'}`,
      background: checked ? '#EEF2FF' : '#FAFAFA',
      fontSize: '0.855rem', fontWeight: checked ? 600 : 400,
      color: checked ? '#0D2340' : '#6B7280',
      transition: 'all 0.15s',
      userSelect: 'none',
    }}>
      <input type="checkbox" checked={checked} onChange={onChange}
        style={{ accentColor: '#0D2340', flexShrink: 0 }} />
      <span>{icon}</span>
      {label}
    </label>
  )
}
