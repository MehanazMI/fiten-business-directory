const FREE_PROVIDERS = new Set([
  'gmail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.in',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'protonmail.com', 'proton.me',
  'zoho.com', 'yandex.com', 'mail.com', 'gmx.com',
])

export function extractEmailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? ''
}

export function extractWebsiteDomain(website: string): string {
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`)
    return url.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

export function isBusinessEmail(email: string): boolean {
  const domain = extractEmailDomain(email)
  return !!domain && !FREE_PROVIDERS.has(domain)
}

export function domainsMatch(email: string, website: string): boolean {
  if (!website) return false
  const emailDomain = extractEmailDomain(email)
  const siteDomain = extractWebsiteDomain(website)
  if (!emailDomain || !siteDomain) return false
  return emailDomain === siteDomain || siteDomain.endsWith(`.${emailDomain}`) || emailDomain.endsWith(`.${siteDomain}`)
}
