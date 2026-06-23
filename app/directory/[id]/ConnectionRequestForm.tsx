'use client'

import { useState } from 'react'
import type { Connection } from '@/types/connection'
import { postConnection } from '@/lib/firestore-rest'

type OppType = Connection['type']

const OPP_LABELS: Record<OppType, string> = {
  partner: 'Partnership',
  client:  'New Client',
  invest:  'Investment',
  hire:    'Hiring',
}

interface Props {
  businessId: string
  businessName: string
  looking: OppType[]
}

export default function ConnectionRequestForm({ businessId, businessName, looking }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', business: '',
    type: (looking[0] ?? 'client') as OppType,
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || form.message.trim().length < 20) return
    setSubmitting(true)
    setError('')
    try {
      await postConnection({
        fromName: form.name.trim(),
        fromEmail: form.email.trim(),
        fromBusiness: form.business.trim() || undefined,
        toBusinessId: businessId,
        toBusinessName: businessName,
        type: form.type,
        message: form.message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="biz-detail-req-success">
        <i className="ti ti-circle-check" aria-hidden="true" />
        Request sent to <strong>{businessName}</strong>. They will reach out to you directly.
      </div>
    )
  }

  if (!open) {
    return (
      <button className="biz-detail-req-toggle" onClick={() => setOpen(true)}>
        <i className="ti ti-send" aria-hidden="true" /> Send a Connection Request
      </button>
    )
  }

  return (
    <div className="biz-detail-req-form">
      <div className="biz-detail-req-label">Connection request</div>
      <form onSubmit={handleSend}>
        <div className="biz-detail-req-row">
          <input className="biz-detail-req-input" placeholder="Your name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <input className="biz-detail-req-input" type="email" placeholder="Your email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <input className="biz-detail-req-input" placeholder="Your business (optional)" value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))} />
        {looking.length > 1 && (
          <select className="biz-detail-req-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as OppType }))}>
            {looking.map(op => <option key={op} value={op}>{OPP_LABELS[op]}</option>)}
          </select>
        )}
        <textarea
          className="biz-detail-req-input"
          rows={3}
          placeholder={`Message to ${businessName} (min 20 chars) *`}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          required
          minLength={20}
        />
        {error && <div className="biz-detail-req-error">{error}</div>}
        <button className="biz-detail-req-submit" type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : <><i className="ti ti-send" aria-hidden="true" /> Send Request</>}
        </button>
        <button type="button" className="biz-detail-req-cancel" onClick={() => setOpen(false)}>cancel</button>
      </form>
    </div>
  )
}
