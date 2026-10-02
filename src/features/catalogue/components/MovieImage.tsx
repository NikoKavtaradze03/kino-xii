import { cn } from '@/shared/lib/cn'

type MovieImageProps = {
  src: string | null
  className?: string
}

/** Decorative: the title is always shown next to it, so alt text would be read twice. */
export function MovieImage({ src, className }: MovieImageProps) {
  if (!src) return <div aria-hidden className={cn('bg-raised', className)} />
  return <img src={src} alt="" loading="lazy" className={cn('object-cover', className)} />
}
