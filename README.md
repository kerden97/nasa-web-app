# NASA Web App

## Product Overview

This project is a React + Node/Express NASA data explorer built around four experiences:

- APOD — featured daily imagery plus a recent archive
- NASA Image Library — searchable media archive with media-type filtering
- EPIC — full-disk Earth imagery with date presets and collection switching
- Asteroid Watch — NeoWs-based dashboard with summary stats, charts, a sortable table, and an AI-assisted Radar Brief

The app is intentionally split into:

- a static presentation layer for the landing and Wonders hub routes
- lazy-loaded data routes for the NASA-backed feature pages
- an Express backend that validates requests, talks to NASA, and shields the frontend from upstream quirks

## Architecture

### Frontend

- Routing: `react-router-dom`
- Entry routes:
  - `/` — Home & Beyond landing page
  - `/wonders-of-the-universe` — Wonders shell + hub
  - `/wonders-of-the-universe/apod`
  - `/wonders-of-the-universe/nasa-image-library`
  - `/wonders-of-the-universe/epic`
  - `/asteroid-watch`
- Loading strategy:
  - `HomePage`, `WondersPage`, and `WondersHubPage` are eager-loaded because they are mostly static and part of the primary navigation flow
  - `ApodPage`, `NasaImagePage`, `EpicPage`, and `AsteroidWatchPage` remain lazy-loaded
  - route fallbacks for lazy routes are shaped to mirror the real layouts and reduce layout shift
- Static-content strategy:
  - homepage card/stat content is extracted into `frontend/src/content/`
  - Wonders destination metadata is centralized in `frontend/src/lib/wondersUi.ts`
- Shared UX patterns:
  - route changes scroll to top
  - error states use one shared inline error notice
  - homepage images use eager vs lazy loading based on page priority
  - APOD and EPIC use compact mobile preset controls to avoid overcrowded filter bars

### Backend

- Structure: route -> controller -> service
- Controllers handle:
  - query validation
  - HTTP status selection
  - user-facing error payloads
- Services handle:
  - NASA API calls
  - response mapping
  - retry/backoff for transient upstream failures
  - in-flight request deduplication
  - cache and cooldown behavior
  - durable Redis-backed response persistence in production
- APOD includes an extra safeguard for "latest" requests:
  - if NASA has not published the newest day yet, the service falls back to the most recent available APOD instead of failing the UI

## API Contract

The frontend talks to the backend for application data and NASA API access. Original full-detail
media assets may still be loaded from NASA-hosted URLs when opened in the UI.

Current backend routes:

- `GET /healthz`
- `GET /api/health`
- `GET /api/apod`
- `GET /api/apod/image`
- `GET /api/nasa-image`
- `GET /api/nasa-image/assets`
- `GET /api/nasa-image/image`
- `GET /api/epic`
- `GET /api/epic/dates`
- `GET /api/epic/image`
- `GET /api/neows/feed`
- `GET /api/neows/radar-brief`

Backend error responses, including unknown-route 404s, are standardized as:

```json
{
  "error": "Human-readable message",
  "code": "stable_error_code",
  "status": 400
}
```

Status-code policy:

- `400` — invalid user input or invalid filter combinations
- `404` — unknown backend route
- `502` — NASA/upstream temporary failure
- `500` — unexpected internal server failure

## Caching Strategy

The app now uses two cache layers:

- Frontend persisted stale cache for high-value revisit flows:
  - APOD latest feed
  - EPIC dates and date-specific image sets
  - Asteroid Watch date-range feeds
- Backend cache layers:
  - in-memory cache and in-flight deduplication inside each NASA service
  - durable Upstash Redis response cache in production

Why both:

- frontend cache improves repeat visits and can render stale data immediately while the backend wakes up
- Redis survives Render cold boots and helps first-time visitors too
- local in-memory cache still keeps hot-process reads fast and preserves the existing stale-fallback logic

## Live Deployment

| Service        | Platform | URL                                                                                      |
| -------------- | -------- | ---------------------------------------------------------------------------------------- |
| Frontend       | Vercel   | [nasa-web-app-iota.vercel.app](https://nasa-web-app-iota.vercel.app)                     |
| Backend        | Render   | [nasa-web-app-lv7c.onrender.com](https://nasa-web-app-lv7c.onrender.com)                 |
| Backend Health | Render   | [nasa-web-app-lv7c.onrender.com/healthz](https://nasa-web-app-lv7c.onrender.com/healthz) |

> Note: The Render free tier spins down after inactivity. The first request after idle may take up to 50 seconds.

## Deployment Setup

### Backend (Render)

- Platform: Render Web Service (Free tier)
- Region: Frankfurt (EU Central)
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Health Check Path: `/healthz`
- Auto-Deploy: after CI checks pass on `main`

Required environment variables on Render:

```env
NASA_API_KEY=
NASA_API_BASE_URL=
PORT=4000
FRONTEND_ORIGIN=https://nasa-web-app-iota.vercel.app
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ENABLE_REDIS_CACHE=true
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### Frontend (Vercel)

- Platform: Vercel (Hobby)
- Root Directory: `frontend`
- Framework Preset: Vite
- Auto-Deploy: on commit to `main`
- Only the known SPA routes rewrite to `index.html`; unknown frontend URLs return an HTTP `404`
  and serve the custom static `404.html` page on direct requests

Required environment variables on Vercel:

```env
VITE_API_URL=https://nasa-web-app-lv7c.onrender.com
```

## Local Setup

Two options: Docker Compose (recommended) or manual.

### Option 1: Docker Compose

#### Prerequisites

- Windows / Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Linux: Docker Engine via CLI (`sudo apt install docker.io docker-compose-plugin`)

From the repository root:

```bash
docker compose up -d
```

Available local endpoints:

- Frontend dev server: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Backend health check: `http://localhost:4000/healthz`
- Nginx entrypoint: `http://localhost:8080`
- Nginx health check: `http://localhost:8080/healthz`

Notes:

- `http://localhost:3000` works through the frontend Vite dev server, which proxies `/api` and `/healthz` to the backend container
- `http://localhost:8080` works through Nginx, which proxies frontend traffic to Vite and backend traffic to Express

To stop containers:

```bash
docker compose down
```

### Option 2: Manual Setup

This project uses Node.js v24.x (see `backend/package.json` engines field). Other versions may work but are untested.

#### 1. Set up environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in `backend/.env` with your NASA API key.

For local frontend development, you can leave `frontend/.env` exactly as copied from the example. By default:

- the browser uses the current origin as the API base
- the Vite dev server proxies `/api` and `/healthz` to `http://localhost:4000`

Only set `VITE_API_URL` when you explicitly want the frontend to call a different-origin backend directly. Example:

```env
VITE_API_URL=http://localhost:4000
```

If you keep `VITE_API_URL` blank, the Vite proxy target can still be customized if needed:

```env
VITE_DEV_PROXY_TARGET=http://localhost:4000
```

For local backend development, leave Redis disabled:

```env
ENABLE_REDIS_CACHE=false
```

This avoids stale-data confusion while iterating locally.

#### 2. Install dependencies

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

#### 3. Run backend

```bash
cd backend && npm run dev
```

#### 4. Run frontend (in a separate terminal)

```bash
cd frontend && npm run dev
```

Available local endpoints:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Backend health check: `http://localhost:4000/healthz`

The frontend route works without extra CORS setup because the local Vite server proxies `/api` and `/healthz` to the backend by default.

## Formatting

Formatting is handled centrally at the repository root with Prettier.

Format all supported files:

```bash
npm run format
```

Check formatting without rewriting files:

```bash
npm run format:check
```

## Coverage

Coverage is enforced mechanically for the backend and frontend. The thresholds are intended to stop regression, not to encourage low-value test padding.

Useful commands:

```bash
npm run test:coverage
cd backend && npm run test:coverage
cd frontend && npm run test:coverage
```

Current enforced thresholds:

- Backend: `80% statements`, `68% branches`, `75% functions`, `82% lines`
- Frontend: `75% statements`, `62% branches`, `71% functions`, `78% lines`

Current measured baselines used to set those gates:

- Backend: `83.45% statements`, `69.60% branches`, `78.32% functions`, `85.38% lines`
- Frontend: `75.84% statements`, `62.78% branches`, `71.62% functions`, `78.08% lines`

## CI/CD

GitHub Actions runs on every push to `main` and on pull requests:

- **Format Check** — `npm run format:check` at the repo root
- **Backend Coverage Gate** — `npm run test:coverage` (Jest) in `backend/`
- **Backend Test Typecheck** — `npm run typecheck:tests` in `backend/`
- **Frontend Coverage Gate** — `npm run test:coverage` (Vitest) in `frontend/`
- **Frontend Test Typecheck** — `npm run typecheck:tests` in `frontend/`
- **Frontend Build** — `npm run build` in `frontend/`
- **E2E Smoke Tests** — `npm run test:e2e` (Playwright) at the repo root

Formatting is enforced before backend/frontend jobs run. Backend and frontend verification now include coverage thresholds, so coverage is a real CI gate rather than a manual judgment call. The Playwright job runs after backend and frontend verification complete, starts a local mock NASA server plus the real frontend and backend, and exercises a live frontend-to-backend integration smoke layer alongside a smaller mocked UI smoke layer. Render (backend) is configured to deploy only after CI checks pass. Vercel (frontend) deploys on every push independently.

Workflow file: `.github/workflows/ci.yml`

## Current Stack

### Frontend

- React
- React Router
- Vite
- TypeScript
- Tailwind CSS
- Lucide React
- ESLint
- Vitest
- React Testing Library
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jsdom`

### Backend

- Node.js
- Express
- TypeScript
- Nodemon
- Jest
- Supertest
- Winston
- `winston-daily-rotate-file`
- `dotenv`
- `helmet`
- `cors`
- `compression`

### Root / General

- Docker Compose
- Nginx
- Playwright
- Prettier

## Testing Snapshot

- Frontend:
  - Vitest + React Testing Library for route, component, and utility coverage
  - targeted regressions for header/mobile-menu behavior, route fallbacks, and loading-state UX
  - coverage thresholds enforced in CI
- E2E:
  - Playwright live integration coverage for homepage -> APOD navigation through the real backend
  - Playwright live integration coverage for Asteroid Watch feed loading and Radar Brief generation through the real backend
  - Playwright mocked smoke coverage for stable UI-only route flows where deterministic fixtures are more valuable than external integration
- Backend:
  - Jest + Supertest for controller and service coverage
  - controller tests assert validation, status codes, and structured error payloads
  - service tests cover caching, retries, cooldowns, deduplication, and fallback behavior
  - coverage thresholds enforced in CI

Detailed testing notes live in:

- [frontend/TESTING.md](./frontend/TESTING.md)
- [backend/TESTING.md](./backend/TESTING.md)

## Security — OWASP Top 10 (2025)

The codebase was audited against the [OWASP Top 10 2025](https://owasp.org/Top10/2025/) checklist. The table below summarizes the status of each category and what is in place.

| #   | Category                             | Status | What is in place                                                                                                           |
| --- | ------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| A01 | Broken Access Control                | Pass   | API routes are scoped per resource; no elevation or bypass vectors                                                         |
| A02 | Cryptographic Failures               | Pass   | Explicit CSP directives via Helmet; HSTS with 2-year max-age, includeSubDomains, and preload                               |
| A03 | Injection                            | Pass   | Zod validation on every inbound query; no raw SQL or shell execution; user input is never interpolated into upstream calls |
| A04 | Insecure Design                      | Pass   | API keys are server-side only (`.env`, gitignored); secrets never reach the client bundle                                  |
| A05 | Security Misconfiguration            | Pass   | Helmet sets CSP, HSTS, Referrer-Policy, X-Content-Type-Options, X-Frame-Options; CORS allowlists frontend origins only     |
| A06 | Vulnerable and Outdated Components   | Pass   | Dependencies are up to date; no known advisories                                                                           |
| A07 | Identification and Authentication    | N/A    | No user authentication; the app uses a single server-side NASA API key                                                     |
| A08 | Software and Data Integrity Failures | Pass   | CSP `script-src 'self'` restricts script origins; `object-src 'none'` blocks plugin-based vectors                          |
| A09 | Security Logging and Monitoring      | Pass   | Winston request/error logging with daily rotation; no sensitive data in logs; structured error payloads hide internals     |
| A10 | Server-Side Request Forgery (SSRF)   | Pass   | Image proxy endpoints validate URLs against an allowlist of NASA domains before forwarding                                 |

Additional hardening already present:

- `express-rate-limit` — 100 requests per minute per IP on `/api`
- `compression` — gzip/brotli responses
- Standardized error payloads — no stack traces or internal details leak to the client
- `crossOriginResourcePolicy: 'cross-origin'` — allows proxied images to load cross-origin

# Decisions

I considered modern package-manager options including `pnpm`. For this project, I kept `npm` because it was sufficient for the repository size, aligned cleanly with the existing `Node.js + Express` stack, and minimized setup, CI, and deployment friction for the assessment. If the repository evolved into a larger multi-package workspace, `pnpm` would be the most likely next step.

I considered using a client-side query library such as TanStack Query. For this project, I kept data fetching in feature-specific hooks over a shared API client because the backend already centralizes caching, retries, deduplication, and error normalization. Given the scope of the assessment, this kept the frontend data layer explicit and easier to reason about. If the frontend grew into a larger multi-view application with more shared query state, TanStack Query would be a strong next step.

I added a durable Redis cache through Upstash in production, while keeping Redis disabled by default in local development. That split keeps reviewer-facing cold starts and repeat fetches faster without introducing stale-data friction during day-to-day local work. Because the backend is hosted in Frankfurt, Redis was placed in Frankfurt too so cache reads stay close to the server rather than the browser.

For APOD, EPIC, and Asteroid Watch, I also added a persisted client-side stale cache on top of the backend cache. The goal was not to replace the backend, but to improve repeat-visit UX: render the last known good payload immediately, then revalidate in the background. This is especially useful when the backend is waking from a free-tier cold start.

The `Radar Brief` feature uses `gpt-4o-mini` rather than `gpt-5-nano` because `gpt-5-nano` frequently exhausted the request’s output budget on reasoning before producing the final structured JSON, while `gpt-4o-mini` returned reliable low-latency structured summaries for this use case.

The Mars Rover Photos API was not included because NASA has retired and archived the endpoint — it no longer returns live data.

### Performance and Delivery Decisions

- Card preview images for APOD, EPIC, and NASA Image are served through backend proxy/optimization routes to reduce payload size and improve mobile loading.
- Full-detail modal views keep original upstream assets when higher fidelity is more valuable than aggressive compression.
- Heavy UI paths such as media modals and asteroid charts are lazy-loaded so they do not inflate the initial route cost.
- Repeated fetches are reduced with persisted client cache on the frontend and cached API responses on the backend.
- Runtime API boundaries use Zod validation to keep request/response handling consistent and safer across frontend and backend.
