'use client'

import { useState, useEffect } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase-client'
import { useAuth } from '@/lib/auth-context'
import type { Business } from '@/types/business'

const CATEGORIES = [
  'Technology', 'Healthcare', 'Finance & Insurance', 'Food & Beverage',
  'Retail', 'Real Estate', 'Education', 'Services', 'Legal', 'Entertainment', 'Other',
]

const B2B_OPTIONS = [
  { value: 'partner', label: 'Seeking Business Partners' },
  { value: 'hire', label: 'Hiring' },
  { value: 'invest', label: 'Seeking Investment' },
  { value: 'client', label: 'Seeking Clients' },
]

export default function DashboardClient() {
  const { user, loading } = useAuth()
  const [business, setBusiness] = useState<Business | null>(null)
  const [fetching, setFetching] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ description: '', website: '', phone: '', category: '' })
  const [looking, setLooking] = useState<string[]>([])
  const [women, setWomen] = useState(false)
  const [speaker, setSpeaker] = useState(false)

  useEffect(() => {
    if (!user) return
    setFetching(true)
    const q = query(collection(db, 'businesses'), where('email', '==', user.email))
    getDocs(q).then(snap => {
      if (!snap.empty) {
        const d = snap.docs[0]
        const data = d.data() as Omit<Business, 'id'>
        const biz: Business = { id: d.id, ...data }
        setBusiness(biz)
        setForm({
          description: data.description ?? '',
          website: (data as Record<string, string>).website ?? '',
          phone: data.phone ?? '',
          category: data.category ?? '',
        })
        setLooking(data.looking ?? [])
        setWomen(data.women ?? false)
        setSpeaker(data.speaker ?? false)
      }
      setFetching(false)
    }).catch(() => setFetching(false))
  }, [user])

  async function handleSave() {
    if (!business) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'businesses', business.id), {
        description: form.description,
        website: form.website,
        phone: form.phone,
        category: form.category,
        looking,
        women,
        speaker,
      })
      setBusiness(prev => prev ? { ...prev, ...form, looking, women, speaker } : prev)
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // update failed — user may not own this listing
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  if (!user) {
    return (
      <div className="dashboard-gate">
        <div className="dashboard-gate-inner">
          <i className="ti ti-user-circle" aria-hidden="true" style={{ fontSize: '3rem', opacity: .3 }} />
          <h2>Sign in to manage your listing</h2>
          <p>Use the same Google account whose email matches your FiTEN business listing.</p>
          <button className="auth-signin-btn auth-signin-btn-lg" onClick={() => signInWithPopup(auth, googleProvider)}>
            <i className="ti ti-brand-google" aria-hidden="true" />
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>My Dashboard</h1>
          <p className="dashboard-sub">Signed in as <strong>{user.email}</strong></p>
        </div>
        <button className="auth-signout-btn auth-signout-btn-text" onClick={() => signOut(auth)}>
          <i className="ti ti-logout" aria-hidden="true" /> Sign out
        </button>
      </div>

      {fetching && <div className="dashboard-loading">Loading your listing…</div>}

      {!fetching && !business && (
        <div className="dashboard-no-listing">
          <i className="ti ti-building-store" aria-hidden="true" style={{ fontSize: '2.5rem', opacity: .3 }} />
          <p>No listing found for <strong>{user.email}</strong>.</p>
          <a href="/form" className="hdr-btn" style={{ display: 'inline-block', marginTop: '1rem' }}>Add Your Business</a>
        </div>
      )}

      {business && (
        <div className="dashboard-listing">
          <div className="dashboard-listing-header">
            <div>
              <h2>{business.businessName}</h2>
              <span className={`dashboard-status dashboard-status-${business.status}`}>
                {business.status === 'active' ? 'Live' : business.status === 'pending' ? 'Pending Review' : business.status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {saved && <span className="dashboard-saved">Saved ✓</span>}
              {!editing
                ? <button className="dashboard-edit-btn" onClick={() => setEditing(true)}>Edit Listing</button>
                : <>
                    <button className="dashboard-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="dashboard-save-btn" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </>
              }
            </div>
          </div>

          {editing ? (
            <div className="dashboard-form">
              <label className="dashboard-field">
                <span>Category</span>
                <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="dashboard-field">
                <span>Description</span>
                <textarea className="form-input" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </label>
              <label className="dashboard-field">
                <span>Website</span>
                <input className="form-input" type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://" />
              </label>
              <label className="dashboard-field">
                <span>Phone</span>
                <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </label>
              <div className="dashboard-field">
                <span>B2B Signals</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {B2B_OPTIONS.map(o => (
                    <label key={o.value} className="dashboard-check">
                      <input type="checkbox" checked={looking.includes(o.value)}
                        onChange={e => setLooking(l => e.target.checked ? [...l, o.value] : l.filter(x => x !== o.value))} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="dashboard-field">
                <span>Community</span>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <label className="dashboard-check"><input type="checkbox" checked={women} onChange={e => setWomen(e.target.checked)} /> Women-Led</label>
                  <label className="dashboard-check"><input type="checkbox" checked={speaker} onChange={e => setSpeaker(e.target.checked)} /> Open to Speak</label>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-listing-view">
              <p className="dashboard-desc">{business.description || <em style={{ opacity: .5 }}>No description</em>}</p>
              <div className="dashboard-meta-row">
                <span><i className="ti ti-tag" /> {business.category}</span>
                {business.phone && <span><i className="ti ti-phone" /> {business.phone}</span>}
                {(business as Record<string, unknown>).website && (
                  <a href={String((business as Record<string, unknown>).website)} target="_blank" rel="noopener noreferrer">
                    <i className="ti ti-world" /> Website
                  </a>
                )}
              </div>
              {business.looking?.length > 0 && (
                <div className="dashboard-signals">
                  {business.looking.map(l => <span key={l} className="sig-badge">{l}</span>)}
                </div>
              )}
              <div style={{ marginTop: '1rem' }}>
                <a href={`/directory/${business.id}`} className="dashboard-view-link">View public listing →</a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
