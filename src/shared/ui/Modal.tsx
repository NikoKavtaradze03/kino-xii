import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon } from './Icon'

type ModalFrameProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Padding, gap, border and width; the frame only sets position, shape and colour. */
  className: string
  hasDescription?: boolean
  children: ReactNode
}

/** Backdrop and centred panel. Children must render a `Dialog.Title`. */
export function ModalFrame({
  open,
  onOpenChange,
  className,
  hasDescription = false,
  children,
}: ModalFrameProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Figma: #101010 at 30 % with background blur 10, which renders like CSS blur(4px). */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[#101010]/30 backdrop-blur-xs" />
        <Dialog.Content
          {...(!hasDescription && { 'aria-describedby': undefined })}
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-2rem)] -translate-1/2 flex-col overflow-y-auto',
            'rounded-[28px] bg-page shadow-[0_20px_50px_-10px_var(--color-shadow)] outline-none',
            className,
          )}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function ModalClose() {
  return (
    <Dialog.Close
      aria-label="Close"
      className="cursor-pointer text-primary transition-colors hover:text-secondary"
    >
      <Icon name="close" className="size-6" />
    </Dialog.Close>
  )
}

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}

export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
  return (
    <ModalFrame
      open={open}
      onOpenChange={onOpenChange}
      hasDescription={!!description}
      className="gap-6 border border-raised p-7.75"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Dialog.Title className="text-h2">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="text-body-s text-secondary">
              {description}
            </Dialog.Description>
          )}
        </div>
        <ModalClose />
      </div>
      {children}
    </ModalFrame>
  )
}
