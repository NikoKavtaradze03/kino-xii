import type { Movie } from '@/shared/api/types'

/** DOM id of a result row, used by the input's aria-activedescendant. */
export const optionId = (movie: Movie) => `search-option-${movie.id}`
