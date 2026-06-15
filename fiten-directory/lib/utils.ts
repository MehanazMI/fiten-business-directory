export const colors = [
  '#E6F1FB','#EAF3DE','#FAEEDA','#EEEDFE',
  '#E1F5EE','#FAECE7','#F1EFE8','#FBEAF0',
]

export const textColors = [
  '#0C447C','#27500A','#633806','#3C3489',
  '#085041','#712B13','#444','#72243E',
]

export function stableColorIdx(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff
  return h % colors.length
}

export const categoryMap: Record<string, string> = {
  'Food & Beverage': 'Food',
  'Retail': 'Retail',
  'Technology': 'Tech',
  'Healthcare': 'Healthcare',
  'Finance': 'Finance',
  'Finance & Insurance': 'Finance',
  'Education': 'Education',
  'Real Estate': 'Real Estate',
  'Services': 'Services',
  'Entertainment': 'Entertainment',
  'Legal': 'Legal',
  'Other': 'Other',
}

export const oppLabels: Record<string, string> = {
  partner: 'Partner',
  client: 'Seeking Clients',
  invest: 'Seeking Investment',
  hire: 'Hiring',
}

export const oppTooltips: Record<string, string> = {
  partner: 'Looking to co-found, joint-venture, or collaborate with another business',
  hire: 'Actively recruiting — open to job seekers and contractors',
  invest: 'Seeking investors, funding, or financial backers',
  client: 'Looking to grow their customer base — open to new business inquiries',
}

export const sigClass: Record<string, string> = {
  partner: 'sig-partner',
  client: 'sig-client',
  invest: 'sig-invest',
  hire: 'sig-hire',
}

export const i18n = {
  en: {
    heroTitle: 'Connect with <em>Tamil Businesses</em> Worldwide',
    heroSub: 'Partners · Clients · Talent · Investment',
    searchPlaceholder: 'Search businesses, keywords...',
    searchBtn: 'Search',
  },
  ta: {
    heroTitle: '<em>தமிழ் வணிகங்களுடன்</em> இணையுங்கள்',
    heroSub: 'உலகளாவிய தமிழ் வணிக சமூகத்தில் கண்டறியுங்கள்',
    searchPlaceholder: 'வணிகங்களைத் தேடுங்கள்...',
    searchBtn: 'தேடு',
  },
} as const

export type Lang = keyof typeof i18n
