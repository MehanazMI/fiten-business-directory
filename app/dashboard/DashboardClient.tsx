'use client'

import { useState, useEffect } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase-client'
import { useAuth } from '@/lib/auth-context'
import type { Business } from '@/types/business'

type DashBusiness = Business & {
  emailVerified?: boolean
  domainVerified?: boolean
}

const CATEGORIES = [
  'Technology', 'Healthcare', 'Finance & Insurance', 'Food & Beverage',
  'Retail', 'Real Estate', 'Education', 'Services', 'Legal', 'Entertainment', 'Other',
]

const B2B_OPTIONS = [
  { value: 'partner', label: 'Open to Partnerships' },
  { value: 'client',  label: 'Seeking Clients' },
  { value: 'invest',  label: 'Seeking Investment' },
  { value: 'hire',    label: 'Hiring Now' },
  { value: 'mentor',  label: 'Open to Mentoring' },
]

export default function DashboardClient() {
  const { user, loading } = useAuth()
  const [businesses, setBusinesses] = useState<DashBusiness[]>([])
  const [fetching, setFetching] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [form, setForm] = useState({ description: '', website: '', phone: '', category: '' })
  const [looking, setLooking] = useState<string[]>([])
  const [women, setWomen] = useState(false)
  const [speaker, setSpeaker] = useState(false)

  useEffect(() => {
    if (!user) return
    setFetching(true)

    // Query by submittedBy.uid (Google-linked) OR by email match
    Promise.all([
      getDocs(query(collection(db, 'businesses'), where('submittedBy.uid', '==', user.uid))),
      getDocs(query(collection(db, 'businesses'), where('email', '==', user.email))),
    ]).then(([byUid, byEmail]) => {
      const seen = new Set<string>()
      const all: DashBusiness[] = []
      for (const snap of [byUid, byEmail]) {
        snap.docs.forEach(d => {
          if (!seen.has(d.id)) {
            seen.add(d.id)
            all.push({ id: d.id, ...d.data() } as DashBusiness)
          }
        })
      }
      setBusinesses(all)
      setFetching(false)
    }).catch(() => setFetching(false))
  }, [user])

  function startEdit(b: DashBusiness) {
    setEditingId(b.id)
    setForm({ description: b.description ?? '', website: b.website ?? '', phone: b.phone ?? '', category: b.category ?? '' })
    setLooking((b.looking ?? []) as string[])
    setWomen(b.women ?? false)
    setSpeaker(b.speaker ?? false)
  }

  async function handleSave(id: string) {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'businesses', id), { ...form, looking, women, speaker })
      setBusinesses(prev => prev.map(b => b.id === id
        ? { ...b, ...form, looking: looking as Business['looking'], women, speaker }
        : b
      ))
      setSavedId(id)
      setEditingId(null)
      setTimeout(() => setSavedId(null), 3000)
    } catch {
      // Firestore rules may block — listing owner must match
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
          <h2>Sign in to manage your listings</h2>
          <p>Use the Google account you used when submitting your business.</p>
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
          <h1>My Listings</h1>
          <p className="dashboard-sub">Signed in as <strong>{user.email}</strong></p>
        </div>
        <button className="auth-signout-btn auth-signout-btn-text" onClick={() => signOut(auth)}>
          <i className="ti ti-logout" aria-hidden="true" /> Sign out
        </button>
      </div>

      {fetching && <div className="dashboard-loading">Loading your listings…</div>}

      {!fetching && businesses.length === 0 && (
        <div className="dashboard-no-listing">
          <i className="ti ti-building-store" aria-hidden="true" style={{ fontSize: '2.5rem', opacity: .3 }} />
          <p>No listings found for <strong>{user.email}</strong>.</p>
          <a href="/form" className="hdr-btn" style={{ display: 'inline-block', marginTop: '1rem' }}>Add Your Business</a>
        </div>
      )}

      {businesses.map(b => (
        <div key={b.id} className="dashboard-listing">
          <div className="dashboard-listing-header">
            <div>
              <h2>{b.businessName}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem', alignItems: 'center' }}>
                <span className={`dashboard-status dashboard-status-${b.status}`}>
                  {b.status === 'active' ? 'Live' : b.status === 'pending' ? 'Pending Review' : b.status === 'rejected' ? 'Rejected' : b.status}
                </span>
                {b.emailVerified
                  ? <span className="admin-trust-badge verified"><i className="ti ti-circle-check" /> Email verified</span>
                  : <span className="admin-trust-badge unverified"><i className="ti ti-clock" /> Email unverified — check your inbox</span>
                }
                {b.domainVerified && (
                  <span className="admin-trust-badge verified"><i className="ti ti-shield-check" /> Verified domain</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {savedId === b.id && <span className="dashboard-saved">Saved ✓</span>}
              {editingId !== b.id
                ? <button className="dashboard-edit-btn" onClick={() => startEdit(b)}>Edit</button>
                : <>
                    <button className="dashboard-cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    <button className="dashboard-save-btn" onClick={() => handleSave(b.id)} disabled={saving}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </>
              }
            </div>
          </div>

          {editingId === b.id ? (
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
                  <label className="dashboard-check"><input type="checkbox" checked={speaker} onChange={e => setSpeaker(e.target.checked)} /> Available as Speaker</label>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-listing-view">
              <p className="dashboard-desc">{b.description || <em style={{ opacity: .5 }}>No description added yet.</em>}</p>
              <div className="dashboard-meta-row">
                <span><i className="ti ti-tag" /> {b.category}</span>
                {b.phone && <span><i className="ti ti-phone" /> {b.phone}</span>}
                {b.website && <a href={b.website} target="_blank" rel="noopener noreferrer"><i className="ti ti-world" /> Website</a>}
              </div>
              {(b.looking?.length ?? 0) > 0 && (
                <div className="dashboard-signals">
                  {b.looking.map(l => <span key={l} className="sig-badge">{l}</span>)}
                </div>
              )}
              {b.status === 'active' && (
                <div style={{ marginTop: '1rem' }}>
                  <a href={`/directory/${b.id}`} className="dashboard-view-link">View public listing →</a>
                </div>
              )}
              {b.status === 'rejected' && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                  This listing was not approved. <a href="/form" style={{ color: 'var(--gold)' }}>Submit a new listing</a> if you'd like to try again.
                </p>
              )}
            </div>
          )}
        </div>
      ))}

      {!fetching && businesses.length > 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/form" className="dashboard-view-link">+ Add another listing</a>
        </div>
      )}
    </div>
  )
}
