import { useEffect, useRef, type ChangeEvent } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon } from '@/shared/ui/Icon'

type AvatarInputProps = {
  value?: File
  onChange: (file?: File) => void
  error?: string
}

export function AvatarInput({ value, onChange, error }: AvatarInputProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const showPreview = value !== undefined && !error

  // The object URL is created and revoked by the same effect, so a render that React discards
  // cannot leave one behind.
  useEffect(() => {
    const image = imageRef.current
    if (!value || !image) return
    const url = URL.createObjectURL(value)
    image.src = url
    return () => URL.revokeObjectURL(url)
  }, [value, showPreview])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0])
    // Allows picking the same file again after fixing an error.
    event.target.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex w-fit cursor-pointer items-center gap-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg',
            !showPreview &&
              'border-[0.5px] border-dashed border-raised bg-tint-white text-disabled',
          )}
        >
          {showPreview ? (
            <img ref={imageRef} alt="Avatar preview" className="size-full object-cover" />
          ) : (
            <Icon name="upload" />
          )}
        </span>
        <span className="flex flex-col gap-0.75">
          <span className="text-button">Upload avatar (optional)</span>
          <span className="text-body-s text-secondary">JPG, PNG or WEBP</span>
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          aria-invalid={error ? true : undefined}
          className="sr-only"
        />
      </label>
      {error && <p className="text-label-s text-red">{error}</p>}
    </div>
  )
}
