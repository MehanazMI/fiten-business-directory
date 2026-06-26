'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

interface Props {
  businessId: string | null
  businessName: string | null
  onClose: () => void
}

export default function ClaimModal({ businessId, businessName, onClose }: Props) {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!businessName || !businessId) return null

  const handleSubmit = async () => {
    if (!email) return
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
      setError('Form submissions are disabled on preview deployments.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          businessId,
          businessName,
          ...(user && { submittedByUid: user.uid, submittedByEmail: user.email }),
        }),
      })
      if (!res.ok) throw new Error('Something went wrong. Please try again.')
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
            <p>Check <strong>{email}</strong> for a verification link. Once verified, our team will review your ownership claim.</p>
          </div>
        ) : (
          <>
            <h3>Claim Listing</h3>
            <p>
              Enter the email address associated with{' '}
              <span className="claim-biz-name">{businessName}</span>.
              We&apos;ll send a verification link to confirm your ownership.
            </p>

            {error && (
              <div style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--cream)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 1rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
                {error}
              </div>
            )}

            <input
              className="modal-input"
              type="email"
              placeholder="your@businessemail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button className="modal-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Send Verification Email'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
