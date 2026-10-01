export type ApiResponse<T> = { data: T }

export type Format = {
  id: number
  slug: string
  name: string
  priceUplift: number
}

export type Venue = {
  id: number
  slug: string
  name: string
  city: string
}

export type VenueWithFormats = Venue & { formats: Format[] }

export type Language = {
  id: number
  slug: string
  name: string
}

export type Genre = {
  id: number
  slug: string
  name: string
}

export type AgeRatingCode = 'G' | 'PG' | '12+' | '16+' | '18+'

export type AgeRating = {
  code: AgeRatingCode
  minAge: number
  description: string
}

export type TicketTypeSlug = 'adult' | 'child' | 'student'

export type TicketType = {
  id: number
  slug: TicketTypeSlug
  name: string
  priceRatio: number
  note: string | null
  blockedFromRatingAge: number | null
}

export type TimeBandId = 'morning' | 'afternoon' | 'evening'

export type SortId = 'time_asc' | 'time_desc' | 'price_asc' | 'price_desc' | 'title_asc'

export type FilterOptions = {
  venues: VenueWithFormats[]
  formats: Format[]
  languages: Language[]
  timeBands: { id: TimeBandId; label: string }[]
  sorts: { id: SortId; label: string }[]
  ticketTypes: TicketType[]
  ageRatings: AgeRating[]
  maxSeatsPerOrder: number
  holdMinutes: number
}

export type User = {
  id: number
  username: string
  email: string
  avatar: string | null
  fullName: string | null
  mobileNumber: string | null
  dateOfBirth: string | null
  age: number | null
  preferredVenue: VenueWithFormats | null
  profileComplete: boolean
}

export type Movie = {
  id: number
  slug: string
  title: string
  kind: 'film' | 'event'
  runtimeMinutes: number
  posterUrl: string | null
  backdropUrl: string | null
  releaseDate: string
  isComingSoon: boolean
  isNotified: boolean
  isFeatured: boolean
  fromPrice: number
  ageRating: AgeRating
  genres: Genre[]
  formats: Format[]
}

export type MovieDetail = Movie & {
  synopsis: string
  director: string | null
  cast: string | null
  availableDates: string[]
}

export type Hall = {
  id: number
  name: string
}

export type Session = {
  id: number
  startsAt: string
  date: string
  time: string
  timeBand: TimeBandId
  price: number
  seatsLeft: number
  isSoldOut: boolean
  hall: Hall & { venue: Venue }
  venue: Venue
  format: Format
  language: Language
  movie: Movie
}

export type SeatState = 'available' | 'sold' | 'held' | 'unavailable'

export type Seat = {
  id: number
  code: string
  label: string
  state: SeatState
  aisleAfter: boolean
  isMine: boolean
}

export type SeatMap = {
  sessionId: number
  hall: Hall & { venue: Venue }
  sections: {
    name: string
    rows: { label: string; seats: Seat[] }[]
  }[]
}

export type TicketLine = {
  seatCode: string
  ticketType: { slug: TicketTypeSlug; name: string }
  price: number
}

export type SeatHold = {
  holdId: string
  sessionId: number
  expiresAt: string
  secondsRemaining: number
  isLive: boolean
  subtotal: number
  seats: (Omit<TicketLine, 'seatCode'> & { seatId: number; code: string })[]
}

export type Order = {
  id: number
  reference: string
  status: 'paid' | 'refunded'
  totalPrice: number
  paidAt: string
  refundedAt: string | null
  isUpcoming: boolean
  isRefundable: boolean
  cardLastFour: string
  contact: { fullName: string; email: string; mobileNumber: string }
  session: Session
  tickets: (TicketLine & { id: number })[]
}
