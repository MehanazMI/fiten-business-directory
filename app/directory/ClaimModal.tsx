'use client'

import { useState } from 'react'

interface Props {
  businessName: string | null
  onClose: () => void
}

const FS_URL = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/claims`
  + `?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`

export default function ClaimModal({ businessName, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!businessName) return null

  const handleSubmit = async () => {
    if (!email) return
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
      setError('Form submissions are disabled on preview deployments.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(FS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            businessName: { stringValue: businessName },
            email: { stringValue: email },
            status: { stringValue: 'pending' },
            createdAt: { stringValue: new Date().toISOString() },
          },
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error?.message ?? `HTTP ${res.status}`)
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="detail-overlay open" onClick={onClose}>
      <div className="claim-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {submitted ? (
          <div className="modal-success" style={{ display: 'block' }}>
            <div className="modal-success-mark">✓</div>
            <h4>Claim Submitted</h4>
            <p>We&apos;ll verify your ownership and follow up at {email}.</p>
          </div>
        ) : (
          <>
            <h3>Claim Listing</h3>
            <p>
              Enter your email to claim{' '}
              <span className="claim-biz-name">{businessName}</span>.
              We&apos;ll verify ownership and follow up within 24 hours.
            </p>

            {error && (
              <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.8rem', borderRadius: '0.4rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <input
              className="modal-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button className="modal-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
