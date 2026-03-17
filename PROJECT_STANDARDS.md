# Project Standards

## Purpose

This file defines the agreed tooling and working rules for the NASA web app so implementation stays consistent across frontend, backend, testing, logging, and future tasks. It also serves as the primary context document for AI-assisted development — the agent reads this file to stay aligned with project decisions and working style.

## Project Structure

- `frontend/`: React + Vite + TypeScript + Tailwind CSS
- `backend/`: Node.js + Express + TypeScript
- Root repository: shared repo-level files such as `.gitignore`, `README.md`, and project standards

### Frontend Structure

```text
frontend/src/
├── assets/         # static assets (logo, images)
├── components/     # UI components grouped by feature (Header/, Footer/, Apod/)
├── content/        # route/content configuration and shared static copy
├── context/        # React context providers (ThemeContext)
├── hooks/          # custom React hooks (useApod, useGridSize)
├── lib/            # shared utilities (api client, APOD helpers)
├── pages/          # route-level page components
├── test/           # shared frontend test setup and browser API mocks
├── types/          # shared TypeScript types
├── App.tsx         # root layout and routing
├── main.tsx        # entry point
└── index.css       # Tailwind imports and global styles
```

### Backend Structure

```text
backend/src/
├── config/         # environment config and constants
├── controllers/    # request handlers
├── lib/            # core libraries (logger, API error helpers)
├── middleware/     # error handler, request logger
├── routes/         # route definitions
├── services/       # business logic, NASA API communication
├── types/          # shared TypeScript types
└── index.ts        # app entry point
```

### Import Conventions

- Frontend uses `@/` path alias mapped to `src/` (e.g., `import Navbar from '@/components/Header/Navbar'`)
- Backend uses relative imports
- Sibling imports within the same feature folder use `./` (e.g., `import ThemeToggle from './ThemeToggle'`)

## Logging

### Backend

- Use `winston` for backend logging
- Use `winston-daily-rotate-file` if file rotation is needed
- Logging should cover:
  - server startup
  - incoming requests
  - handled and unhandled errors
  - external NASA API failures
  - unexpected edge-case failures

### Frontend

- Keep frontend logging lightweight
- Prefer clear error handling and development-only console diagnostics over heavy logging infrastructure
- Avoid noisy logs in production

## Testing Strategy

### Frontend Testing

- Test runner: `vitest`
- UI/component testing: `@testing-library/react`
- DOM assertions: `@testing-library/jest-dom`
- User interaction testing: `@testing-library/user-event`
- Browser-like test environment: `jsdom`

Use frontend tests for:

- component rendering
- interaction behavior
- loading, error, and empty states
- utility behavior where relevant

### Backend Testing

- Test runner: `jest`
- API/integration testing: `supertest`
- TypeScript support: `ts-jest`

Use backend tests for:

- route behavior
- controller/service behavior
- request validation
- API error handling
- NASA integration edge cases where practical

### End-to-End

- End-to-end testing tool: `@playwright/test`

Use Playwright for:

- full user flows across frontend and backend
- high-value journeys only
- final integration confidence before submission

## Color Palette

Prefer Tailwind's built-in palette and use custom gradient/alpha values sparingly for backgrounds, glow, or atmospheric effects. Stay consistent with these core colors across the app:

- **Primary (Blue):** `blue-600` for actions, `blue-500` for hover, `blue-400` for dark mode accents
- **Accent (Amber):** `amber-500` / `amber-400` for highlights, badges, and secondary emphasis
- **Dark theme:** `slate-950` background, `slate-900` cards/header, `slate-800` borders, `white` / `slate-300` text
- **Light theme:** `slate-50` background, `white` cards/header, `slate-200` borders, `slate-900` / `slate-600` text

Theme is toggled via Tailwind's `dark:` variant with a `dark` class on `<html>`.

## Code Style

- Prefer self-documenting code — use clear, consistent naming for variables, functions, and components
- Only add comments to explain _why_, not _what_
- Avoid redundant or obvious comments
- Prettier is formatting-only and is the source of truth for code formatting
- Run `npm run format` locally before commit when formatting has drifted
- CI enforces `npm run format:check` before lint/test jobs

## Accessibility & Semantic HTML

- Use semantic elements (`<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`) over generic `<div>`s
- All interactive elements must be keyboard accessible
- Icon-only buttons must have `aria-label`
- Images must have meaningful `alt` text
- Color contrast must meet WCAG AA minimum

## TypeScript Standards

- Use strict TypeScript throughout — avoid `any` wherever possible
- Prefer explicit types over inferred where it aids readability
- Do not use duplicate or redundant type assertions
- If `any` is genuinely unavoidable (e.g. browser/window APIs, incomplete third-party types), suppress with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` and a brief comment explaining why

## Frontend Link Rules

- All external links in the app must use `target="_blank" rel="noopener noreferrer"`
- Internal navigation links do not need `target="_blank"`
- This does not apply to README.md — GitHub renders markdown in its own context where same-tab behaviour is standard

## Responsive Payload Strategy

### APOD

| Breakpoint    | Grid columns | First load | Load more |
| ------------- | ------------ | ---------- | --------- |
| All           | —            | 21         | —         |
| Small screens | 1-2          | —          | 8         |
| Tablet        | 3            | —          | 12        |
| Desktop       | 4            | —          | 20        |

- **First load is always 21** — hardcoded to avoid delaying the API request while waiting for client-side viewport detection
- **Load-more is responsive** — `useGridSize` hook detects the current breakpoint and returns `pageSize` for subsequent batches
- `pageSize` is stored in a ref to prevent viewport resizes from triggering data refetches

### NASA Image Library & EPIC

- NASA Image Library uses server-side pagination (page number forwarded to NASA API)
- EPIC returns all images for a given date in a single response — no client-side pagination

### Shared

- Skeleton counts match the expected item count to prevent layout shift
- Frontend uses `AbortController` in data-fetching effects to cancel duplicate requests (React StrictMode)
- Home, Wonders shell, and Wonders hub are eager-loaded; NASA-backed feature routes remain lazy-loaded
- Lazy route fallbacks should mirror the final layout closely enough to avoid visible page jumps
- Mobile date-filter UIs may collapse non-primary presets into a compact overflow control when full chip rows become cramped

## Working Rules

- Backend owns NASA API communication
- Frontend communicates with backend, not directly with NASA as the main integration path
- New features should include corresponding tests where appropriate
- Loading, error, and empty states must be handled deliberately
- Use skeleton components for loading states — skeletons must mirror the real component's DOM structure and dimensions to prevent layout shift
- Backend errors should use the shared `{ error, code, status }` response shape
- Keep implementation simple, readable, and explainable
- Avoid overengineering early

## AI-Assisted Workflow

This project is built iteratively with a structured multi-tool AI workflow:

| Tool              | Role                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| **Codex**         | High-volume generation — scaffolding, boilerplate, initial implementation drafts |
| **ChatGPT (web)** | Context shaping, thinking through architecture, quick lookups                    |
| **Claude Code**   | Review layer — questioning choices, catching gaps, keeping standards             |
| **Developer**     | Final decision maker — approving, rejecting, directing all of the above          |

The following rules govern how the AI agent should operate:

- The developer leads — the agent does not decide what to build next
- One step at a time — do not implement multiple features in a single response without explicit instruction
- Every choice must be explainable — prefer approaches the developer can justify in a technical interview
- Do not over-engineer or add features beyond what is asked
- Flag gaps or issues clearly, but do not fix them without confirmation
- When multiple valid approaches exist, present the options briefly rather than picking silently

## Commit Style

Use clear, small commits with conventional prefixes where appropriate:

- `chore`: setup, scaffolding, tooling, configuration
- `feat`: new functionality
- `fix`: bug fixes
- `test`: test additions or test refactors
- `docs`: documentation-only changes

## Caching & Performance

All four backend feature services share these resilience patterns:

- **In-flight request deduplication** — concurrent requests for the same key share a single HTTP call
- **Retry with backoff** — transient NASA errors (500, 502, 503, 504) are retried up to 3 times with increasing delays (1 s, 2 s)
- **Failure cooldown** — after retries are exhausted, the same key is blocked from re-fetching for 10 minutes to avoid hammering a failing upstream
- Cache resets on server restart — acceptable for this project's scale

### APOD caching

- Past dates are cached permanently (APOD data is immutable once published)
- Today's date is cached until midnight UTC rollover (APOD publishes once daily)
- **Partial cache fetch** — when a range request includes cached and uncached dates, only the uncached dates are fetched from NASA
- **Startup prefetch** — backend warms the cache on boot by fetching the latest 26 days in the background
- On NASA API failure for a range, any already-cached items in that range are still returned

### NASA Image Library caching

- Search results are cached by query + filters + page number
- Cache does not expire (search results are stable) — on fetch failure after cache miss, a 502 error is returned directly

### EPIC caching

- Dated image requests are cached permanently; "latest" (no date) requests are cached until midnight UTC rollover
- Date lists are cached until midnight UTC rollover
- Empty image responses are not cached (allows retry on next request)
- **Stale fallback** — when NASA fails after cache expiry, stale cached images and dates are served instead of erroring

## Decision Notes

- Frontend uses plain React with Vite, not Next.js
- Frontend routing uses `react-router-dom`
- Backend logging uses `winston`
- Frontend testing uses `Vitest` + React Testing Library
- Backend testing uses `Jest` + `Supertest`
- End-to-end testing uses `Playwright`
- Formatting uses root-level `Prettier`
- Backend follows route → controller → service pattern
- Backend CORS supports comma-separated origins via `FRONTEND_ORIGIN`
- Frontend uses `@/` path alias for imports
- Icons use `lucide-react`
