import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendVerificationEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

// Firebase public keys for JWT verification — avoids firebase-admin/auth → jwks-rsa → jose ESM crash
const FIREBASE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'

async function verifyAdminToken(idToken: string): Promise<boolean> {
  const { createRemoteJWKSet, jwtVerify } = await import('jose')
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const JWKS = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL))
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  })
  return payload['admin'] === true
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const idToken = authHeader.replace('Bearer ', '')
  if (!idToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const isAdmin = await verifyAdminToken(idToken)
    if (!isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
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
