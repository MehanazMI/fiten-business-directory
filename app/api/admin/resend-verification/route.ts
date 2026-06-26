import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { sendVerificationEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  // Verify admin claim via Bearer token
  const authHeader = req.headers.get('authorization') ?? ''
  const idToken = authHeader.replace('Bearer ', '')
  if (!idToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    if (!decoded.admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { id } = await req.json().catch(() => ({ id: null }))
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 })

  const docRef = adminDb.collection('businesses').doc(id)
  const snap = await docRef.get()
  if (!snap.exists) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const data = snap.data()!
  if (data.emailVerified) return NextResponse.json({ error: 'already_verified' }, { status: 409 })

  const verificationToken  = randomBytes(32).toString('hex')
  const verificationExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  await docRef.update({ verificationToken, verificationExpiry })
  await sendVerificationEmail(data.email, data.businessName, verificationToken)

  return NextResponse.json({ success: true })
}
