import { createBrowserRouter } from 'react-router'
import { RequireAuth } from '@/features/auth/components/RequireAuth'
import { HomePage } from '@/pages/HomePage'
import { RouteErrorPage } from '@/pages/RouteErrorPage'
import { RootLayout } from './layouts/RootLayout'

// Home ships in the main bundle; the other pages load when first visited.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'sessions',
        lazy: async () => ({ Component: (await import('@/pages/SessionsPage')).SessionsPage }),
      },
      {
        path: 'movies/:slug',
        lazy: async () => ({ Component: (await import('@/pages/MoviePage')).MoviePage }),
      },
      {
        path: 'profile',
        lazy: async () => {
          const { ProfilePage } = await import('@/pages/ProfilePage')
          return {
            element: (
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            ),
          }
        },
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/NotFoundPage')).NotFoundPage }),
      },
    ],
  },
])
