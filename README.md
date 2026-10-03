# Kino XII

Front end for the Kino XII cinema network, built for the Redberry Bootcamp XII assignment. Browse
films and showtimes across the network's venues, pick seats, pay with a test card and manage your
tickets.

**Live:** https://kino-xii-six.vercel.app

Designed for desktop at **1920×1080**, following the provided Figma file.

## Features

- **Home** — featured films carousel, Now Playing and Coming Soon rows (with Notify Me), and a
  Recently viewed row for signed-in users.
- **Header search** — typeahead over films and live events with keyboard navigation.
- **Sessions** — every showtime with filters for venue, date, format, language and time of day,
  sorting and pagination. Filters live in the URL, so a filtered view can be shared or bookmarked.
- **Movie page** — details, a seven-day date strip and sessions grouped by venue and hall, with an
  age-rating check against the signed-in user.
- **Booking** — a two-step modal: seat map → hold → checkout (card form, hold countdown) →
  confirmation. Taken seats, expired holds and payment errors are handled, and a hold survives a
  page refresh.
- **Accounts** — log in and sign up (with avatar preview) in modals. A protected action started as a
  guest continues after logging in.
- **Profile** — personal information form with the brief's validation messages, the age ratings the
  user can book, and My Tickets (Upcoming / Past) with refunds up to two hours before a session.
- Loading skeletons, empty states and error states with retry on every list and page.

## Tech stack

| Concern      | Choice                                   |
| ------------ | ---------------------------------------- |
| Build        | Vite, React 19, TypeScript (strict)      |
| Routing      | React Router                             |
| Server state | TanStack Query                           |
| HTTP         | Axios                                    |
| Forms        | react-hook-form + zod                    |
| Client state | Zustand                                  |
| UI           | Radix UI primitives, Tailwind CSS v4     |
| Dates        | date-fns                                 |
| Tooling      | oxlint, Prettier (+ Tailwind class sort) |
| Hosting      | Vercel                                   |

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173. The API address is in `.env` (`VITE_API_BASE_URL`), which
is committed because it is public, so no setup is needed.

| Script                            | Purpose                         |
| --------------------------------- | ------------------------------- |
| `npm run dev`                     | Dev server                      |
| `npm run build`                   | Type-check and production build |
| `npm run preview`                 | Serve the production build      |
| `npm run lint`                    | oxlint                          |
| `npm run typecheck`               | TypeScript only                 |
| `npm run format` / `format:check` | Prettier write / check          |

## Trying it out

- **Account:** sign up with any email. The seeded account from the API docs is rejected by the API.
- **Payment:** card `4242 4242 4242 4242`, any future expiry date and any three-digit CVV.
- To book, the profile must be complete (full name, mobile number, date of birth); the dot on the
  avatar and the account menu show whether it is.

## Project structure

```
src/
  app/        router, providers, query client, layout (navbar, footer)
  pages/      one component per route
  features/   auth, catalogue, search, sessions, booking, profile, tickets
  shared/     API client and types, UI components, helpers
  styles/     Tailwind import and design tokens from Figma
```

Each feature keeps its own `api.ts` (requests and query keys), `hooks.ts` and components. Pages
other than Home, the auth modals and the booking flow load as separate chunks.
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) describes the data layer, error handling,
authentication and every page in detail.

## Notes and decisions

- **Food & drinks (foyer)** from the brief is not built: the API has no endpoints for it.
- **Recently viewed** has no endpoint, so it is stored in the browser (`localStorage`).
- **Header search** comes from Figma; it is not in the written brief.
- **Profile completeness** is shown by the dot on the avatar and the account menu, as in Figma; the
  profile page keeps Figma's layout and adds a card with the age ratings the user can book.
- **Session times** come from the API as the cinema's local time labelled as UTC. Refund cutoffs are
  therefore built from the session's date and time, and both the cutoff and "has this session
  started" are judged by the clock in Tbilisi: started sessions are shown disabled, their tickets move to Past and Refund
  is disabled once the cutoff passes, although the API itself would still accept a booking or a
  refund for another four hours. The brief only asks for sold-out sessions to be disabled.
- **Cases not covered by Figma:** many specific situations have no design (empty and error states,
  the refund confirmation, disabled and sold-out sessions, the age-ratings card, some validation
  feedback). Independent decisions, trade-offs and some deviations from Figma were therefore
  unavoidable. Where possible, these screens reuse the existing components and tokens so they fit
  the rest of the design.
- **Animations** are only partly defined in the Figma prototype, and some of its transitions switch
  instantly. The rest (the hero crossfade and zoom, the search bar opening, the seat map appearing,
  hover fades) were added with consistent timings, mostly the 300 ms ease-out the prototype uses
  for hover states.
