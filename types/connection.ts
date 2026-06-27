export interface Connection {
  id?: string
  fromName: string
  fromEmail: string
  fromBusiness?: string
  toBusinessId: string
  toBusinessName: string
  type: 'partner' | 'client' | 'invest' | 'hire' | 'mentor'
  message: string
  status: 'pending'
  createdAt: string
}
