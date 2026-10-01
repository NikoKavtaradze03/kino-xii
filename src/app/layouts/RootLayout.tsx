import { Outlet, ScrollRestoration } from 'react-router'
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
      <ScrollRestoration />
    </div>
  )
}
