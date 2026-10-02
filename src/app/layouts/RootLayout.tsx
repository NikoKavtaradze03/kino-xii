import { lazy, Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { BookingModal } from '@/features/booking/components/BookingModal'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

// The forms and their validation libraries stay out of the first download.
const AuthModals = lazy(async () => ({
  default: (await import('@/features/auth/components/AuthModals')).AuthModals,
}))

export function RootLayout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BookingModal />
      <Suspense fallback={null}>
        <AuthModals />
      </Suspense>
      <ScrollRestoration />
    </div>
  )
}
