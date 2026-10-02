import { Dialog } from 'radix-ui'
import { ModalClose } from '@/shared/ui/Modal'
import { Skeleton } from '@/shared/ui/Skeleton'
import { BookingColumns } from './BookingColumns'

/** The seat step's layout in grey, at about the size the real step will have. */
export function BookingSkeleton() {
  return (
    <>
      <div className="flex items-start gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <Dialog.Title className="sr-only">Loading booking</Dialog.Title>
          <Skeleton className="h-5.5 w-56" />
          <Skeleton className="h-4 w-120" />
        </div>
        <ModalClose />
      </div>
      <BookingColumns
        main={
          <div className="flex flex-col gap-9.5">
            <Skeleton className="h-8.25 rounded-full" />
            <div className="flex flex-col gap-8">
              <Skeleton className="mx-5 h-7.5 rounded-t-none rounded-b-[20px]" />
              <div className="flex flex-col items-center gap-6">
                <Skeleton className="h-3.25 w-32" />
                <div className="flex w-full flex-col gap-2.5">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-13 rounded-[10px]" />
                  ))}
                </div>
              </div>
              <Skeleton className="mx-auto h-4 w-100" />
            </div>
          </div>
        }
        aside={
          <>
            <div className="flex flex-col gap-3">
              <Skeleton className="h-3.75 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex flex-col gap-3 pt-2.5">
              <Skeleton className="h-6.5" />
              <Skeleton className="h-10.25 rounded-full" />
            </div>
          </>
        }
      />
    </>
  )
}
