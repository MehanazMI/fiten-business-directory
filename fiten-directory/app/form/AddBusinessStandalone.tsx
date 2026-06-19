'use client'

import { useState, useRef, useCallback } from 'react'

const CATEGORIES = [
  'Technology', 'Healthcare', 'Finance & Insurance', 'Food & Beverage',
  'Retail', 'Real Estate', 'Education', 'Legal', 'Marketing',
  'Logistics', 'Human Resources', 'Agriculture', 'Entertainment', 'Services', 'Other',
]

const FIRM_SIZES = [
  { value: 'boutique', label: 'Boutique (1–20)' },
  { value: 'mid', label: 'Mid-Market (21–200)' },
  { value: 'global', label: 'Global (200+)' },
]

const REGIONS_USA = [
  'New York, NY', 'New Jersey, NJ', 'California', 'Texas', 'Illinois',
  'Massachusetts', 'Georgia', 'Washington', 'Pennsylvania', 'Florida', 'Other USA',
]
const REGIONS_CA = ['Greater Toronto Area', 'Vancouver', 'Montreal', 'Ottawa', 'Calgary', 'Edmonton', 'Other Canada']
const REGIONS_IN = ['Chennai, India', 'Coimbatore, India', 'Madurai, India', 'Bengaluru, India', 'Mumbai, India', 'Delhi, India', 'Other India']
const REGIONS_INTL = ['UK', 'Europe', 'Middle East', 'Singapore', 'Australia', 'Other']

const B2B_OPTIONS = [
  { value: 'partner', label: 'Partner' },
  { value: 'client', label: 'Seeking Clients' },
  { value: 'invest', label: 'Seeking Investment' },
  { value: 'hire', label: 'Hiring' },
  { value: 'speaker', label: 'Speaker' },
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

function validate(form: Record<string, string>): Errors {
  const errs: Errors = {}
  if (!form.businessName.trim()) errs.businessName = 'Business name is required.'
  if (!form.contactName.trim()) errs.contactName = 'Contact name is required.'
  if (!form.category) errs.category = 'Please select a category.'
  if (!form.city.trim()) errs.city = 'City is required.'
  if (!form.email.trim()) errs.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.'
  if (!form.description.trim()) errs.description = 'Please add a business description.'
  else if (form.description.trim().length < 20) errs.description = 'Description must be at least 20 characters.'
  return errs
}

const required = ['businessName', 'contactName', 'category', 'city', 'email', 'description'] as const

// Light form card style primitives
const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: '0.625rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#6B7280',
  marginBottom: '0.4rem',
}

const inp: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem 1rem',
  background: 'white',
  border: '1px solid #D1D5DB',
  color: '#111827',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

export default function AddBusinessStandalone() {
  const [form, setForm] = useState({
    businessName: '', nameTamil: '', contactName: '', category: '', firmSize: '',
    founded: '', registrationNo: '', region: '', city: '', email: '',
    phone: '', website: '', description: '',
  })
  const [looking, setLooking] = useState<string[]>([])
  const [women, setWomen] = useState(false)
  const [convention, setConvention] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [focused, setFocused] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newDocId, setNewDocId] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fieldErrors = validate(form)
  const set = (f2: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [f2]: e.target.value }))
  const touch = (field: string) => () => setTouched(t => ({ ...t, [field]: true }))
  const focus = (field: string) => () => setFocused(field)
  const blur = (field: string) => () => { setFocused(null); setTouched(t => ({ ...t, [field]: true })) }
  const toggleLooking = (val: string) =>
    setLooking(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const allowed = Array.from(files).filter(f =>
      ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
        'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type)
    )
    setUploadedFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...allowed.filter(f => !names.has(f.name))]
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeFile = (name: string) =>
    setUploadedFiles(prev => prev.filter(f => f.name !== name))

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
      const speakerInB2B = looking.includes('speaker')
      const lookingWithoutSpeaker = looking.filter(v => v !== 'speaker')
      const res = await fetch(FS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFields({
          businessName: form.businessName.trim(),
          nameTamil: form.nameTamil.trim(),
          contactName: form.contactName.trim(),
          category: form.category,
          firmSize: form.firmSize,
          founded: form.founded.trim(),
          registrationNo: form.registrationNo.trim(),
          region: form.region,
          city: form.city.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          website: form.website.trim(),
          description: form.description.trim(),
          looking: lookingWithoutSpeaker,
          speaker: speakerInB2B,
          women,
          convention,
          attachments: uploadedFiles.map(f => f.name).join(', '),
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

  const inputStyle = (field: string): React.CSSProperties => ({
    ...inp,
    borderColor: showErr(field) ? '#EF4444' : focused === field ? '#0D2340' : '#D1D5DB',
    boxShadow: showErr(field) ? '0 0 0 3px rgba(239,68,68,0.08)' : focused === field ? '0 0 0 3px rgba(13,35,64,0.08)' : undefined,
  })

  const selectStyle = (field: string): React.CSSProperties => ({
    ...inputStyle(field),
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.9rem center',
    paddingRight: '2.5rem',
  })

  // ─── Success screen ───────────────────────────────────────────────────────────

  if (success) {
    return (
      <div style={{ background: 'white', border: '1px solid #E5E7EB', padding: '3.5rem 2.5rem', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg,#10B981,#059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', fontSize: '1.75rem', color: 'white',
        }}>&#10003;</div>
        <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8972A', marginBottom: '0.75rem' }}>
          You&rsquo;re live
        </div>
        <h2 style={{ color: '#0D2340', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2 }}>
          {form.businessName} is now listed.
        </h2>
        <p style={{ color: '#6B7280', lineHeight: 1.7, marginBottom: '2.5rem', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto 2.5rem' }}>
          Your listing is visible to Tamil entrepreneurs, partners, and investors worldwide.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={newDocId ? `/directory/${newDocId}` : '/directory'}
            style={{ padding: '0.85rem 2rem', background: '#0D2340', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            View My Listing
          </a>
          <a href="/directory"
            style={{ padding: '0.85rem 2rem', background: '#F5E9CC', color: '#0D2340', textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Browse Directory
          </a>
        </div>
      </div>
    )
  }

  // ─── Form ─────────────────────────────────────────────────────────────────────

  return (
    <div>
      <a href="/directory" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        ← Back to Directory
      </a>

      <div style={{ background: 'white', border: '1px solid #E5E7EB', padding: '2.5rem 3rem' }}>

        {submitError && (
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.8rem 1rem', marginBottom: '1.5rem', borderLeft: '3px solid #EF4444', fontSize: '0.85rem' }}>
            {submitError}
          </div>
        )}

        <Field label="Business Name" required>
          <input style={inputStyle('businessName')} placeholder="e.g. Kumaran Software Labs"
            value={form.businessName} onChange={set('businessName')}
            onFocus={focus('businessName')} onBlur={blur('businessName')} />
          {showErr('businessName') && <ErrMsg>{fieldErrors.businessName}</ErrMsg>}
        </Field>

        <Field label="Business Name in Tamil" hint="optional">
          <input style={{ ...inp, borderColor: focused === 'nameTamil' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
            placeholder="e.g. குமரன்" value={form.nameTamil} onChange={set('nameTamil')}
            onFocus={focus('nameTamil')} onBlur={() => setFocused(null)} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <Field label="City" required>
            <input style={inputStyle('city')} placeholder="e.g. Edison, NJ"
              value={form.city} onChange={set('city')}
              onFocus={focus('city')} onBlur={blur('city')} />
            {showErr('city') && <ErrMsg>{fieldErrors.city}</ErrMsg>}
          </Field>
          <Field label="Founded" hint="optional">
            <input style={{ ...inp, borderColor: focused === 'founded' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
              type="number" min={1900} max={new Date().getFullYear()} placeholder="Year"
              value={form.founded} onChange={set('founded')}
              onFocus={focus('founded')} onBlur={() => setFocused(null)} />
          </Field>
        </div>

        <Field label="Primary Sector" required>
          <select style={selectStyle('category')} value={form.category}
            onChange={set('category')} onFocus={focus('category')} onBlur={blur('category')}>
            <option value="" style={{ background: 'white' }}>Select...</option>
            {CATEGORIES.map(c => <option key={c} value={c} style={{ background: 'white' }}>{c}</option>)}
          </select>
          {showErr('category') && <ErrMsg>{fieldErrors.category}</ErrMsg>}
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <Field label="Firm Size" hint="optional">
            <select style={selectStyle('firmSize')} value={form.firmSize}
              onChange={set('firmSize')} onFocus={focus('firmSize')} onBlur={() => setFocused(null)}>
              <option value="" style={{ background: 'white' }}>Select...</option>
              {FIRM_SIZES.map(s => <option key={s.value} value={s.value} style={{ background: 'white' }}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Registration No." hint="optional">
            <input style={{ ...inp, borderColor: focused === 'registrationNo' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
              placeholder="e.g. LLC-12345" value={form.registrationNo} onChange={set('registrationNo')}
              onFocus={focus('registrationNo')} onBlur={() => setFocused(null)} />
          </Field>
        </div>

        <Field label="Region" hint="optional">
          <select style={{ ...selectStyle('region'), borderColor: focused === 'region' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
            value={form.region} onChange={set('region')}
            onFocus={focus('region')} onBlur={() => setFocused(null)}>
            <option value="" style={{ background: 'white' }}>Select...</option>
            <optgroup label="USA">{REGIONS_USA.map(r => <option key={r} value={r} style={{ background: 'white' }}>{r}</option>)}</optgroup>
            <optgroup label="Canada">{REGIONS_CA.map(r => <option key={r} value={r} style={{ background: 'white' }}>{r}</option>)}</optgroup>
            <optgroup label="India">{REGIONS_IN.map(r => <option key={r} value={r} style={{ background: 'white' }}>{r}</option>)}</optgroup>
            <optgroup label="International">{REGIONS_INTL.map(r => <option key={r} value={r} style={{ background: 'white' }}>{r}</option>)}</optgroup>
          </select>
        </Field>

        <Field label="Primary Contact Name" required>
          <input style={inputStyle('contactName')} placeholder="Owner or community lead"
            value={form.contactName} onChange={set('contactName')}
            onFocus={focus('contactName')} onBlur={blur('contactName')} />
          {showErr('contactName') && <ErrMsg>{fieldErrors.contactName}</ErrMsg>}
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <Field label="Work Email" required>
            <input style={inputStyle('email')} type="email" placeholder="name@business.com"
              value={form.email} onChange={set('email')}
              onFocus={focus('email')} onBlur={blur('email')} />
            {showErr('email') && <ErrMsg>{fieldErrors.email}</ErrMsg>}
          </Field>
          <Field label="Direct Phone" hint="optional">
            <input style={{ ...inp, borderColor: focused === 'phone' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
              type="tel" placeholder="+1 212 ..."
              value={form.phone} onChange={set('phone')}
              onFocus={focus('phone')} onBlur={() => setFocused(null)} />
          </Field>
        </div>

        <Field label="Website" hint="optional">
          <input style={{ ...inp, borderColor: focused === 'website' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
            type="url" placeholder="https://yoursite.com"
            value={form.website} onChange={set('website')}
            onFocus={focus('website')} onBlur={() => setFocused(null)} />
        </Field>

        <Field label="Business Summary" required>
          <textarea
            style={{
              ...inputStyle('description'),
              resize: 'none',
              minHeight: 120,
              lineHeight: 1.6,
            }}
            placeholder="Describe what your business does and who it serves in the Tamil community."
            rows={5} maxLength={DESCRIPTION_MAX}
            value={form.description} onChange={set('description')}
            onFocus={focus('description')} onBlur={blur('description')}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
            {showErr('description') ? <ErrMsg>{fieldErrors.description}</ErrMsg> : <span />}
            <span style={{ fontSize: '0.7rem', color: form.description.length > DESCRIPTION_MAX * 0.9 ? '#EF4444' : '#9CA3AF' }}>
              {form.description.length} / {DESCRIPTION_MAX}
            </span>
          </div>
        </Field>

        <Field label="B2B Signals" hint="what are you looking for?">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {B2B_OPTIONS.map(o => (
              <label key={o.value} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.85rem', cursor: 'pointer',
                border: `1px solid ${looking.includes(o.value) ? '#0D2340' : '#D1D5DB'}`,
                background: looking.includes(o.value) ? '#EEF1F8' : '#FAFAFA',
                fontSize: '0.8rem', fontWeight: looking.includes(o.value) ? 600 : 400,
                color: looking.includes(o.value) ? '#0D2340' : '#6B7280',
                transition: 'all 0.12s', userSelect: 'none',
              }}>
                <input type="checkbox" checked={looking.includes(o.value)}
                  onChange={() => toggleLooking(o.value)}
                  style={{ accentColor: '#0D2340', width: 12, height: 12 }} />
                {o.label}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Community" hint="optional">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { state: women, setState: setWomen, label: 'Women-Led Business' },
              { state: convention, setState: setConvention, label: 'FeTNA Convention Participant' },
            ].map(o => (
              <label key={o.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: '#374151' }}>
                <input type="checkbox" checked={o.state} onChange={e => o.setState(e.target.checked)}
                  style={{ accentColor: '#0D2340', width: 14, height: 14 }} />
                {o.label}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Logo & Documentation" hint="optional">
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#0D2340' : '#D1D5DB'}`,
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? '#F0F4FF' : '#FAFAFA',
              transition: 'all 0.15s',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.docx"
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
            <p style={{ fontSize: '0.8rem', color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>
              Drop your logo, brand assets, or business registration here.
              <br />
              <span style={{ color: '#C4C9D4', fontSize: '0.73rem' }}>PNG, PDF, or DOCX · Up to 25 MB</span>
            </p>
          </div>

          {uploadedFiles.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.6rem' }}>
              {uploadedFiles.map(f => (
                <div key={f.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}>
                  <span style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
                    {f.name} ({(f.size / 1024).toFixed(0)} KB)
                  </span>
                  <button onClick={e => { e.stopPropagation(); removeFile(f.name) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '1rem', padding: '0 0.25rem' }}
                    aria-label="Remove file">×</button>
                </div>
              ))}
            </div>
          )}
        </Field>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '1rem 1.5rem',
            background: submitting ? '#6B7280' : '#0D2340',
            color: 'white',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'inherit',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
            marginTop: '0.5rem',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit Business Listing'}
        </button>

        <p style={{ fontSize: '0.625rem', color: '#9CA3AF', textAlign: 'center', marginTop: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          By submitting, you agree to FiTEN&rsquo;s community guidelines and verification process.
        </p>

      </div>
    </div>
  )
}

function Field({ label, hint, required, children }: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={lbl}>
        {label}
        {required && <span style={{ color: 'rgba(200,151,42,0.8)', marginLeft: '0.2rem' }}>*</span>}
        {hint && <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: '0.4rem', textTransform: 'none', letterSpacing: 0 }}>— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '0.73rem', color: '#EF4444', margin: '0.3rem 0 0', fontWeight: 500 }}>{children}</p>
}
