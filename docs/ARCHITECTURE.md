# Architecture

Kino XII is a single-page React app for browsing films and sessions and booking cinema tickets.
It is front end only; all data comes from the Kino XII REST API
(`https://api.kinoxii.redberryinternship.ge/api`, docs at `/docs`).

## Stack

| Concern          | Choice                                      | Why                                                                     |
| ---------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| Build / language | Vite, React, TypeScript (strict)            | Fast dev server, typed code                                             |
| Routing          | React Router                                | Routes + `useSearchParams` for URL-driven state                         |
| Server state     | TanStack Query                              | Caching, loading/error states, retries, invalidation after mutations    |
| HTTP             | Axios                                       | Interceptors for the auth header and global 401 handling                |
| Forms            | react-hook-form + zod                       | `onBlur` validation, schema-defined messages, `setError` for API errors |
| Client state     | Zustand                                     | Auth session and global modal state, readable outside React             |
| UI primitives    | Radix UI                                    | Accessible Dialog, Select, Tabs, Tooltip, Checkbox; styled by us        |
| Styling          | Tailwind CSS v4                             | Figma tokens defined once in `@theme`                                   |
| Dates            | date-fns                                    | Date strip, formatting, expiry checks                                   |
| Lint / format    | oxlint, Prettier (+ Tailwind class sorting) |                                                                         |
| Hosting          | Vercel                                      | Auto-deploy from `main`; SPA rewrite in `vercel.json`                   |

## Folder structure

```
src/
  main.tsx              entry: fonts, global CSS, mounts <App/>
  app/                  wiring only: App, router, providers, layouts
  pages/                one component per route; thin, composes features
  features/
    auth/               login, register, session store, requireAuth
    catalogue/          movies: hero, rows, cards, details, recently viewed
    sessions/           sessions page: filters (URL state), list, date strip
    booking/            booking modal: seat map, hold, checkout, confirmation
    profile/            profile form and completeness status
    tickets/            My Tickets tabs and refunds
  shared/
    api/                axios client, error normalisation, API types
    ui/                 design-system components (Button, TextField, Modal, ...)
    lib/                pure helpers (formatting, storage)
  styles/globals.css    Tailwind import + design tokens
```

Folders are created when their first file is written.

### Dependency rules

- `shared/` never imports from `features/` or `pages/`.
- `features/` import from `shared/`, and from another feature only through that feature's public hooks
  (e.g. booking uses `auth`'s `useRequireAuth`).
- `pages/` compose features; they hold no data-fetching logic of their own.
- Imports use the `@/` alias (`@/shared/ui/Button`) instead of deep relative paths.

### Inside a feature

```
features/<name>/
  api.ts          request functions + query-key factory (the only place that calls the client)
  hooks.ts        useQuery / useMutation wrappers used by components
  schemas.ts      zod schemas for forms, when the feature has forms
  components/     feature UI
```

Components never call axios directly.

## Data layer

- **Static reference data** (`GET /filter-options`: venues, formats, languages, time bands, sorts,
  ticket types, age ratings, seat cap, hold minutes) is fetched once at boot and cached for the
  session. None of these values are hardcoded.
- **Server-computed fields are trusted, never recomputed:** `user.age`, `user.profileComplete`,
  `order.isRefundable`, `session.timeBand`, `movie.fromPrice`, `movie.availableDates`.
- **After a mutation** (order, refund, profile save, notify) the affected queries are invalidated and
  the UI renders what the server returns. No optimistic local edits.

## Error handling

Every failed request is normalised into an `ApiError` (`shared/api/errors.ts`) with a `kind`:

| kind           | HTTP                    | UI response                                                       |
| -------------- | ----------------------- | ----------------------------------------------------------------- |
| `unauthorized` | 401                     | Open the login modal, replay the interrupted action after login   |
| `validation`   | 422 with `errors`       | Show each message on its form field                               |
| `rule`         | 422 with `message` only | Show `message` as-is (incomplete profile, age gate, expired hold) |
| `conflict`     | 409 with `contested`    | Mark contested seats taken, keep the rest, refetch                |
| `forbidden`    | 403                     | Generic error                                                     |
| `notFound`     | 404                     | Not-found state                                                   |
| `server`       | 5xx / network           | Error message with Retry                                          |

Every list has loading (skeletons on the sessions page), empty and error states.
Buttons that send requests are disabled while the request is in flight.

## Authentication

- The token is stored in `localStorage`. On boot, if a token exists, `GET /me` restores the user;
  a 401 drops the token and the user continues as a guest.
- `requireAuth(action)` runs the action immediately when signed in. Otherwise it opens the login modal
  and stores the action as pending; a successful login or registration runs it, so the user never
  clicks twice.
- A 401 from any protected request clears the token and opens the login modal with "retry this request"
  as the pending action.
- Booking additionally requires `user.profileComplete`; when false the user is sent to complete the profile.

## Sessions page URL state

The URL is the single source of truth for filters, sort and page; there is no mirrored component state.
`useSessionFilters` parses the query string into typed filters and exposes setters.

- Query params match the API: `date`, `venues[]`, `formats[]`, `languages[]`, `bands[]`, `sort`, `page`.
- Changing any filter or the sort resets `page` to 1.
- Selected venues narrow the available formats to those venues' `formats`; selected formats the venues
  do not offer are dropped.
- Filters are part of the query key, so changing the URL refetches automatically, and back/forward,
  refresh and shared links all restore the same view.

## Booking flow

The booking modal is driven by a reducer (`booking/bookingReducer.ts`) with explicit states:
`selecting → holding → checkout → paying → confirmed`, plus `expired` and `conflict` transitions.

- The modal is opened through the URL (`?booking=<sessionId>`); the hold id is kept in `sessionStorage`
  so a refresh restores the countdown via `GET /holds/{id}`.
- The seat map is rendered entirely from `GET /sessions/{id}/seats`
  (sections → rows → seats, `aisleAfter` spacers, `unavailable` gaps, row labels from data).
- Seat rules live in `booking/rules.ts` as pure functions: seat cap, child-ticket age block,
  age gate, price = `session.price × ticketType.priceRatio`.
- The hold countdown is computed from the absolute `expiresAt`, not a local counter.
- 409 on hold or order: report the lost seats by code, drop them, keep the rest, refetch the map.
- Hold expiry: clear the selection, return to step 1, refetch the map, show the expiry message.
- Going back from checkout keeps the hold; closing the modal releases it (`DELETE /holds/{id}`).
- The confirmation view renders from the `POST /orders` response.

## Styling

- Design tokens mirror the Figma variables and live in `src/styles/globals.css` under `@theme`.
  Tailwind's default colour palette is disabled, so only design-system colours can be used.
  - Colours: `page`, `card`, `raised`, `primary`, `secondary`, `disabled`, `red`, `green`, `orange`,
    `tint-white`, `tint-red`, `tint-green`, `shadow`
  - Text styles (size + line height + weight in one class): `text-display`, `text-h1`, `text-h2`,
    `text-h3`, `text-body-l`, `text-body-m`, `text-body-s`, `text-label-m`, `text-label-s`, `text-button`
  - Font: Archivo (self-hosted via `@fontsource-variable/archivo`)
- **Layout target is 1920×1080.** Figma frames are 1728px wide; sizes, fonts and paddings are
  implemented 1:1 and full-width areas stretch to the viewport. Horizontal page padding is
  `px-gutter` (60px).
- Reusable visual components live in `shared/ui`; features compose them rather than restyling raw elements.

## Conventions

- Prettier: no semicolons, single quotes, trailing commas, 100-column width. Run `npm run format`.
- Components and their files are PascalCase; hooks are `useX`; other modules are camelCase.
- Comments only where they carry context the code cannot (API quirks, non-obvious constraints).
- Commits follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `build:`),
  small and focused.

## Scripts

| Script                            | Purpose                             |
| --------------------------------- | ----------------------------------- |
| `npm run dev`                     | Dev server on http://localhost:5173 |
| `npm run build`                   | Type-check and production build     |
| `npm run lint`                    | oxlint                              |
| `npm run format` / `format:check` | Prettier write / check              |
| `npm run typecheck`               | TypeScript only                     |
