import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token || token.length !== 64) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 })
  }

  const snap = await adminDb
    .collection('businesses')
    .where('verificationToken', '==', token)
    .limit(1)
    .get()

  if (snap.empty) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const docRef = snap.docs[0].ref
  const data = snap.docs[0].data()

  if (data.emailVerified) {
    return NextResponse.json({ status: 'already_verified', businessName: data.businessName })
  }

  if (data.verificationExpiry && new Date(data.verificationExpiry) < new Date()) {
    return NextResponse.json({ error: 'expired', businessName: data.businessName }, { status: 410 })
  }

  // Mark verified and activate
  const update: Record<string, unknown> = {
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
    verificationToken: null,
    verificationExpiry: null,
    status: 'active',
  }

  // Upgrade to domainVerified if business email + domain match
  if (data.businessEmail && data.domainMatch) {
    update.domainVerified = true
  }

  await docRef.update(update)

  return NextResponse.json({
    status: 'verified',
    businessName: data.businessName,
    id: snap.docs[0].id,
    domainVerified: !!(data.businessEmail && data.domainMatch),
  })
}
