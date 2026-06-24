import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import AdminClient from './AdminClient'

export const metadata = { title: 'Admin | FiTEN Business Directory' }

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <AdminClient />
      <SiteFooter />
    </>
  )
}
