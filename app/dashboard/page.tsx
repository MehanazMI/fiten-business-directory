import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import DashboardClient from './DashboardClient'

export const metadata = { title: 'My Dashboard | FiTEN Business Directory' }

export default function DashboardPage() {
  return (
    <>
      <SiteHeader activeLink={'directory'} />
      <DashboardClient />
      <SiteFooter />
    </>
  )
}
