import { apiClient } from '@/shared/api/client'
import type { ApiResponse, Order } from '@/shared/api/types'

export const ticketKeys = {
  all: ['me', 'tickets'] as const,
}

/** Both tabs in one request; `isUpcoming` (computed by the server) decides each order's tab. */
export async function fetchTickets() {
  const { data } = await apiClient.get<ApiResponse<Order[]>>('/tickets')
  return data.data
}

export async function refundOrder(reference: string) {
  const { data } = await apiClient.post<ApiResponse<Order>>(`/orders/${reference}/refund`)
  return data.data
}
