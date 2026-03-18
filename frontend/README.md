# Frontend

This frontend is a React + Vite + TypeScript application for the NASA Web App.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm test -- --run
```

## Environment

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:4000
```

## Current Scope

- `/` — Home & Beyond landing page
- `/wonders-of-the-universe` — Wonders hub
- `/wonders-of-the-universe/apod` — Astronomy Picture of the Day
- `/wonders-of-the-universe/nasa-image-library` — NASA Image Library search
- `/wonders-of-the-universe/epic` — EPIC Earth imagery
- `/asteroid-watch` — NeoWs asteroid tracking, visualization, and AI-assisted Radar Brief summaries

## Frontend Architecture

- Routing lives in `src/App.tsx`
- Eager-loaded routes:
  - `HomePage`
  - `WondersPage`
  - `WondersHubPage`
- Lazy-loaded routes:
  - `ApodPage`
  - `NasaImagePage`
  - `EpicPage`
  - `AsteroidWatchPage`
- Lazy routes use route-level fallbacks that mirror the live layout to reduce layout shift
- Shared static content lives in `src/content/`
- Shared Wonders route/card metadata lives in `src/lib/wondersUi.ts`
- Shared public-facing error UI lives in `src/components/Feedback/InlineErrorNotice.tsx`
- Backend errors are normalized in `src/lib/api.ts` through a typed `ApiHttpError`
- Asteroid Watch includes a `Radar Brief` modal that requests an AI-backed summary from the backend for the selected date range

## Interaction Notes

- The homepage and Wonders hub are treated as presentation-first routes, so they avoid lazy-route suspense overhead
- APOD, EPIC, and Asteroid Watch use compact mobile preset controls instead of rendering the full preset chip wall on narrow screens
- Route changes scroll to the top of the new page
- Dark-theme flash on refresh is prevented by an early theme boot step in `index.html`

## Frontend Data Notes

- The shared API client lives in `src/lib/api.ts`
- APOD, EPIC, and Asteroid Watch use persisted stale-first client caching for repeat visits
- APOD also reuses already-loaded archive data for covered presets/ranges before refetching
- NASA Image Library remains backend-cache-first because search combinations are highly query-dependent
- The Radar Brief modal keeps a small in-session frontend cache per date range so reopening the same range does not hit the backend again immediately

## Notes

- The root [`README.md`](../README.md) is the primary setup and deployment document.
- Frontend-specific testing notes live in [`TESTING.md`](./TESTING.md).
