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
  rating: number
  reviews: number
  views: number
  createdAt: string
  verified: boolean
  verificationStatus: 'auto' | 'pending' | 'unverified'
  // Derived at read time
  initials: string
  colorIdx: number
}
