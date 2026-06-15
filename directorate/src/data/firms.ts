export interface Firm {
  id: string
  slug: string
  name: string
  sector: string
  location: string
  size: string
  rating: number
  reviewCount: number
  blurb: string
  services: string[]
  languages: string[]
  verified: boolean
  topRated: boolean
  monogram: string
  leadership: { name: string; title: string }[]
  testimonials: { author: string; role: string; text: string }[]
}

export const firms: Firm[] = [
  {
    id: '1', slug: 'sterling-richmond', name: 'Sterling & Richmond LLP', sector: 'Legal', location: 'New York, NY', size: '50–200', rating: 4.9, reviewCount: 83, blurb: 'Nationally recognised corporate litigation and M&A counsel with four decades of landmark case precedents across financial services and technology.', services: ['M&A Advisory', 'Regulatory Compliance', 'IP Litigation', 'Securities Law'], languages: ['English', 'French', 'Spanish'], verified: true, topRated: true, monogram: 'S&R', leadership: [{ name: 'Elizabeth Sterling', title: 'Managing Partner' }, { name: 'Charles Richmond', title: 'Senior Partner' }], testimonials: [{ author: 'David Chen', role: 'CFO, Meridian Capital', text: 'Sterling & Richmond guided our $420M acquisition with exceptional precision and discretion. Indispensable counsel.' }]
  },
  {
    id: '2', slug: 'vantage-strategy-group', name: 'Vantage Strategy Group', sector: 'Consulting', location: 'Chicago, IL', size: '10–49', rating: 4.8, reviewCount: 61, blurb: 'Boutique management consultancy focused on operational transformation and market-entry strategy for mid-market enterprises across North America.', services: ['Market Entry Strategy', 'Operational Transformation', 'Interim CFO', 'Board Advisory'], languages: ['English', 'Mandarin'], verified: true, topRated: true, monogram: 'VSG', leadership: [{ name: 'Sarah Vantage', title: 'Principal' }, { name: 'James Okafor', title: 'Director of Strategy' }], testimonials: [{ author: 'Priya Nair', role: 'CEO, Halcyon Foods', text: 'VSG helped us double revenue in three years. Their clarity of thinking is unmatched in the mid-market space.' }]
  },
  {
    id: '3', slug: 'atlas-capital-advisory', name: 'Atlas Capital Advisory', sector: 'Finance', location: 'San Francisco, CA', size: '10–49', rating: 4.7, reviewCount: 47, blurb: 'Independent financial advisory firm specialising in growth-stage capital raises, structured debt, and founder-led exit transactions in technology and life sciences.', services: ['Venture Debt', 'Series B/C Raises', 'Exit Planning', 'Cap Table Structuring'], languages: ['English', 'German'], verified: true, topRated: false, monogram: 'ACA', leadership: [{ name: 'Marcus Holloway', title: 'Managing Director' }], testimonials: [{ author: 'Anita Rossini', role: 'Founder, Pulsar Health', text: 'Atlas closed our Series C in eleven weeks. Their network and execution were simply first-rate.' }]
  },
  {
    id: '4', slug: 'meridian-tax-partners', name: 'Meridian Tax Partners', sector: 'Accounting', location: 'Boston, MA', size: '50–200', rating: 4.8, reviewCount: 92, blurb: 'Full-service tax advisory and compliance firm with deep expertise in cross-border structuring, R&D credits, and state-level nexus optimisation for multi-entity businesses.', services: ['International Tax', 'R&D Tax Credits', 'Transfer Pricing', 'State Nexus Planning'], languages: ['English', 'Portuguese', 'Spanish'], verified: true, topRated: true, monogram: 'MTP', leadership: [{ name: 'Helen Park', title: 'Tax Partner' }, { name: 'Raj Patel', title: 'International Tax Director' }], testimonials: [{ author: 'Owen Walsh', role: 'COO, Copernicus SaaS', text: 'Meridian recovered $1.2M in R&D credits we had no idea we were entitled to. Rigorous and proactive.' }]
  },
  {
    id: '5', slug: 'northgate-hr-solutions', name: 'Northgate HR Solutions', sector: 'Human Resources', location: 'Austin, TX', size: '10–49', rating: 4.6, reviewCount: 38, blurb: 'HR consultancy delivering executive search, compensation benchmarking, and DEI programme design for scaling technology companies from Series A through IPO.', services: ['Executive Search', 'Compensation Benchmarking', 'DEI Programmes', 'HR Due Diligence'], languages: ['English'], verified: true, topRated: false, monogram: 'NGH', leadership: [{ name: 'Carla Morrow', title: 'CEO' }], testimonials: [{ author: 'Tom Bauer', role: 'VP People, Stratum AI', text: 'Northgate placed our CTO and three VPs in under 90 days. Outstanding network and process discipline.' }]
  },
  {
    id: '6', slug: 'cascade-ip-group', name: 'Cascade IP Group', sector: 'Legal', location: 'Seattle, WA', size: '1–9', rating: 4.9, reviewCount: 29, blurb: 'Specialist intellectual property boutique protecting portfolios for semiconductor, cleantech, and AI companies through prosecution, licensing, and litigation strategy.', services: ['Patent Prosecution', 'IP Licensing', 'Portfolio Strategy', 'Trade Secret Protection'], languages: ['English', 'Japanese', 'Korean'], verified: true, topRated: true, monogram: 'CIP', leadership: [{ name: 'Dr. Yuki Tanaka', title: 'Managing Partner' }], testimonials: [{ author: 'Lars Eriksen', role: 'CTO, Photon Dynamics', text: 'Cascade built and licensed our patent portfolio generating $8M in royalties. Exceptional strategic thinking.' }]
  },
  {
    id: '7', slug: 'pinnacle-risk-advisory', name: 'Pinnacle Risk Advisory', sector: 'Insurance', location: 'Hartford, CT', size: '10–49', rating: 4.5, reviewCount: 22, blurb: 'Independent risk management and insurance advisory for private equity portfolio companies, navigating complex D&O, cyber, and representations & warranties coverage.', services: ['D&O Insurance', 'Cyber Risk Assessment', 'R&W Insurance', 'Claims Advocacy'], languages: ['English', 'French'], verified: false, topRated: false, monogram: 'PRA', leadership: [{ name: 'George Whitfield', title: 'Principal Advisor' }], testimonials: [{ author: 'Nina Castellano', role: 'GP, Summit Equity', text: 'Pinnacle saved us from a catastrophic underinsured D&O claim. Their knowledge of PE-specific risk is unparalleled.' }]
  }
]
