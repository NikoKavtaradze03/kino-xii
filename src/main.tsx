import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { queryClient } from '@/app/queryClient'
import { filterOptionsQuery } from '@/shared/api/filterOptions'
import '@fontsource-variable/archivo'
import '@/styles/globals.css'

void queryClient.prefetchQuery(filterOptionsQuery)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
