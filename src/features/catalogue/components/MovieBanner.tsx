import type { MovieDetail } from '@/shared/api/types'
import { Badge } from '@/shared/ui/Badge'
import { AgeBadge } from './AgeBadge'
import { MovieImage } from './MovieImage'

export function MovieBanner({ movie }: { movie: MovieDetail }) {
  return (
    <section className="relative h-141.75 overflow-hidden">
      {/* As in Figma, the backdrop fills a 1728×1063 box starting 89px (5.15% of the width) above the
          banner, blurred under a 20% page-coloured layer. It overhangs 10px at the sides so the blur
          does not fade out at the edges. */}
      <MovieImage
        src={movie.backdropUrl}
        className="absolute top-[-5.15vw] -left-2.5 aspect-[1728/1063] w-[calc(100%+20px)] blur-xs"
      />
      <div className="absolute inset-0 bg-page/20" />

      <div className="absolute bottom-10.25 left-15 flex items-end gap-8.5">
        <MovieImage
          src={movie.posterUrl}
          className="h-93.5 w-72.25 shrink-0 rounded-[14px] shadow-[0_4px_64px_var(--color-shadow)]"
        />

        <div className="flex w-145 flex-col gap-3.75 py-2.25">
          <div>
            <Badge tone="red" className="uppercase">
              {movie.isComingSoon ? 'Coming soon' : 'Now playing'}
            </Badge>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3.75">
              <h1 className="text-display uppercase">{movie.title}</h1>
              <p className="w-140 text-body-m">{movie.synopsis}</p>
            </div>
            <div className="flex flex-wrap items-start gap-1.75">
              <AgeBadge rating={movie.ageRating} size="md" />
              <Badge icon="timer">{movie.runtimeMinutes} Min</Badge>
              {movie.formats.map((format) => (
                <Badge key={format.id}>{format.name}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
