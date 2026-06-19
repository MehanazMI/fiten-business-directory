'use client'

import { useState, useRef, useCallback } from 'react'

const CATEGORIES = [
  'Technology', 'Healthcare', 'Finance & Insurance', 'Food & Beverage',
  'Retail', 'Real Estate', 'Education', 'Legal', 'Marketing',
  'Logistics', 'Human Resources', 'Agriculture', 'Entertainment', 'Services', 'Other',
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
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

const FS_URL = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/businesses`
  + `?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  ?? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`

async function uploadFile(file: File, submissionId: string): Promise<string> {
  const path = `submissions/${submissionId}/${Date.now()}_${file.name}`
  const url = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o`
    + `?uploadType=media&name=${encodeURIComponent(path)}&key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    throw new Error(d.error?.message ?? `Upload failed (${res.status})`)
  }
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(path)}?alt=media`
}

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

const requiredFields = ['businessName', 'contactName', 'category', 'city', 'email', 'description'] as const

// ─── Style tokens ─────────────────────────────────────────────────────────────

const LBL: React.CSSProperties = {
  display: 'block',
  fontSize: '0.625rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.5)',
  marginBottom: '0.4rem',
}

const INP: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(255,255,255,0.18)',
  color: 'white',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddBusinessStandalone() {
  const [form, setForm] = useState({
    businessName: '', nameTamil: '', contactName: '', category: '',
    founded: '', registrationNo: '', region: '', city: '',
    email: '', phone: '', website: '', description: '',
  })
  const [looking, setLooking] = useState<string[]>([])
  const [women, setWomen] = useState(false)
  const [convention, setConvention] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [focused, setFocused] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newDocId, setNewDocId] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const errors = validate(form)
  const set = (f2: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [f2]: e.target.value }))
  const touch = (f2: string) => () => setTouched(t => ({ ...t, [f2]: true }))
  const focus = (f2: string) => () => setFocused(f2)
  const blur = (f2: string) => () => { setFocused(null); setTouched(t => ({ ...t, [f2]: true })) }
  const toggleLooking = (val: string) =>
    setLooking(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])

  const addFiles = useCallback((fl: FileList | null) => {
    if (!fl) return
    const valid = Array.from(fl).filter(f => ACCEPTED_TYPES.includes(f.type))
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...valid.filter(f => !names.has(f.name))]
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files)
  }, [addFiles])

  const showErr = (f2: string) => touched[f2] && errors[f2]

  const inputStyle = (f2: string): React.CSSProperties => ({
    ...INP,
    borderColor: showErr(f2)
      ? 'rgba(248,113,113,0.9)'
      : focused === f2 ? '#C8972A' : 'rgba(255,255,255,0.18)',
  })

  const selectStyle = (f2: string): React.CSSProperties => {
    const base = inputStyle(f2)
    const { background: _bg, ...rest } = base
    return {
      ...rest,
      appearance: 'none',
      background: `rgba(255,255,255,0.05) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") no-repeat right 0.9rem center`,
      paddingRight: '2.5rem',
    }
  }

  const handleSubmit = async () => {
    const allTouched = Object.fromEntries(requiredFields.map(f => [f, true]))
    setTouched(t => ({ ...t, ...allTouched }))
    if (Object.keys(errors).length > 0) return
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
      setSubmitError('Form submissions are disabled on preview deployments.')
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      // Generate a submission ID so storage paths are grouped by submission
      const submissionId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

      // Upload files first
      let logoUrls: string[] = []
      if (files.length > 0) {
        setUploadProgress(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}…`)
        logoUrls = await Promise.all(files.map(f => uploadFile(f, submissionId)))
        setUploadProgress(null)
      }

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
          logoUrls,
          // If a registration number is provided, flag for verification review
          verificationStatus: form.registrationNo.trim() ? 'pending' : 'unverified',
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
      setUploadProgress(null)
    }
  }

  // ─── Success ────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div style={{ background: '#0D2340', padding: '3.5rem 2.5rem', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.5rem', color: 'white' }}>✓</div>
        <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C8972A', marginBottom: '0.6rem' }}>You&rsquo;re live</div>
        <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.6rem', lineHeight: 1.2 }}>{form.businessName} is now listed.</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: '0.875rem', maxWidth: 380, margin: '0 auto 2rem' }}>
          Visible to Tamil entrepreneurs, partners, and investors worldwide.
          {form.registrationNo && ' Your registration number has been submitted for verification review.'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={newDocId ? `/directory/${newDocId}` : '/directory'}
            style={{ padding: '0.8rem 1.75rem', background: '#C8972A', color: '#0D2340', textDecoration: 'none', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            View My Listing
          </a>
          <a href="/directory"
            style={{ padding: '0.8rem 1.75rem', background: 'rgba(255,255,255,0.08)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Browse Directory
          </a>
        </div>
      </div>
    )
  }

  // ─── Form ────────────────────────────────────────────────────────────────────

  return (
    <div>
      <a href="/directory" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        ← Back to Directory
      </a>

      <div style={{ background: '#0D2340', color: 'white', padding: '2.5rem 3rem' }}>

        {submitError && (
          <div style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', padding: '0.8rem 1rem', marginBottom: '1.5rem', borderLeft: '3px solid rgba(239,68,68,0.6)', fontSize: '0.85rem' }}>
            {submitError}
          </div>
        )}

        <F label="Business Name" required>
          <input style={inputStyle('businessName')} placeholder="e.g. Kumaran Software Labs"
            value={form.businessName} onChange={set('businessName')}
            onFocus={focus('businessName')} onBlur={blur('businessName')} />
          {showErr('businessName') && <Err>{errors.businessName}</Err>}
        </F>

        <F label="Business Name in Tamil" hint="optional">
          <input style={{ ...INP, borderColor: focused === 'nameTamil' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
            placeholder="e.g. குமரன்" value={form.nameTamil} onChange={set('nameTamil')}
            onFocus={focus('nameTamil')} onBlur={() => setFocused(null)} />
        </F>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <F label="City" required>
            <input style={inputStyle('city')} placeholder="e.g. Edison, NJ"
              value={form.city} onChange={set('city')}
              onFocus={focus('city')} onBlur={blur('city')} />
            {showErr('city') && <Err>{errors.city}</Err>}
          </F>
          <F label="Founded" hint="optional">
            <input style={{ ...INP, borderColor: focused === 'founded' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
              type="number" min={1900} max={new Date().getFullYear()} placeholder="Year"
              value={form.founded} onChange={set('founded')}
              onFocus={focus('founded')} onBlur={() => setFocused(null)} />
          </F>
        </div>

        <F label="Primary Sector" required>
          <select style={selectStyle('category')} value={form.category}
            onChange={set('category')} onFocus={focus('category')} onBlur={blur('category')}>
            <option value="" style={{ background: '#0D2340' }}>Select...</option>
            {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0D2340' }}>{c}</option>)}
          </select>
          {showErr('category') && <Err>{errors.category}</Err>}
        </F>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <F label="Region" hint="optional">
            <select style={{ ...selectStyle('region'), borderColor: focused === 'region' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
              value={form.region} onChange={set('region')}
              onFocus={focus('region')} onBlur={() => setFocused(null)}>
              <option value="" style={{ background: '#0D2340' }}>Select...</option>
              <optgroup label="USA">{REGIONS_USA.map(r => <option key={r} value={r} style={{ background: '#0D2340' }}>{r}</option>)}</optgroup>
              <optgroup label="Canada">{REGIONS_CA.map(r => <option key={r} value={r} style={{ background: '#0D2340' }}>{r}</option>)}</optgroup>
              <optgroup label="India">{REGIONS_IN.map(r => <option key={r} value={r} style={{ background: '#0D2340' }}>{r}</option>)}</optgroup>
              <optgroup label="International">{REGIONS_INTL.map(r => <option key={r} value={r} style={{ background: '#0D2340' }}>{r}</option>)}</optgroup>
            </select>
          </F>
          <F label="Registration No." hint="optional — for verification">
            <input style={{ ...INP, borderColor: focused === 'registrationNo' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
              placeholder="e.g. LLC-12345"
              value={form.registrationNo} onChange={set('registrationNo')}
              onFocus={focus('registrationNo')} onBlur={() => setFocused(null)} />
          </F>
        </div>

        <F label="Primary Contact Name" required>
          <input style={inputStyle('contactName')} placeholder="Owner or community lead"
            value={form.contactName} onChange={set('contactName')}
            onFocus={focus('contactName')} onBlur={blur('contactName')} />
          {showErr('contactName') && <Err>{errors.contactName}</Err>}
        </F>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <F label="Work Email" required>
            <input style={inputStyle('email')} type="email" placeholder="name@business.com"
              value={form.email} onChange={set('email')}
              onFocus={focus('email')} onBlur={blur('email')} />
            {showErr('email') && <Err>{errors.email}</Err>}
          </F>
          <F label="Direct Phone" hint="optional">
            <input style={{ ...INP, borderColor: focused === 'phone' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
              type="tel" placeholder="+1 212 ..."
              value={form.phone} onChange={set('phone')}
              onFocus={focus('phone')} onBlur={() => setFocused(null)} />
          </F>
        </div>

        <F label="Website" hint="optional">
          <input style={{ ...INP, borderColor: focused === 'website' ? '#C8972A' : 'rgba(255,255,255,0.18)' }}
            type="url" placeholder="https://yoursite.com"
            value={form.website} onChange={set('website')}
            onFocus={focus('website')} onBlur={() => setFocused(null)} />
        </F>

        <F label="Business Summary" required>
          <textarea
            style={{ ...inputStyle('description'), resize: 'none', minHeight: 120, lineHeight: 1.6 }}
            placeholder="Describe what your business does and who it serves in the Tamil community."
            rows={5} maxLength={DESCRIPTION_MAX}
            value={form.description} onChange={set('description')}
            onFocus={focus('description')} onBlur={blur('description')}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            {showErr('description') ? <Err>{errors.description}</Err> : <span />}
            <span style={{ fontSize: '0.68rem', color: form.description.length > DESCRIPTION_MAX * 0.9 ? '#FCA5A5' : 'rgba(255,255,255,0.3)' }}>
              {form.description.length} / {DESCRIPTION_MAX}
            </span>
          </div>
        </F>

        <F label="B2B Signals" hint="what are you looking for?">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {B2B_OPTIONS.map(o => (
              <label key={o.value} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.85rem', cursor: 'pointer',
                border: `1px solid ${looking.includes(o.value) ? '#C8972A' : 'rgba(255,255,255,0.2)'}`,
                background: looking.includes(o.value) ? 'rgba(200,151,42,0.12)' : 'rgba(255,255,255,0.04)',
                fontSize: '0.8rem', fontWeight: looking.includes(o.value) ? 600 : 400,
                color: looking.includes(o.value) ? '#C8972A' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.12s', userSelect: 'none',
              }}>
                <input type="checkbox" checked={looking.includes(o.value)}
                  onChange={() => toggleLooking(o.value)}
                  style={{ accentColor: '#C8972A', width: 12, height: 12 }} />
                {o.label}
              </label>
            ))}
          </div>
        </F>

        <F label="Community" hint="optional">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { state: women, setState: setWomen, label: 'Women-Led Business' },
              { state: convention, setState: setConvention, label: 'FeTNA Convention Participant' },
            ].map(o => (
              <label key={o.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'rgba(255,255,255,0.75)' }}>
                <input type="checkbox" checked={o.state} onChange={e => o.setState(e.target.checked)}
                  style={{ accentColor: '#C8972A', width: 14, height: 14 }} />
                {o.label}
              </label>
            ))}
          </div>
        </F>

        <F label="Logo & Documentation" hint="optional">
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#C8972A' : 'rgba(255,255,255,0.2)'}`,
              padding: '1.75rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'rgba(200,151,42,0.06)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <input ref={fileInputRef} type="file" multiple accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.docx"
              style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
              Drop your logo, brand assets, or business registration here.
              <br />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>PNG, PDF, or DOCX · Up to 25 MB · Uploaded to secure storage</span>
            </p>
          </div>

          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.6rem' }}>
              {files.map(f => (
                <div key={f.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
                    {f.name} <span style={{ color: 'rgba(255,255,255,0.35)' }}>({(f.size / 1024).toFixed(0)} KB)</span>
                  </span>
                  <button onClick={e => { e.stopPropagation(); setFiles(prev => prev.filter(x => x.name !== f.name)) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: '1rem', padding: '0 0.25rem', lineHeight: 1 }}
                    aria-label="Remove file">×</button>
                </div>
              ))}
            </div>
          )}
        </F>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', padding: '1rem 1.5rem',
            background: submitting ? 'rgba(200,151,42,0.5)' : '#C8972A',
            color: '#0D2340', border: 'none',
            fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s', marginTop: '0.5rem',
          }}
        >
          {uploadProgress ?? (submitting ? 'Submitting…' : 'Submit Business Listing')}
        </button>

        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          By submitting, you agree to FiTEN&rsquo;s community guidelines and verification process.
        </p>

      </div>
    </div>
  )
}

function F({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={LBL}>
        {label}
        {required && <span style={{ color: 'rgba(200,151,42,0.9)', marginLeft: '0.2rem' }}>*</span>}
        {hint && <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.28)', marginLeft: '0.4rem', textTransform: 'none', letterSpacing: 0 }}>— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

function Err({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '0.72rem', color: '#FCA5A5', margin: '0.3rem 0 0', fontWeight: 500 }}>{children}</p>
}
