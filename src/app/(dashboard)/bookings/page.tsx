import { BookingCalendar } from '@/features/bookings/components/booking-calendar'

export const metadata = {
  title: 'Resource Bookings | AssetFlow Enterprise',
  description: 'Manage shared resources and conference rooms',
}

export default function BookingsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-6">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Resource Bookings</h1>
          <p className="text-sm text-zinc-500 mt-1">Schedule and manage shared assets, conference rooms, and vehicles.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <BookingCalendar />
      </div>
    </div>
  )
}
