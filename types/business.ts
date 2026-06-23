export interface Business {
  id: string
  businessName: string
  nameTamil?: string
  category: string
  city: string
  region: string
  description: string
  email: string
  phone?: string
  website?: string
  logoUrl?: string
  founded?: number
  status: string
  pro: boolean
  looking: Array<'partner' | 'client' | 'invest' | 'hire'>
  speaker: boolean
  women: boolean
  convention: boolean
  views: number
  createdAt: string
  verified: boolean
  verificationStatus: 'auto' | 'pending' | 'unverified'
  // Phase 2 fields (all optional — backward-compatible)
  services?: string[]
  linkedin?: string
  twitter?: string
  employeeCount?: 'solo' | '2-10' | '11-50' | '51-200' | '200+'
  updatedAt?: string
  featured?: boolean
  // Derived at read time
  initials: string
  colorIdx: number
}
