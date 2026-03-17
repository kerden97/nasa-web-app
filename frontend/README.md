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
- `/asteroid-watch` — NeoWs asteroid tracking and visualization

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

## Interaction Notes

- The homepage and Wonders hub are treated as presentation-first routes, so they avoid lazy-route suspense overhead
- APOD and EPIC use compact mobile preset controls instead of rendering the full preset chip wall on narrow screens
- Route changes scroll to the top of the new page
- Dark-theme flash on refresh is prevented by an early theme boot step in `index.html`

## Notes

- The root [`README.md`](../README.md) is the primary setup and deployment document.
- Frontend-specific testing notes live in [`TESTING.md`](./TESTING.md).
