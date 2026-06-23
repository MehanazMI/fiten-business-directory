import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import CreateEventForm from '../CreateEventForm'

export const metadata = {
  title: 'Create Event | FiTEN Business Directory',
}

export default function CreateEventPage() {
  return (
    <>
      <SiteHeader activeLink={'events'} />
      <div className="create-event-page">
        <div className="create-event-header">
          <h1>Post a Community Event</h1>
          <p>Share your upcoming webinar, conference, workshop, or networking event with the community</p>
        </div>

        <div className="create-event-container">
          <div className="create-event-form">
            <CreateEventForm
              businessId="sample-biz-id"
              businessName="Your Business"
            />
          </div>

          <aside className="create-event-sidebar">
            <div className="info-box">
              <h3>Event Guidelines</h3>
              <ul>
                <li>Be clear about what your event is about</li>
                <li>Include accurate date, time, and location</li>
                <li>Provide a registration link or contact information</li>
                <li>Add speaker names if applicable</li>
                <li>Include event capacity if limited</li>
              </ul>
            </div>

            <div className="info-box">
              <h3>Event Types</h3>
              <p>Choose from webinars, meetups, conferences, workshops, panels, networking events, training sessions, or other event types.</p>
            </div>
          </aside>
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
