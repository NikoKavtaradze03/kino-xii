import type { Language, Movie } from '@/shared/api/types'

/** "Thriller · 102 min", the subtitle under every card title. */
export const genreAndRuntime = (movie: Movie) =>
  [movie.genres[0]?.name, `${movie.runtimeMinutes} min`].filter(Boolean).join(' · ')

export const moviePath = (movie: Pick<Movie, 'slug'>) => `/movies/${movie.slug}`

// Figma's session tiles only have room for a short code; the API has full names only.
const LANGUAGE_CODES: Record<string, string> = {
  'georgian-dub': 'GEO DUB',
  'georgian-subtitles': 'GEO SUB',
  'original-subtitles': 'ORIG SUB',
  'russian-dub': 'RUS DUB',
}

export const languageCode = (language: Language) => LANGUAGE_CODES[language.slug] ?? language.name
