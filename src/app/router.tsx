import { createBrowserRouter } from 'react-router'
import { HomePage } from '@/pages/HomePage'
import { MoviePage } from '@/pages/MoviePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RouteErrorPage } from '@/pages/RouteErrorPage'
import { SessionsPage } from '@/pages/SessionsPage'
import { RootLayout } from './layouts/RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'movies/:slug', element: <MoviePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
