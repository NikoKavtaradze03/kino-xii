import { useParams } from 'react-router'
import { MovieDetails } from '@/features/catalogue/components/MovieDetails'

export function MoviePage() {
  const { slug = '' } = useParams()
  // The key starts a fresh page (selected day, scroll) when moving from one film to another.
  return <MovieDetails key={slug} slug={slug} />
}
