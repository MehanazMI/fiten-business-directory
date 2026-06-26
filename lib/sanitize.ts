const TAG_RE = /<[^>]*>/g
const MULTI_SPACE_RE = /\s{2,}/g

export function sanitizeString(val: unknown): string {
  if (typeof val !== 'string') return ''
  return val.replace(TAG_RE, '').replace(MULTI_SPACE_RE, ' ').trim()
}

export function sanitizeUrl(val: unknown): string {
  if (typeof val !== 'string') return ''
  const trimmed = val.trim()
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return ''
    return url.toString()
  } catch {
    return ''
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(val: string): boolean {
  return EMAIL_RE.test(val) && val.length <= 254
}
