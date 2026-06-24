'use client'

import { useState, useEffect } from 'react'
import { signInWithPopup } from 'firebase/auth'
import {
  collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy,
} from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase-client'
import { useAuth } from '@/lib/auth-context'
import type { Business } from '@/types/business'
import type { Event } from '@/types/event'

type Tab = 'pending' | 'listings' | 'events'

type AdminBusiness = Business

type AdminEvent = Event

export default function AdminClient() {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingClaim, setCheckingClaim] = useState(true)
  const [tab, setTab] = useState<Tab>('pending')
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [fetching, setFetching] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)

  // Verify admin custom claim
  useEffect(() => {
    if (!user) { setCheckingClaim(false); return }
    user.getIdTokenResult().then(result => {
      setIsAdmin(result.claims.admin === true)
      setCheckingClaim(false)
    })
  }, [user])

  // Fetch data when tab changes
  useEffect(() => {
    if (!isAdmin) return
    setFetching(true)
    setBusinesses([])
    setEvents([])

    if (tab === 'events') {
      getDocs(query(collection(db, 'events'), orderBy('createdAt', 'desc')))
        .then(snap => {
          setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminEvent)))
          setFetching(false)
        }).catch(() => setFetching(false))
    } else {
      const q = tab === 'pending'
        ? query(collection(db, 'businesses'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'))
        : query(collection(db, 'businesses'), orderBy('createdAt', 'desc'))
      getDocs(q).then(snap => {
        setBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminBusiness)))
        setFetching(false)
      }).catch(() => setFetching(false))
    }
  }, [isAdmin, tab])

  async function approve(id: string) {
    setActionId(id)
    await updateDoc(doc(db, 'businesses', id), { status: 'active' })
    setBusinesses(prev => prev.filter(b => b.id !== id))
    setActionId(null)
  }

  async function reject(id: string) {
    setActionId(id)
    await deleteDoc(doc(db, 'businesses', id))
    setBusinesses(prev => prev.filter(b => b.id !== id))
    setActionId(null)
  }

  async function togglePro(id: string, current: boolean) {
    setActionId(id)
    await updateDoc(doc(db, 'businesses', id), { pro: !current })
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, pro: !current } : b))
    setActionId(null)
  }

  async function deleteEvent(id: string) {
    setActionId(id)
    await deleteDoc(doc(db, 'events', id))
    setEvents(prev => prev.filter(e => e.id !== id))
    setActionId(null)
  }

  async function toggleFeatured(id: string, current: boolean) {
    setActionId(id)
    await updateDoc(doc(db, 'events', id), { featured: !current })
    setEvents(prev => prev.map(e => e.id === id ? { ...e, featured: !current } : e))
    setActionId(null)
  }

  async function toggleStatus(id: string, current: string) {
    setActionId(id)
    const next = current === 'active' ? 'inactive' : 'active'
    await updateDoc(doc(db, 'businesses', id), { status: next })
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status: next } : b))
    setActionId(null)
  }

  if (loading || checkingClaim) return null

  if (!user) {
    return (
      <div className="dashboard-gate">
        <div className="dashboard-gate-inner">
          <i className="ti ti-shield-lock" style={{ fontSize: '3rem', opacity: .3 }} aria-hidden="true" />
          <h2>Admin access required</h2>
          <p>Sign in with your admin Google account to continue.</p>
          <button className="auth-signin-btn auth-signin-btn-lg" onClick={() => signInWithPopup(auth, googleProvider)}>
            <i className="ti ti-brand-google" aria-hidden="true" />
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="dashboard-gate">
        <div className="dashboard-gate-inner">
          <i className="ti ti-lock" style={{ fontSize: '3rem', opacity: .3 }} aria-hidden="true" />
          <h2>Access denied</h2>
          <p><strong>{user.email}</strong> does not have admin privileges.</p>
          <a href="/" className="hdr-btn" style={{ display: 'inline-block', marginTop: '1rem' }}>Go home</a>
        </div>
      </div>
    )
  }

  const pendingCount = tab === 'pending' ? businesses.length : null

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin</h1>
          <p className="dashboard-sub">Signed in as <strong>{user.email}</strong></p>
        </div>
      </div>

      <div className="admin-tabs">
        {(['pending', 'listings', 'events'] as Tab[]).map(t => (
          <button
            key={t}
            className={`admin-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'pending' ? 'Pending Review' : t === 'listings' ? 'All Listings' : 'Events'}
          </button>
        ))}
      </div>

      {fetching && <div className="dashboard-loading">Loading…</div>}

      {!fetching && businesses.length === 0 && tab === 'pending' && (
        <div className="admin-empty">
          <i className="ti ti-circle-check" aria-hidden="true" />
          <p>No pending submissions — you're all caught up.</p>
        </div>
      )}

      {!fetching && tab === 'events' && events.length === 0 && (
        <div className="admin-empty">
          <i className="ti ti-calendar-off" aria-hidden="true" />
          <p>No events found.</p>
        </div>
      )}

      {/* Business / pending list */}
      {!fetching && tab !== 'events' && businesses.length > 0 && (
        <div className="admin-list">
          {tab === 'pending' && (
            <p className="admin-count">{pendingCount} submission{pendingCount !== 1 ? 's' : ''} awaiting review</p>
          )}
          {businesses.map(b => (
            <div key={b.id} className="admin-card">
              <div className="admin-card-main">
                <div className="admin-card-top">
                  <span className="admin-biz-name">{b.businessName}</span>
                  <span className={`dashboard-status dashboard-status-${b.status}`}>
                    {b.status === 'active' ? 'Live' : b.status === 'pending' ? 'Pending' : b.status}
                  </span>
                  {b.pro && <span className="admin-pro-badge">PRO</span>}
                </div>
                <div className="admin-card-meta">
                  <span><i className="ti ti-tag" aria-hidden="true" /> {b.category}</span>
                  <span><i className="ti ti-map-pin" aria-hidden="true" /> {b.city}{b.region ? `, ${b.region}` : ''}</span>
                  <span><i className="ti ti-mail" aria-hidden="true" /> {b.email}</span>
                </div>
                {b.description && <p className="admin-card-desc">{b.description}</p>}
              </div>
              <div className="admin-card-actions">
                {tab === 'pending' ? (
                  <>
                    <button className="admin-btn admin-btn-approve" onClick={() => approve(b.id)} disabled={actionId === b.id}>
                      {actionId === b.id ? '…' : 'Approve'}
                    </button>
                    <button className="admin-btn admin-btn-reject" onClick={() => reject(b.id)} disabled={actionId === b.id}>
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`admin-btn ${b.pro ? 'admin-btn-unpro' : 'admin-btn-pro'}`}
                      onClick={() => togglePro(b.id, b.pro ?? false)}
                      disabled={actionId === b.id}
                    >
                      {actionId === b.id ? '…' : b.pro ? 'Remove PRO' : 'Make PRO'}
                    </button>
                    <button
                      className={`admin-btn ${b.status === 'active' ? 'admin-btn-deactivate' : 'admin-btn-approve'}`}
                      onClick={() => toggleStatus(b.id, b.status)}
                      disabled={actionId === b.id}
                    >
                      {actionId === b.id ? '…' : b.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <a href={`/directory/${b.id}`} className="admin-btn admin-btn-view" target="_blank" rel="noopener noreferrer">View</a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events list */}
      {!fetching && tab === 'events' && events.length > 0 && (
        <div className="admin-list">
          <p className="admin-count">{events.length} event{events.length !== 1 ? 's' : ''}</p>
          {events.map(e => (
            <div key={e.id} className="admin-card">
              <div className="admin-card-main">
                <div className="admin-card-top">
                  <span className="admin-biz-name">{e.title}</span>
                  <span className={`dashboard-status dashboard-status-${e.status === 'upcoming' ? 'active' : 'pending'}`}>
                    {e.status}
                  </span>
                  {e.featured && <span className="admin-pro-badge">⭐ Featured</span>}
                </div>
                <div className="admin-card-meta">
                  <span><i className="ti ti-calendar" aria-hidden="true" /> {e.date}</span>
                  <span><i className="ti ti-tag" aria-hidden="true" /> {e.eventType}</span>
                  <span><i className="ti ti-map-pin" aria-hidden="true" /> {e.location === 'virtual' ? 'Virtual' : e.city || 'In Person'}</span>
                  <span><i className="ti ti-user" aria-hidden="true" /> {e.organizerName}</span>
                </div>
                {e.description && <p className="admin-card-desc">{e.description.slice(0, 120)}{e.description.length > 120 ? '…' : ''}</p>}
              </div>
              <div className="admin-card-actions">
                <button
                  className={`admin-btn ${e.featured ? 'admin-btn-unpro' : 'admin-btn-pro'}`}
                  onClick={() => toggleFeatured(e.id, e.featured ?? false)}
                  disabled={actionId === e.id}
                >
                  {actionId === e.id ? '…' : e.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  className="admin-btn admin-btn-reject"
                  onClick={() => deleteEvent(e.id)}
                  disabled={actionId === e.id}
                >
                  Delete
                </button>
                <a href={`/events/${e.id}`} className="admin-btn admin-btn-view" target="_blank" rel="noopener noreferrer">View</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
