import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Order } from '@/shared/api/types'
import { fetchTickets, refundOrder, ticketKeys } from './api'

export function useMyTickets() {
  return useQuery({
    queryKey: ticketKeys.all,
    queryFn: fetchTickets,
    select: (orders) => ({
      upcoming: orders.filter((order) => order.isUpcoming),
      past: orders.filter((order) => !order.isUpcoming),
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
