'use client'

import { useState } from 'react'

interface Props {
  businessName: string | null
  onClose: () => void
}

export default function ClaimModal({ businessName, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!businessName) return null

  const handleSubmit = () => {
    if (!email) return
    setSubmitted(true)
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
            <input
              className="modal-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button className="modal-submit" onClick={handleSubmit}>
              Submit Claim
            </button>
          </>
        )}
      </div>
    </div>
  )
}
