import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon } from './Icon'

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  className?: string
  children: ReactNode
}

export function Modal({ open, onOpenChange, title, description, className, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-page/70 backdrop-blur-sm" />
        <Dialog.Content
          {...(!description && { 'aria-describedby': undefined })}
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-2rem)] -translate-1/2 flex-col gap-6 overflow-y-auto',
            'rounded-[28px] border border-raised bg-page p-7.75 shadow-[0_20px_50px_-10px_var(--color-shadow)] outline-none',
            className,
          )}
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
            <Dialog.Close
              aria-label="Close"
              className="cursor-pointer text-primary transition-colors hover:text-secondary"
            >
              <Icon name="close" className="size-6" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
