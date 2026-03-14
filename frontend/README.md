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
- `/wonders-of-the-universe/apod` — Astronomy Picture of the Day
- `/wonders-of-the-universe/nasa-image-library` — NASA Image Library search
- `/wonders-of-the-universe/epic` — EPIC Earth imagery

## Notes

- The root [`README.md`](../README.md) is the primary setup and deployment document.
- Frontend-specific testing notes live in [`TESTING.md`](./TESTING.md).
