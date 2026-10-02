import { useRef } from 'react'
import type { Order } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { FormError } from '@/shared/ui/FormError'
import { Modal } from '@/shared/ui/Modal'
import { useRefundOrder } from '../hooks'

type RefundDialogProps = {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RefundDialog({ order, open, onOpenChange }: RefundDialogProps) {
  const refundMutation = useRefundOrder()
  // `isPending` only disables the button on the next render, too late for a double click.
  const sending = useRef(false)
  const { session } = order

  const changeOpen = (next: boolean) => {
    if (next) refundMutation.reset()
    onOpenChange(next)
  }

  const refund = async () => {
    if (sending.current) return
    sending.current = true
    try {
      await refundMutation.mutateAsync(order.reference)
      onOpenChange(false)
    } catch {
      // Shown below from `refundMutation.error`.
    } finally {
      sending.current = false
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={changeOpen}
      title="Refund this order?"
      description={`${session.movie.title} · ${formatDate(session.date, 'EEE d MMM')} · ${session.time}`}
    >
      <div className="flex w-102.75 flex-col gap-6">
        <p className="text-body-m text-secondary">
          ₾{order.totalPrice} goes back to the card ending {order.cardLastFour} and the seats are
          released. This can't be undone.
        </p>
        <FormError message={refundMutation.error?.message} />
        <div className="flex justify-end gap-3">
          <Button variant="transparent" onClick={() => changeOpen(false)}>
            Keep tickets
          </Button>
          <Button onClick={() => void refund()} loading={refundMutation.isPending}>
            Refund
          </Button>
        </div>
      </div>
    </Modal>
  )
}
