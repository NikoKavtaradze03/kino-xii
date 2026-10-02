import type { MovieDetail } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/format'
import { NoteBox } from './NoteBox'

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1.75">
      <dt className="text-label-s text-secondary uppercase">{label}</dt>
      <dd className="text-label-m">{value}</dd>
    </div>
  )
}

export function MovieDetailsPanel({ movie }: { movie: MovieDetail }) {
  const join = (items: { name: string }[]) => items.map((item) => item.name).join(', ')

  return (
    <aside className="flex w-110.25 shrink-0 flex-col gap-4.25 px-6.5">
      <h2 className="text-h2">Details</h2>
      <dl className="flex flex-col gap-4.25">
        <DetailRow label="Director" value={movie.director} />
        <DetailRow label="Main cast" value={movie.cast} />
        <DetailRow label="Genre" value={join(movie.genres)} />
        <DetailRow label="Duration" value={`${movie.runtimeMinutes} minutes`} />
        <DetailRow label="Release date" value={formatDate(movie.releaseDate, 'd MMMM yyyy')} />
        <DetailRow label="Formats" value={join(movie.formats)} />
        <DetailRow label="From" value={`₾${movie.fromPrice}`} />
      </dl>
      <NoteBox>
        <p className="text-label-s uppercase">Rating note</p>
        <p className="flex gap-1.75">
          <span className="shrink-0 text-label-s">{movie.ageRating.code}</span>
          <span className="text-body-s">{movie.ageRating.description}</span>
        </p>
      </NoteBox>
    </aside>
  )
}
