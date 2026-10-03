import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Order } from '@/shared/api/types'
import { hasSessionStarted, useCinemaNow } from '@/shared/lib/cinemaClock'
import { fetchTickets, refundOrder, ticketKeys } from './api'

/**
 * The server's `isUpcoming` runs on a clock that is four hours late (see `cinemaClock`), so an order
 * also moves to Past once its session has started on the cinema's clock.
 */
export function useMyTickets() {
  const now = useCinemaNow()
  const isUpcoming = (order: Order) => order.isUpcoming && !hasSessionStarted(order.session, now)
  return useQuery({
    queryKey: ticketKeys.all,
    queryFn: fetchTickets,
    select: (orders) => ({
      upcoming: orders.filter(isUpcoming),
      past: orders.filter((order) => !isUpcoming(order)),
    }),
  })
}

export function useRefundOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: refundOrder,
    onSuccess: (refunded) => {
      // The card re-renders from the returned order; the refetch then confirms the whole list.
      queryClient.setQueryData<Order[]>(ticketKeys.all, (orders) =>
        orders?.map((order) => (order.id === refunded.id ? refunded : order)),
      )
      void queryClient.invalidateQueries({ queryKey: ticketKeys.all })
      // The seats are back on sale.
      void queryClient.invalidateQueries({ queryKey: ['sessions'] })
      void queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
  })
}
