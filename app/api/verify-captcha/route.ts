import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Skip real verification on preview deploys — writes are blocked client-side anyway
  if (process.env.VERCEL_ENV === 'preview') {
    return NextResponse.json({ success: true, score: 1 })
  }

  const { allowed } = rateLimit(getIp(req), { limit: 10, windowMs: 60_000 })
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'too_many_requests' }, { status: 429 })
  }

  const { token } = await req.json()

  if (!token) {
    return NextResponse.json({ success: false, error: 'missing_token' }, { status: 400 })
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    console.error('RECAPTCHA_SECRET_KEY is not set')
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 })
  }

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secret}&response=${token}`,
  })

  const data = await res.json()

  // Require score >= 0.5 (0 = bot, 1 = human)
  if (!data.success || data.score < 0.5) {
    return NextResponse.json({ success: false, error: 'bot_detected', score: data.score }, { status: 403 })
  }

  return NextResponse.json({ success: true, score: data.score })
}
