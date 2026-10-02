import { Outlet, ScrollRestoration } from 'react-router'
import { AuthModals } from '@/features/auth/components/AuthModals'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function RootLayout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AuthModals />
      <ScrollRestoration />
    </div>
  )
}
