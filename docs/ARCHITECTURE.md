# Architecture

Kino XII is a single-page React app for browsing films and sessions and booking cinema tickets.
It is front end only; all data comes from the Kino XII REST API
(`https://api.kinoxii.redberryinternship.ge/api`, docs at `/docs`).

## Stack

| Concern          | Choice                                      | Why                                                                             |
| ---------------- | ------------------------------------------- | ------------------------------------------------------------------------------- |
| Build / language | Vite, React, TypeScript (strict)            | Fast dev server, typed code                                                     |
| Routing          | React Router                                | Routes + `useSearchParams` for URL-driven state                                 |
| Server state     | TanStack Query                              | Caching, loading/error states, retries, invalidation after mutations            |
| HTTP             | Axios                                       | Interceptors for the auth header and global 401 handling                        |
| Forms            | react-hook-form + zod                       | validate on blur, then live; schema-defined messages, `setError` for API errors |
| Client state     | Zustand                                     | Auth session and global modal state, readable outside React                     |
| UI primitives    | Radix UI                                    | Accessible Dialog, Select, Tabs, Tooltip, Checkbox; styled by us                |
| Styling          | Tailwind CSS v4                             | Figma tokens defined once in `@theme`                                           |
| Dates            | date-fns                                    | Date strip, formatting, expiry checks                                           |
| Lint / format    | oxlint, Prettier (+ Tailwind class sorting) |                                                                                 |
| Hosting          | Vercel                                      | Auto-deploy from `main`; SPA rewrite in `vercel.json`                           |

## Folder structure

```
src/
  main.tsx              entry: fonts, global CSS, mounts <App/>
  app/                  wiring only: App, router, providers, query client, layouts/ (RootLayout, Navbar, Footer)
  pages/                one component per route; thin, composes features (+ NotFound, RouteError)
  features/
    auth/               login, register, session store, requireAuth
    catalogue/          movies: hero, rows, cards, details, recently viewed
    search/             header search typeahead
    sessions/           sessions page: filters (URL state), list, date strip
    booking/            booking modal: seat map, hold, checkout, confirmation
    profile/            profile form and completeness status
    tickets/            My Tickets tabs and refunds
  shared/
    api/                axios client, ApiError, token storage, API types, filter options query
    ui/                 design-system components (Button, Badge, Icon, Logo, Skeleton, ...)
    lib/                pure helpers (cn, formatting)
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
  ticket types, age ratings, seat cap, hold minutes) is prefetched in `main.tsx` and cached for the
  whole session (`staleTime` and `gcTime` are `Infinity`). Read it with `useFilterOptions()`.
  None of these values are hardcoded.
- Queries retry only `server` and `network` errors (max 2); a 404 or 422 would fail the same way again.
  Refetch on window focus is off.
- The API base URL comes from `VITE_API_BASE_URL` in `.env`.
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
| `server`       | 5xx                     | Error message with Retry                                          |
| `network`      | no response             | Error message with Retry                                          |

The axios response interceptor converts every failure, so `catch` blocks and `useQuery` errors are
always an `ApiError` (`isApiError` narrows `unknown`).

Every list has loading (skeletons on the sessions page), empty and error states.
Buttons that send requests are disabled while the request is in flight.

## Authentication

State is split by ownership:

- **Server state** — the signed-in user — is the TanStack Query entry `['me']` (`useCurrentUser()`).
- **Client state** — the token and which auth modal is open — is a Zustand store (`features/auth/store.ts`).
  The token is mirrored to `localStorage` (`shared/api/token.ts`) so the axios client can read it.

Flow:

- `useCurrentUser()` returns an explicit `status`: `guest` (no token), `loading`, `authenticated` or
  `error`, plus `retry()`. Every consumer renders all four: the navbar shows a skeleton while loading and
  "Couldn't load your account" + Retry on error; `RequireAuth` shows a spinner or an `ErrorState`.
- On boot, if a token exists, `GET /me` restores the user; a 401 there drops the token and the user
  continues as a guest. A network/server failure is the `error` status — the token is kept.
- Login and registration store the token, reset the session cache (below) with the returned user and
  close the modal.
- **Waiting for a login** is a promise: `requestLogin()` opens the modal (unless one is already open) and
  resolves `true` when the user signs in or registers, `false` when they dismiss it. Concurrent callers
  share it, and switching between the login and register modals keeps it pending.
- `useRequireAuth()(action)` runs the action now when signed in, otherwise after `requestLogin()` resolves
  `true` — the user never clicks twice.
- **401 replay** lives in the axios response interceptor. Each request records the token it was sent
  with (`sentWithToken`). On a 401 for a request not marked `skipAuthRedirect`:
  - if the current token differs from the one the request carried, the session already changed (for
    example a parallel 401 already led to a new login): the request is simply re-sent;
  - otherwise the session ends, `requestLogin()` is awaited, and on success the request is re-sent with
    the new token. The caller's promise stays pending meanwhile (buttons keep their loading state).

  `/login`, `/register`, `/logout` and `/me` set `skipAuthRedirect`, because their 401s mean something else.

### Session cache rules

Whenever the signed-in user changes (login, registration, logout, expired session), `resetSessionCache`:

1. cancels in-flight queries, so an old user's response cannot land afterwards;
2. **removes** everything under `['me', ...]` — private data is never shown to the next user, even
   briefly (invalidating would keep showing it while refetching);
3. invalidates the remaining queries, whose responses can vary per user (`isNotified`, `isMine`);
4. leaves queries marked `meta: { sessionIndependent: true }` alone (e.g. `/filter-options`).

So: **private data uses a key starting with `'me'`** (`['me', 'tickets']`, `['me', 'hold', id]`), and
reference data identical for everyone sets `sessionIndependent`. The `meta` type is declared in
`shared/api/react-query.d.ts`.

- `RequireAuth` guards pages: arriving signed out opens the login modal (dismissing it goes home);
  signing out while on the page goes home.
- Booking additionally requires `user.profileComplete`; when false the user is sent to complete the profile.

## Forms

- react-hook-form with `zodResolver` and `mode: 'onTouched'`: a field is first validated when it loses
  focus (as the brief requires), then on every change, so an error clears as soon as the value is fixed.
  (`onBlur` would keep the error until the next blur.) Schemas live in each feature's `schemas.ts` and
  hold the exact messages.
- `TextField` shows Figma's states: hover, focus, error (red border, icon and message) and valid
  (green check, once the field was touched and has no error).
- Submit buttons are enabled from `useSchemaValid(control, schema)` rather than `formState.isValid`,
  because `setError` (used for API errors) forces `isValid` to false until the next blur.
- `applyServerErrors(error, setError, aliases)` maps 422 `errors` onto fields (`aliases` renames API keys
  such as `password_confirmation`); any other failure becomes `root.server`, rendered by `FormError`.

## Home page

Four sections, each a component in `features/catalogue/components` that owns its loading
(skeleton), error (message + Retry) and empty states; `pages/HomePage` only stacks them.

- **Hero** (`GET /movies/featured`): slides crossfade (300 ms) and the image slowly zooms (to 110 %
  over 7 s, reset after the fade-out). The red progress bar's CSS animation (`animate-progress`, 6 s)
  is the timer: its `animationend` moves to the next film, so pausing the animation (keyboard focus
  inside the hero) pauses the carousel, and with `prefers-reduced-motion` there is no autoplay or zoom. List responses have no `synopsis`, so each featured
  film's `GET /movies/{slug}` is fetched too; the details page later reuses that cache entry.
- **Recently viewed**: no endpoint, so `recentlyViewed.ts` keeps up to 10 films in `localStorage`
  (newest first, no duplicates) and exposes them through `useSyncExternalStore`. The movie details page
  adds to it. As in Figma, the section is shown only to signed-in users, and hidden while the list is
  empty.
- **Now playing** (`GET /movies/now-playing?limit=10`): cards widen on hover or focus as in the
  Figma prototype: the poster is cropped to the wider box and the synopsis (fetched at that moment)
  fades in at its final position; text sizes and the price row never move. "See all" goes to the
  sessions page.
- **Coming soon** (`GET /movies/coming-soon`): "See all" goes to the sessions page, as in Figma.
  Notify Me runs through `useRequireAuth` (logs in first if needed) and then
  `POST /movies/{slug}/notify`; after success the movie lists are invalidated and the button shows
  "Reminder set" because the server now returns `isNotified: true`. There is no unsubscribe endpoint.
- Rows scroll horizontally inside the 70px page margins (clipped there, as in Figma; Now Playing also
  has Figma's faint inner edge shadow) and fade out
  at their right end. As in Figma there is no visible scrollbar; rows scroll with a trackpad,
  Shift + wheel or keyboard focus.
- Cards that contain another control (Coming soon: Notify Me) use a stretched title link
  (`after:absolute after:inset-0`) instead of wrapping the card in a link, since interactive elements
  must not be nested.

## Sessions page

A sticky filter sidebar on the left (venue, date, format, language, time of day) and the list on the
right: sort menu, "Showing X sessions" counter, sessions grouped by film and pagination (10 films per
page; the API paginates films, not sessions).

### URL state

The URL is the single source of truth for filters, sort and page; there is no mirrored component state.
`useSessionFilters` parses the query string into typed filters and exposes setters; the pure parse and
serialise functions live in `features/sessions/filters.ts`.

- The URL follows the brief's example:
  `/sessions?venue=galleria,batumi&date=2026-11-14&format=max&language=georgian-dub&time=evening&sort=price_asc&page=2`.
  `api.ts` sends it in the API's format (`venues[]=galleria&venues[]=batumi&...`).
- Defaults (today, the first sort, page 1, no filters) are left out of the URL.
- Values not in `/filter-options`, and dates outside the next 7 days, are ignored, because the API
  would answer 422; an old or edited link still opens.
- Every change navigates, so Back restores the previous filters. Filter changes keep the scroll
  position; a page change scrolls to the top.
- Changing any filter or the sort resets `page` to 1. "Clear filters" clears everything except the date.
- Selected venues narrow the format list to the formats those venues offer; selected formats they do
  not offer are dropped.
- Filters are part of the query key, so a new URL refetches (skeletons while loading), and
  back/forward, refresh and shared links all restore the same view.

### Layout and list

- The sidebar is sticky. When it is taller than the window (1006px vs ~940px on a 1080p screen with
  browser chrome), it scrolls with the page until its bottom is 24px above the window bottom and sticks
  there (a negative `top` computed from its measured height), so every filter stays reachable.
- The date pills keep Figma's 37px width, so the row scrolls like the Home rows; the selected day is
  scrolled into view.
- Each film's sessions are one row, clipped at the list edge as in Figma; extra sessions scroll sideways.
- Sold-out sessions stay visible but disabled ("Sold out", 40 % opacity); 5 or fewer seats left are red.
- Choosing a session asks a guest to log in first, then opens the booking modal through `?booking=<id>`.

## Movie details page

`/movies/:slug` (`MovieDetails` in `features/catalogue`): a banner (blurred backdrop, poster, title,
synopsis, badges), the sessions section on the left and a Details panel on the right.

- `GET /movies/{slug}` loads the film; a 404 shows "Film not found". Opening the page adds the film to
  Recently viewed.
- The day picker shows the same 7 days as the sessions page. Days not in the film's `availableDates`
  are disabled; the first available day is selected on load. The selected day widens, as in Figma.
- All 7 days' sessions (`GET /movies/{slug}/sessions?date=`) load in parallel with `useQueries`, so
  "N sessions over the next seven days" is exact and switching days is instant. Days without
  sessions are not requested.
- The API groups sessions by venue; the page also groups each venue's sessions by hall, as in Figma.
  Session tiles are ticket-shaped (notches and a dashed perforation) and show a short language code
  (`languageCode` in `catalogue/lib.ts`), because Figma has room for "ENG" only.
- **Age gate:** a signed-in user younger than `ageRating.minAge` sees "This film is rated 16+. You
  cannot buy tickets for it with this account." above the venues, and every tile is disabled. Guests
  can still choose a session; the booking flow checks their age after they log in.
- The Details panel follows Figma (director, main cast, duration, release date, formats, from price,
  and the rating note with the rating's description) plus a Genre row, which the brief requires.

## Header search

`HeaderSearch` (`features/search`) sits in the navbar on every page; it is in Figma, not in the brief.

- The pill opens Figma's overlay in place when focused: it widens from 380 to 480px, the page is
  dimmed (black 20 %) and a panel below shows the prompt, the results or "No results". Clicking
  outside, Escape and the clear (×) button close it and empty the field, as in the Figma prototype.
- `GET /search?q=` (titles only, at most 6 films) runs 300 ms after the last keystroke
  (`useDebouncedValue`). Earlier results stay on screen while the next ones load; a skeleton shows
  only before the first results.
- The matched part of each title is white, the rest grey. Rows show "Film · 12+ · 134 min" and
  "from ₾16", or "Coming Soon" in orange. Choosing a row opens the film's page.
- Keyboard: it is an ARIA combobox. Up/Down move the highlight (the same look as hover, announced
  through `aria-activedescendant`), Enter opens the highlighted film, Escape closes.
- The prompt says "Search by title" instead of Figma's "title, director or cast", because the API only
  matches titles.

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
    `tint-white`, `tint-red`, `tint-green`, `tint-orange`, `shadow`, `black` (Figma's image and navbar
    gradients)
  - Text styles (size + line height + weight in one class): `text-display`, `text-h1`, `text-h2`,
    `text-h3`, `text-body-l`, `text-body-m`, `text-body-s`, `text-label-m`, `text-label-s`,
    `text-overline` (6% tracking, used uppercase), `text-button`. Line heights are whole pixels
    (e.g. 12px × 1.3 → 16px), because Figma rounds every text line; fractional browser line heights
    would drift a pixel or two down long stacks such as the filter sidebar.
  - Font: Archivo (self-hosted via `@fontsource-variable/archivo`)
- **Layout target is 1920×1080.** Figma frames are 1728px wide; sizes, fonts and paddings are
  implemented 1:1 and full-width areas stretch to the viewport.
  - Page content uses `px-gutter` (51px). The navbar uses 60px, the footer 34px and the Home
    sections 70px, as in Figma.
  - The navbar is absolutely positioned over the top of every page (a transparent gradient over the
    hero), so pages without a hero start with `pt-header` (118px).
- Icons come from the Figma icon set as `<Icon name="..." />` (`shared/ui/Icon.tsx`), 16×16, drawn in
  `currentColor` so they take the surrounding text colour.
- Overlays use Radix primitives: `Modal` (Dialog: dimmed + blurred backdrop, closes on X, Escape and
  backdrop click, traps focus) and `DropdownMenu` for the account menu.
- Prefer Tailwind's spacing scale (`n × 4px`, quarter steps allowed: `pt-6.75` = 27px) over arbitrary
  `[..px]` values; use arbitrary values only off the scale (e.g. `rounded-[28px]`).
- `cn(...)` joins class names and drops falsy values. There is no class-merging library, so components
  avoid receiving utilities that conflict with their own.
- `Button` variants follow Figma: `primary` (red), `secondary` (white), `transparent` (tint, blurred
  only on hover), `outline` (Notify; an inset ring so it keeps Figma's size); colour changes fade over
  300 ms; sizes `md` / `sm`; `loading` shows a spinner and disables it. `ButtonLink` has the same look
  as a router link.
- **Scope rule:** build what the Figma screens and the brief show, nothing more. The Figma prototype's
  wiring tells us which states exist and where links go; its timings are a guide (300 ms is used for
  hover fades), and its navigation fades are not reproduced.
- Reusable visual components live in `shared/ui`; features compose them rather than restyling raw elements.

## Conventions

- Prettier: no semicolons, single quotes, trailing commas, 100-column width. Run `npm run format`.
- Components and their files are PascalCase; hooks are `useX`; other modules are camelCase.
- Comments only where they carry context the code cannot (API quirks, non-obvious constraints).
- Commits follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `build:`);
  each is one logical change.
- One branch per build step (`feat/foundation`, `feat/auth`, ...), merged into `main` through a pull
  request with a merge commit (not squashed).

## Scripts

| Script                            | Purpose                             |
| --------------------------------- | ----------------------------------- |
| `npm run dev`                     | Dev server on http://localhost:5173 |
| `npm run build`                   | Type-check and production build     |
| `npm run lint`                    | oxlint                              |
| `npm run format` / `format:check` | Prettier write / check              |
| `npm run typecheck`               | TypeScript only                     |
