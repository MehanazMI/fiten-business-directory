import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit, getIp } from '@/lib/rate-limit'
import { sanitizeString } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(getIp(req), { limit: 3, windowMs: 60_000 })
  if (!allowed) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const businessId = sanitizeString(body.businessId)
  const businessName = sanitizeString(body.businessName)
  const reason = sanitizeString(body.reason)

  if (!businessId || !reason) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  await adminDb.collection('reports').add({
    businessId,
    businessName,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ip: getIp(req),
  })

  return NextResponse.json({ ok: true })
}
