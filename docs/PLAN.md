# Kino XII — Project Plan

Redberry Bootcamp XII entry assignment: the front end for the Kino XII cinema network.
The API is ready; this repo is front end only.

- **Deadline:** 11 October 2026, 23:59:59
- **API docs:** https://api.kinoxii.redberryinternship.ge/docs (base URL `https://api.kinoxii.redberryinternship.ge/api`)
- **Figma:** https://www.figma.com/design/rBonynbM7wSNOmPs4cryxT/Redberry-Bootcamp-XII
- **Seeded test account:** `jane@kinoxii.test` / `password` (complete profile, tickets in both tabs)
- **Test card:** `4242 4242 4242 4242`, any future expiry, any 3-digit CVV

## Submission requirements

- Pixel fidelity at the design size: **1920×1080** content (desktop only).
  Figma frames are 1728px wide (MacBook Pro 16" preset); organisers confirmed the target is 1920×1080.
  So: keep Figma sizes, fonts and paddings 1:1, and let full-width areas stretch to the viewport.
  Page gutter is 60px (`px-gutter`). Do **not** scale the UI up or cap it at 1728.
- Public GitHub repo, **logical commits with short descriptive messages** (well over 10).
- App **hosted online** (Vercel).
- Optional but scored: a Loom video explaining how the work was done and how problems were solved.

---

## 1. Scope

| Area    | Pages / modals                                                                                                       |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| Public  | Home (hero carousel, recently viewed, Now Playing, Coming Soon), Sessions (filters + list, URL state), Movie details |
| Auth    | Login modal, Register modal (avatar preview). Protected actions resume automatically after login                     |
| Booking | 2-step modal: Seats → Checkout (hold timer, card form) → Confirmation                                                |
| Account | Profile page: personal info form + My Tickets (Upcoming / Past, Refund)                                              |
| Global  | Skeletons, empty states, error + retry, 401/409/422/500 handling, double-submit protection                           |

### Known discrepancies / decisions

1. **Foyer (food & drinks, pickup slots) is out of scope.** The brief mentions it (checkout summary,
   409 "slot full", pickup code on confirmation, "no products in category" empty state), but the API
   has no foyer endpoints (`/foyer`, `/menu` → 404). Likely left over from an older brief. _Confirm with Redberry._
2. **Recently viewed** has no endpoint → stored in `localStorage` on the client.
3. Movie responses include `isNotified` (not in the spec) — use it for the Notify Me button state.
4. The brief says both "profile modal" and "profile page" — Figma decides.
5. The API pre-computes `age`, `profileComplete`, `isRefundable`, `timeBand`, `fromPrice`, `availableDates`.
   **Never recompute these on the client.**
6. **Hardcode nothing** that `GET /filter-options` provides: venues, formats, languages, time bands,
   sorts, ticket types (+ price ratios, child block age), age ratings, `maxSeatsPerOrder`, `holdMinutes`.
7. API sends `Access-Control-Allow-Origin: *` → no dev proxy needed.

---

## 2. Tech stack

| Package                                         | Purpose                                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| Vite + React + TypeScript                       | Build tool, UI, types                                                                  |
| React Router                                    | Routing; `useSearchParams` for the sessions URL state                                  |
| TanStack Query                                  | All server state: caching, loading/error, retry, refetch, invalidation after mutations |
| Axios                                           | HTTP client; interceptors attach the Bearer token and catch 401 centrally              |
| react-hook-form + zod (+ `@hookform/resolvers`) | Forms validated `onBlur`; zod holds the exact error strings; `setError` maps 422s      |
| Zustand                                         | Small global store: token, user, open modal, pending action (readable outside React)   |
| Radix UI primitives                             | Dialog, Select, Tabs, Tooltip, Checkbox — accessible behaviour, styled by us           |
| Tailwind CSS v4                                 | Styling; Figma tokens defined once in `@theme`                                         |
| date-fns                                        | 7-day date strip, formatting, card-expiry check                                        |
| oxlint + Prettier                               | Linting + formatting                                                                   |
| Vitest _(optional)_                             | Unit tests for pure logic only (seat rules, pricing, URL parsing)                      |

**Hosting:** Vercel, connected to the GitHub repo (auto-deploy on push, preview URL per branch).
`vercel.json` rewrites every path to `index.html` so deep links like `/sessions?...` survive a refresh.

---

## 3. Folder structure (feature-based)

```
src/
  app/                    # wiring only
    App.tsx
    router.tsx
    providers.tsx         # QueryClientProvider, etc.
    layouts/RootLayout.tsx  # Navbar + <Outlet/> + global modals
  pages/                  # one per route, thin: compose features
    HomePage.tsx
    SessionsPage.tsx
    MoviePage.tsx
    ProfilePage.tsx
    NotFoundPage.tsx
  features/
    auth/       api.ts, store.ts, useRequireAuth.ts, schemas.ts
                components/ LoginModal, RegisterModal, AvatarInput
    catalogue/  api.ts, hooks.ts, recentlyViewed.ts
                components/ MovieCard, AgeBadge, HeroCarousel, MovieRow
    sessions/   api.ts, hooks.ts, useSessionFilters.ts
                components/ FilterSidebar, DateStrip, SessionGroup, SessionCard, SortSelect
    booking/    api.ts, bookingReducer.ts, rules.ts, useHoldTimer.ts
                components/ BookingModal, SeatMap, Seat, Legend, TicketTypeRow,
                            PriceSummary, CheckoutForm, StepIndicator, Confirmation
    profile/    api.ts, schemas.ts
                components/ ProfileForm, ProfileStatus
    tickets/    api.ts
                components/ TicketCard, TicketTabs, RefundDialog
  shared/
    api/        client.ts   # axios instance + interceptors
                errors.ts   # normalise every failure into ApiError
                types.ts    # Movie, Session, Seat, User, Order... from the spec
    ui/         Button, TextField, Modal, Checkbox, Badge, Skeleton,
                EmptyState, ErrorState, Pagination, Spinner
    lib/        format.ts (₾, runtime, dates), storage.ts
  styles/
    globals.css           # Tailwind import + @theme design tokens
```

**Dependency rule:** `features/*` may import from `shared/*`; `shared/*` never imports from `features/*`.
Cross-feature imports only where clearly needed (e.g. `booking` uses `auth`'s `useRequireAuth`).

Each feature's `api.ts` holds plain request functions plus a query-key factory; `hooks.ts` wraps them in
`useQuery` / `useMutation`. Components never call axios directly.

---

## 4. Key design decisions

### a) Error normalisation — `shared/api/errors.ts`

Every failed request becomes an `ApiError` with a `kind`:

| kind           | Source                  | UI response                                                       |
| -------------- | ----------------------- | ----------------------------------------------------------------- |
| `unauthorized` | 401                     | Open login modal, replay the action afterwards                    |
| `validation`   | 422 with `errors`       | Map each key onto its form field                                  |
| `rule`         | 422 with `message` only | Show `message` as-is (incomplete profile, age gate, expired hold) |
| `conflict`     | 409 with `contested`    | Mark those seats sold, keep the rest, refetch the map             |
| `forbidden`    | 403                     | Generic message (indicates a bug)                                 |
| `notFound`     | 404                     | Not-found state                                                   |
| `server`       | 500 / network           | Error message + Retry                                             |

### b) Auth + "replay the action"

- Token in `localStorage`; on boot, if a token exists call `GET /me` (401 → drop token, guest).
- `requireAuth(action)`: logged in → run now; otherwise open the login modal with `pendingAction = action`,
  and run it after a successful login/registration.
- Any 401 from a protected call → clear token, open login with "retry this request" as the pending action.
- Booking additionally requires `profileComplete`: if false, show a notice and send the user to the profile.
- Login 401 = wrong credentials: keep modal open, keep email, show `message`.
- Register is `multipart/form-data`; note the snake_case `password_confirmation` field.

### c) Sessions URL state — `useSessionFilters`

- The URL is the **single source of truth** (no mirrored `useState`).
- Params: `date`, `venues[]`, `formats[]`, `languages[]`, `bands[]`, `sort`, `page` (sent to the API as-is).
- `setFilters` always resets `page` to 1 unless the page itself is being changed.
- Selecting venues narrows the format list to those venues' `formats`, dropping selected formats they lack.
- "Clear All Filters" clears everything except `date`; footer shows "X filters active".
- Query key includes the filters → TanStack Query refetches automatically; skeletons while loading.
- Pagination counts **films**, not sessions (10 per page); counter uses `meta.totalSessions`.

### d) Booking modal = state machine (`useReducer`)

States: `selecting → holding → checkout → paying → confirmed`, plus `expired` / `conflict` transitions.

- Opened via URL (`?booking=<sessionId>`), so a refresh can restore it; hold id kept in `sessionStorage`
  and re-read with `GET /holds/{id}`.
- Seat map rendered purely from `GET /sessions/{id}/seats`: sections → rows → seats, `aisleAfter` spacers,
  `unavailable` renders an empty gap, row labels from data, `isMine` seats pre-selected.
- Refetch the map: when the modal opens, after a 409, after hold expiry.
- Rules enforced in UI (`rules.ts`): seat cap from filter-options, child ticket blocked when
  `minAge >= blockedFromRatingAge`, age gate vs `user.age`, invalid seats listed by code.
- Price = `session.price × ticketType.priceRatio`, live summary with subtotal.
- Hold: `POST /sessions/{id}/holds` (re-posting replaces the previous hold).
- Timer counts down to `expiresAt` (absolute), not a local counter. At zero: clear selection, back to
  step 1, refetch map, show "Your hold time expired. Please re-select your seats."
- Back from checkout → step 1 **without** releasing the hold. Closing the modal → `DELETE /holds/{id}`.
- Pay: `POST /orders`, button disabled + loading while in flight; render confirmation from the response.

### e) Server data is the truth

After refund, profile save, order, notify: invalidate the affected queries and render what the server returns.
No optimistic local edits.

### f) Forms

- Validation `mode: "onBlur"`; valid fields get a green border/check, invalid ones red border + message.
- Error strings copied exactly from the brief (the API returns the same strings for 422s).
- Profile "Save Changes" disabled until the form is dirty and valid; loading while saving.

---

## 5. Build order

Each step is several small commits (`feat:`, `fix:`, `chore:`, `refactor:`, `style:`, `docs:`).

1. **Setup:** Vite scaffold, oxlint/Prettier, Tailwind + Figma tokens, folder skeleton, `@/` alias,
   GitHub repo, first Vercel deploy.
2. **Foundation:** axios client + interceptors, `ApiError`, shared types, `/filter-options` at boot,
   router + RootLayout + Navbar, shared UI primitives (Button, TextField, Modal, Skeleton, …).
3. **Auth:** store, `/me` on boot, Login + Register modals, `requireAuth`, 401 replay, logout.
4. **Home:** hero carousel (featured), recently viewed, Now Playing, Coming Soon + Notify Me.
5. **Sessions page:** URL filters, dynamic formats, sort, pagination, counters, skeletons, empty state.
6. **Movie details:** info, date strip (`availableDates`), sessions grouped by venue, age-gate notice.
7. **Booking:** seat map → hold → checkout → confirmation; 409, expiry, 422, double-submit.
8. **Profile + Tickets:** profile form + completeness indicator (navbar dot, banner), tabs, refund dialog.
9. **Polish:** loading/empty/error states everywhere, Figma comparison at 1920, README, optional Loom.
