'use client'

import { useState, useRef, useCallback } from 'react'
import { useRecaptcha } from '@/lib/useRecaptcha'
import { useAuth } from '@/lib/auth-context'

const CATEGORIES = [
  'Technology', 'Healthcare', 'Finance & Insurance', 'Food & Beverage',
  'Retail', 'Real Estate', 'Education', 'Legal', 'Marketing',
  'Logistics', 'Human Resources', 'Agriculture', 'Entertainment', 'Services', 'Other',
]

const COUNTRIES = [
  'USA', 'Canada', 'India', 'UK', 'Singapore', 'Australia',
  'UAE', 'Germany', 'France', 'Malaysia', 'Sri Lanka', 'South Africa', 'Other',
]

const TIMEZONES = [
  'America/New_York (ET)', 'America/Chicago (CT)', 'America/Denver (MT)', 'America/Los_Angeles (PT)',
  'America/Toronto (ET)', 'America/Vancouver (PT)',
  'Europe/London (GMT/BST)', 'Europe/Paris (CET)',
  'Asia/Kolkata (IST)', 'Asia/Colombo (SLT)',
  'Asia/Singapore (SGT)', 'Australia/Sydney (AEDT)',
  'Asia/Dubai (GST)',
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

const OPT_BG = { background: 'var(--navy)' }

const TEST_BUSINESSES = [
  // Canada
  { businessName: 'Sunrise Tech Solutions', nameTamil: 'சன்ரைஸ் டெக்', contactName: 'Arun Natarajan', category: 'Technology', city: 'Toronto', region: 'Greater Toronto Area', email: 'rasheed.comm@gmail.com', phone: '4165550101', website: 'https://sunrisetech.ca', description: 'Full-stack software development firm specialising in fintech integrations and cloud-native applications for global SMEs.', looking: ['partner', 'client'], women: false, convention: true },
  { businessName: "Amma's Kitchen Catering", nameTamil: 'அம்மா கிச்சன்', contactName: 'Meena Krishnan', category: 'Food & Beverage', city: 'Markham', region: 'Greater Toronto Area', email: 'rasheed.comm@gmail.com', phone: '9055550505', website: 'https://ammaskitchen.ca', description: 'Authentic South Indian and Sri Lankan catering for weddings, corporate events, and cultural festivals. Specialising in banana-leaf meals and traditional sweets.', looking: ['client', 'partner'], women: true, convention: true },
  // USA
  { businessName: 'Bay Area Tamil Ventures', nameTamil: 'பே ஏரியா தமிழ்', contactName: 'Karthik Selvam', category: 'Finance & Insurance', city: 'San Jose', region: 'California', email: 'rasheed.comm@gmail.com', phone: '4085550101', website: 'https://batventures.com', description: 'Silicon Valley-based venture fund focused on early-stage Tamil diaspora founders across the US, Canada, and South Asia.', looking: ['invest', 'partner'], women: false, convention: true },
  { businessName: 'Valli Wellness Center', nameTamil: 'வல்லி வெல்னஸ்', contactName: 'Valli Subramaniam', category: 'Healthcare', city: 'New Jersey', region: 'New Jersey', email: 'rasheed.comm@gmail.com', phone: '8625550202', website: 'https://valliwellness.com', description: 'Integrative medicine clinic combining Ayurveda and modern healthcare, serving the Tamil-speaking diaspora community across the tri-state area.', looking: ['client'], women: true, convention: false },
  // UK
  { businessName: 'Rajan & Associates Law', nameTamil: '', contactName: 'Raj Rajan', category: 'Legal', city: 'London', region: 'United Kingdom', email: 'rasheed.comm@gmail.com', phone: '+442075550303', website: 'https://rajanlaw.co.uk', description: 'Immigration and commercial law practice with over 15 years serving the Tamil diaspora across the UK and Europe. Free initial consultations available.', looking: ['client', 'partner'], women: false, convention: true },
  { businessName: 'Ponni Textiles & Sarees', nameTamil: 'பொன்னி டெக்ஸ்டைல்ஸ்', contactName: 'Ponni Chandran', category: 'Retail', city: 'London', region: 'United Kingdom', email: 'rasheed.comm@gmail.com', phone: '+442075550909', website: 'https://ponnitextiles.co.uk', description: 'Curated collection of Kanchipuram silk sarees, salwar kameez, and bridal jewellery imported directly from Tamil Nadu for special occasions across the UK.', looking: ['client'], women: true, convention: true },
  // Singapore
  { businessName: 'Senthil Digital Consulting', nameTamil: '', contactName: 'Senthil Kumar', category: 'Technology', city: 'Singapore', region: 'Singapore', email: 'rasheed.comm@gmail.com', phone: '+6587550808', website: 'https://senthildigital.sg', description: 'Digital transformation consultancy helping APAC enterprises adopt cloud infrastructure, AI tools, and agile delivery practices.', looking: ['partner', 'hire'], women: false, convention: false },
  // India
  { businessName: 'Tamil School of Excellence', nameTamil: 'தமிழ் சிறப்பு பள்ளி', contactName: 'Kavitha Arumugam', category: 'Education', city: 'Chennai', region: 'Tamil Nadu', email: 'rasheed.comm@gmail.com', phone: '+914455550707', website: 'https://tamilschoolofexcellence.in', description: 'Supplementary school offering Tamil language, Bharatanatyam dance, and STEM enrichment for children aged 5–16, with online classes available globally.', looking: ['partner'], women: true, convention: true },
  { businessName: 'Thendral Exports', nameTamil: 'தென்றல் ஏற்றுமதி', contactName: 'Priya Thendral', category: 'Retail', city: 'Coimbatore', region: 'Tamil Nadu', email: 'rasheed.comm@gmail.com', phone: '+914225550404', website: 'https://thendralexports.com', description: 'Exporter of handloom textiles, natural spices, and artisan handicrafts from Tamil Nadu to diaspora markets in North America, Europe, and Southeast Asia.', looking: ['client', 'partner'], women: true, convention: false },
  // Australia
  { businessName: 'Murugesan Constructions', nameTamil: 'முருகேசன் கட்டுமானம்', contactName: 'Kumar Murugesan', category: 'Services', city: 'Sydney', region: 'Australia', email: 'rasheed.comm@gmail.com', phone: '+61295551010', website: 'https://murugesanconstructions.com.au', description: 'Residential and commercial construction firm with 20 years of experience in custom home builds and large-scale project management across New South Wales.', looking: ['client', 'partner'], women: false, convention: false },
]

function randomTestBusiness() {
  return TEST_BUSINESSES[Math.floor(Math.random() * TEST_BUSINESSES.length)]
}

export default function AddBusinessStandalone() {
  const { getToken } = useRecaptcha()
  const { user } = useAuth()
  const [form, setForm] = useState({
    businessName: '', nameTamil: '', contactName: '', category: '',
    founded: '', employeeCount: '', registrationNo: '', region: '', city: '',
    country: '', address: '', timezone: '', businessHours: '',
    email: '', phone: '', website: '', linkedin: '', description: '',
  })
  const [services, setServices] = useState<string[]>([])
  const [serviceInput, setServiceInput] = useState('')
  const [looking, setLooking] = useState<string[]>([])
  const [women, setWomen] = useState(false)
  const [convention, setConvention] = useState(false)
  const [consent, setConsent] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newDocId, setNewDocId] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fillTestData = () => {
    const t = randomTestBusiness()
    setForm(f => ({ ...f, businessName: t.businessName, nameTamil: t.nameTamil, contactName: t.contactName, category: t.category, city: t.city, region: t.region, email: t.email, phone: t.phone, website: t.website, description: t.description }))
    setLooking(t.looking)
    setWomen(t.women)
    setConvention(t.convention)
    setConsent(true)
    setTouched({})
  }

  const errors = validate(form)
  const set = (f2: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [f2]: e.target.value }))
  const markTouched = (f2: string) => () => setTouched(t => ({ ...t, [f2]: true }))
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
  const cls = (f2: string) => `bizform-input${showErr(f2) ? ' err' : ''}`

  const handleSubmit = async () => {
    const allTouched = Object.fromEntries(requiredFields.map(f => [f, true]))
    setTouched(t => ({ ...t, ...allTouched }))
    if (Object.keys(errors).length > 0) return
    if (!consent) {
      setSubmitError('Please agree to the Terms of Use and Privacy Policy to continue.')
      return
    }
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
      setSubmitError('Form submissions are disabled on preview deployments.')
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      // Verify reCAPTCHA before writing to Firestore
      const captchaToken = await getToken('submit_business')
      const captchaRes = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      })
      if (!captchaRes.ok) {
        throw new Error('Security check failed. Please try again.')
      }

      const submissionId = crypto.randomUUID()

      let logoUrls: string[] = []
      if (files.length > 0) {
        setUploadProgress(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}…`)
        logoUrls = await Promise.all(files.map(f => uploadFile(f, submissionId)))
        setUploadProgress(null)
      }

      const speakerInB2B = looking.includes('speaker')
      const lookingWithoutSpeaker = looking.filter(v => v !== 'speaker')

      const res = await fetch('/api/submit-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName.trim(),
          nameTamil: form.nameTamil.trim(),
          contactName: form.contactName.trim(),
          category: form.category,
          founded: form.founded.trim(),
          registrationNo: form.registrationNo.trim(),
          region: form.region,
          city: form.city.trim(),
          country: form.country,
          address: form.address.trim(),
          timezone: form.timezone,
          businessHours: form.businessHours.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          website: form.website.trim(),
          linkedin: form.linkedin.trim(),
          description: form.description.trim(),
          services,
          employeeCount: form.employeeCount,
          looking: lookingWithoutSpeaker,
          speaker: speakerInB2B,
          women,
          convention,
          logoUrls,
          consentGiven: true,
          consentAt: new Date().toISOString(),
          ...(user && { submittedByUid: user.uid, submittedByEmail: user.email }),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 409) throw new Error('A listing with this email already exists.')
        console.error('submit-business failed', res.status, data)
        throw new Error('Something went wrong. Please try again.')
      }
      const data = await res.json()
      setNewDocId(data.id ?? '')
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setSubmitError(
        msg.startsWith('Security check') || msg.startsWith('A listing with')
          ? msg
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setSubmitting(false)
      setUploadProgress(null)
    }
  }

  if (success) {
    return (
      <div className="bizform-success">
        <div className="bizform-success-check"><i className="ti ti-check" aria-hidden="true" /></div>
        <div className="bizform-success-kicker">Submitted for review</div>
        <h2 className="bizform-success-title">{form.businessName} is pending approval.</h2>
        <p className="bizform-success-text">
          Check your email for a verification link to activate your listing instantly. If you prefer, our team can also approve it manually within 5 business days.
        </p>
        <div className="bizform-success-actions">
          <a href={newDocId ? `/directory/${newDocId}` : '/directory'} className="bizform-btn-gold">
            View My Listing
          </a>
          <a href="/directory" className="bizform-btn-ghost">
            Browse Directory
          </a>
        </div>
      </div>
    )
  }

  const descNear = form.description.length > DESCRIPTION_MAX * 0.9

  return (
    <div>
      <a href="/directory" className="bizform-back">
        <i className="ti ti-arrow-left" aria-hidden="true" /> Back to Directory
      </a>

      <div className="bizform">
        {submitError && <div className="bizform-error-banner">{submitError}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button type="button" onClick={fillTestData}
            style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--gold)', border: '1px dashed rgba(201,168,76,0.4)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
            ⚡ Fill test data
          </button>
        </div>

        <F label="Business Name" required>
          <input className={cls('businessName')} placeholder="e.g. Kumaran Software Labs"
            value={form.businessName} onChange={set('businessName')} onBlur={markTouched('businessName')} />
          {showErr('businessName') && <Err>{errors.businessName}</Err>}
        </F>

        <F label="Business Name in Tamil" hint="optional">
          <input className="bizform-input" placeholder="e.g. குமரன்"
            value={form.nameTamil} onChange={set('nameTamil')} />
        </F>

        <div className="bizform-row">
          <F label="City" required>
            <input className={cls('city')} placeholder="e.g. Edison, NJ"
              value={form.city} onChange={set('city')} onBlur={markTouched('city')} />
            {showErr('city') && <Err>{errors.city}</Err>}
          </F>
          <F label="Founded" hint="optional">
            <input className="bizform-input" type="number" min={1900} max={new Date().getFullYear()}
              placeholder="Year" value={form.founded} onChange={set('founded')} />
          </F>
        </div>

        <div className="bizform-row">
          <F label="Employee Count" hint="optional">
            <select className="bizform-input" value={form.employeeCount} onChange={set('employeeCount')}>
              <option value="" style={OPT_BG}>Select...</option>
              <option value="solo" style={OPT_BG}>Solo / Freelancer</option>
              <option value="2-10" style={OPT_BG}>2–10</option>
              <option value="11-50" style={OPT_BG}>11–50</option>
              <option value="51-200" style={OPT_BG}>51–200</option>
              <option value="200+" style={OPT_BG}>200+</option>
            </select>
          </F>
          <div />
        </div>

        <F label="Primary Sector" required>
          <select className={cls('category')} value={form.category}
            onChange={set('category')} onBlur={markTouched('category')}>
            <option value="" style={OPT_BG}>Select...</option>
            {CATEGORIES.map(c => <option key={c} value={c} style={OPT_BG}>{c}</option>)}
          </select>
          {showErr('category') && <Err>{errors.category}</Err>}
        </F>

        <div className="bizform-row">
          <F label="Country" hint="optional">
            <select className="bizform-input" value={form.country} onChange={set('country')}>
              <option value="" style={OPT_BG}>Select...</option>
              {COUNTRIES.map(c => <option key={c} value={c} style={OPT_BG}>{c}</option>)}
            </select>
          </F>
          <F label="Region" hint="optional">
            <select className="bizform-input" value={form.region} onChange={set('region')}>
              <option value="" style={OPT_BG}>Select...</option>
              <optgroup label="USA">{REGIONS_USA.map(r => <option key={r} value={r} style={OPT_BG}>{r}</option>)}</optgroup>
              <optgroup label="Canada">{REGIONS_CA.map(r => <option key={r} value={r} style={OPT_BG}>{r}</option>)}</optgroup>
              <optgroup label="India">{REGIONS_IN.map(r => <option key={r} value={r} style={OPT_BG}>{r}</option>)}</optgroup>
              <optgroup label="International">{REGIONS_INTL.map(r => <option key={r} value={r} style={OPT_BG}>{r}</option>)}</optgroup>
            </select>
          </F>
        </div>

        <div className="bizform-row">
          <F label="Street Address" hint="optional — shown on map">
            <input className="bizform-input" placeholder="e.g. 123 Main St"
              value={form.address} onChange={set('address')} />
          </F>
          <F label="Registration No." hint="optional — for verification">
            <input className="bizform-input" placeholder="e.g. LLC-12345"
              value={form.registrationNo} onChange={set('registrationNo')} />
          </F>
        </div>

        <F label="Primary Contact Name" required>
          <input className={cls('contactName')} placeholder="Owner or community lead"
            value={form.contactName} onChange={set('contactName')} onBlur={markTouched('contactName')} />
          {showErr('contactName') && <Err>{errors.contactName}</Err>}
        </F>

        <div className="bizform-row">
          <F label="Work Email" required>
            <input className={cls('email')} type="email" placeholder="name@business.com"
              value={form.email} onChange={set('email')} onBlur={markTouched('email')} />
            {showErr('email') && <Err>{errors.email}</Err>}
          </F>
          <F label="Phone / WhatsApp" hint="optional">
            <input className="bizform-input" type="tel" placeholder="+1 212 ..."
              value={form.phone} onChange={set('phone')} />
          </F>
        </div>

        <F label="Website" hint="optional">
          <input className="bizform-input" type="url" placeholder="https://yoursite.com"
            value={form.website} onChange={set('website')} />
        </F>

        <F label="LinkedIn URL" hint="optional">
          <input className="bizform-input" type="url" placeholder="https://linkedin.com/company/…"
            value={form.linkedin} onChange={set('linkedin')} />
        </F>

        <div className="bizform-row">
          <F label="Business Hours" hint="optional">
            <input className="bizform-input" placeholder="e.g. Mon–Fri 9am–6pm"
              value={form.businessHours} onChange={set('businessHours')} />
          </F>
          <F label="Timezone" hint="optional">
            <select className="bizform-input" value={form.timezone} onChange={set('timezone')}>
              <option value="" style={OPT_BG}>Select...</option>
              {TIMEZONES.map(tz => <option key={tz} value={tz} style={OPT_BG}>{tz}</option>)}
            </select>
          </F>
        </div>

        <F label="Business Summary" required>
          <textarea className={cls('description')} rows={5} maxLength={DESCRIPTION_MAX}
            placeholder="Describe what your business does and who it serves in the Tamil community."
            value={form.description} onChange={set('description')} onBlur={markTouched('description')} />
          <div className="bizform-counter-row">
            {showErr('description') ? <Err>{errors.description}</Err> : <span />}
            <span className={`bizform-counter${descNear ? ' near' : ''}`}>
              {form.description.length} / {DESCRIPTION_MAX}
            </span>
          </div>
        </F>

        <F label="Services" hint={`optional — up to 5, press Enter to add`}>
          <div className="bizform-tag-input">
            {services.length > 0 && (
              <div className="bizform-tags">
                {services.map(s => (
                  <span key={s} className="bizform-tag">
                    {s}
                    <button type="button" className="bizform-tag-x" onClick={() => setServices(prev => prev.filter(x => x !== s))} aria-label={`Remove ${s}`}>
                      <i className="ti ti-x" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {services.length < 5 && (
              <input
                className="bizform-tag-input-field"
                placeholder="Add a service…"
                value={serviceInput}
                onChange={e => setServiceInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = serviceInput.trim()
                    if (val && !services.includes(val)) setServices(prev => [...prev, val])
                    setServiceInput('')
                  }
                }}
              />
            )}
          </div>
        </F>

        <F label="B2B Signals" hint="what are you looking for?">
          <div className="bizform-chips">
            {B2B_OPTIONS.map(o => (
              <label key={o.value} className={`bizform-chip${looking.includes(o.value) ? ' on' : ''}`}>
                <input type="checkbox" checked={looking.includes(o.value)}
                  onChange={() => toggleLooking(o.value)} />
                {o.label}
              </label>
            ))}
          </div>
        </F>

        <F label="Community" hint="optional">
          <div className="bizform-checks">
            {[
              { state: women, setState: setWomen, label: 'Women-Led Business' },
              { state: convention, setState: setConvention, label: 'FeTNA Convention Participant' },
            ].map(o => (
              <label key={o.label} className="bizform-check">
                <input type="checkbox" checked={o.state} onChange={e => o.setState(e.target.checked)} />
                {o.label}
              </label>
            ))}
          </div>
        </F>

        <F label="Logo & Documentation" hint="optional">
          <div
            className={`bizform-drop${dragOver ? ' over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" multiple accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.docx"
              style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
            <p className="bizform-drop-text">
              Drop your logo, brand assets, or business registration here.
              <br />
              <span className="bizform-drop-hint">PNG, PDF, or DOCX · Up to 25 MB · Uploaded to secure storage</span>
            </p>
          </div>

          {files.length > 0 && (
            <div className="bizform-files">
              {files.map(f => (
                <div key={f.name} className="bizform-file">
                  <span className="bizform-file-name">
                    {f.name} <span className="bizform-file-size">({(f.size / 1024).toFixed(0)} KB)</span>
                  </span>
                  <button onClick={e => { e.stopPropagation(); setFiles(prev => prev.filter(x => x.name !== f.name)) }}
                    className="bizform-file-remove" aria-label="Remove file">
                    <i className="ti ti-x" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </F>

        <label className="bizform-check" style={{ marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.5, alignItems: 'flex-start' }}>
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
          <span>
            I agree to the{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Use</a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            , and consent to my business information being publicly displayed in the FiTEN directory. *
          </span>
        </label>

        <button className="bizform-submit" onClick={handleSubmit} disabled={submitting}>
          {uploadProgress ?? (submitting ? 'Submitting…' : 'Submit Business Listing')}
        </button>
      </div>
    </div>
  )
}

function F({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="bizform-field">
      <label className="bizform-label">
        {label}
        {required && <span className="req">*</span>}
        {hint && <span className="hint">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

function Err({ children }: { children: React.ReactNode }) {
  return <p className="bizform-err">{children}</p>
}
