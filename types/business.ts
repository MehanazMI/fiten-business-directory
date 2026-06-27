export interface Business {
  id: string
  businessName: string
  nameTamil?: string
  category: string
  city: string
  country?: string
  description: string
  email: string
  phone?: string
  website?: string
  logoUrl?: string
  status: string
  pro: boolean
  // B2B signals — what the business is actively looking for
  looking: Array<'partner' | 'client' | 'invest' | 'hire' | 'mentor'>
  // Community badges — what the business is
  women: boolean
  speaker: boolean
  convention: boolean
  nonprofit: boolean
  views: number
  createdAt: string
  updatedAt?: string
  verified: boolean
  verificationStatus: 'auto' | 'pending' | 'unverified'
  services?: string[]
  featured?: boolean
  // Derived at read time
  initials: string
  colorIdx: number
}
