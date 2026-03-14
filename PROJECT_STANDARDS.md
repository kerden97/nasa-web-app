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
├── context/        # React context providers (ThemeContext)
├── hooks/          # custom React hooks (useApod, useGridSize)
├── lib/            # shared utilities (api client, APOD helpers)
├── pages/          # route-level page components
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
├── lib/            # core libraries (logger)
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

UI responsiveness extends beyond layout to include data loading:

| Breakpoint    | Grid columns | First load | Load more |
| ------------- | ------------ | ---------- | --------- |
| All           | —            | 21         | —         |
| Small screens | 1-2          | —          | 8         |
| Tablet        | 3            | —          | 12        |
| Desktop       | 4            | —          | 20        |

- **First load is always 21** — hardcoded to avoid delaying the API request while waiting for client-side viewport detection
- **Load-more is responsive** — `useGridSize` hook detects the current breakpoint and returns `pageSize` for subsequent batches
- `pageSize` is stored in a ref to prevent viewport resizes from triggering data refetches
- Skeleton counts match `pageSize` to prevent layout shift
- Frontend uses `AbortController` in the data-fetching effect to cancel duplicate requests (React StrictMode)

## Working Rules

- Backend owns NASA API communication
- Frontend communicates with backend, not directly with NASA as the main integration path
- New features should include corresponding tests where appropriate
- Loading, error, and empty states must be handled deliberately
- Use skeleton components for loading states — skeletons must mirror the real component's DOM structure and dimensions to prevent layout shift
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

- Backend uses per-date in-memory cache for NASA API responses
- Past dates are cached permanently (APOD data is immutable once published)
- Today's date is cached until midnight UTC rollover (APOD publishes once daily)
- **Partial cache fetch** — when a range request includes cached and uncached dates, only the uncached dates are fetched from NASA (e.g. 1 date instead of 26)
- **In-flight request deduplication** — concurrent requests for the same NASA API URL share a single HTTP call
- **Startup prefetch** — backend warms the cache on boot by fetching the latest 26 days in the background, so the first user request is served from cache
- **Retry with backoff** — transient NASA errors (500, 502, 503, 504) are retried up to 3 times with increasing delays
- On NASA API failure, stale cached data is served as a fallback; if no cache exists, a user-friendly 502 error is returned
- Cache resets on server restart — acceptable for this project's scale

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
