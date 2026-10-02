import { apiClient } from '@/shared/api/client'
import type {
  ApiResponse,
  Order,
  SeatHold,
  SeatMap,
  Session,
  TicketTypeSlug,
} from '@/shared/api/types'

export const bookingKeys = {
  session: (sessionId: number) => ['sessions', 'detail', sessionId] as const,
  seats: (sessionId: number) => ['sessions', 'seats', sessionId] as const,
  hold: (holdId: string) => ['me', 'hold', holdId] as const,
}

export type SeatChoice = { seatId: number; ticketType: TicketTypeSlug }

export type OrderRequest = {
  holdId: string
  fullName: string
  email: string
  mobileNumber: string
  cardNumber: string
  expiry: string
  cvv: string
}

export async function fetchSession(sessionId: number) {
  const { data } = await apiClient.get<ApiResponse<Session>>(`/sessions/${sessionId}`)
  return data.data
}

export async function fetchSeatMap(sessionId: number) {
  const { data } = await apiClient.get<ApiResponse<SeatMap>>(`/sessions/${sessionId}/seats`)
  return data.data
}

/** Holding again replaces the user's previous hold for this session. */
export async function holdSeats(sessionId: number, seats: SeatChoice[]) {
  const { data } = await apiClient.post<ApiResponse<SeatHold>>(`/sessions/${sessionId}/holds`, {
    seats,
  })
  return data.data
}

export async function fetchHold(holdId: string) {
  const { data } = await apiClient.get<ApiResponse<SeatHold>>(`/holds/${holdId}`)
  return data.data
}

export async function releaseHold(holdId: string) {
  await apiClient.delete(`/holds/${holdId}`)
}

export async function createOrder(order: OrderRequest) {
  const { data } = await apiClient.post<ApiResponse<Order>>('/orders', order)
  return data.data
}
