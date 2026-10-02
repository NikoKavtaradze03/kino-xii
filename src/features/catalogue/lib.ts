import type { Movie } from '@/shared/api/types'

/** "Thriller · 102 min", the subtitle under every card title. */
export const genreAndRuntime = (movie: Movie) =>
  [movie.genres[0]?.name, `${movie.runtimeMinutes} min`].filter(Boolean).join(' · ')

export const moviePath = (movie: Pick<Movie, 'slug'>) => `/movies/${movie.slug}`
