import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendVerificationEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const businessId = typeof body.businessId === 'string' ? body.businessId.trim() : ''
    const businessName = typeof body.businessName === 'string' ? body.businessName.trim() : ''
    const submittedByUid = typeof body.submittedByUid === 'string' ? body.submittedByUid : null
    const submittedByEmail = typeof body.submittedByEmail === 'string' ? body.submittedByEmail : null

    if (!email || !businessId || !businessName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const token = randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    await adminDb.collection('claims').add({
      email,
      businessId,
      businessName,
      status: 'pending',
      verificationToken: token,
      verificationExpiry: expiry,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      ...(submittedByUid && { submittedBy: { uid: submittedByUid, email: submittedByEmail } }),
    })

    sendVerificationEmail(email, businessName, token).catch(err =>
      console.error('Claim verification email failed:', err)
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('submit-claim error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
