import type { Metadata } from 'next'
import AddBusinessStandalone from './AddBusinessStandalone'

export const metadata: Metadata = {
  title: 'Add Your Business | FiTEN Directory',
  description: 'List your Tamil-owned business on the FiTEN Business Directory. Free listing, live immediately.',
}

export default function FormPage() {
  return <AddBusinessStandalone />
}
