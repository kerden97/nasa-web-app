# Backend Testing

## Stack

| Tool      | Purpose                               |
| --------- | ------------------------------------- |
| Jest      | Test runner                           |
| ts-jest   | TypeScript compilation for Jest       |
| Supertest | HTTP-level assertions against Express |

## Running Tests

```bash
cd backend
npm test
```

## Test Files

Tests are co-located next to their source files:

```text
backend/src/
├── controllers/
│   ├── apod.ts
│   ├── apod.test.ts
│   ├── nasaImage.ts
│   ├── nasaImage.test.ts
│   ├── epic.ts
│   └── epic.test.ts
├── services/
│   ├── apod.ts
│   ├── apod.test.ts
│   ├── nasaImage.ts
│   ├── nasaImage.test.ts
│   ├── epic.ts
│   └── epic.test.ts
```

These backend tests are intentionally split into:

- controller tests for validation and HTTP response behavior
- service tests for caching, retries, cooldowns, deduplication, and response mapping

## Controller Tests — APOD (`controllers/apod.test.ts`)

These are HTTP-level tests. The service layer is mocked with `jest.mock()` — the controller is tested in isolation for input validation and response mapping.

**Setup pattern:**

- A fresh Express app is created per test via `createApp()` — mounts the APOD routes and the global error handler
- `fetchApod` is mocked so no real NASA calls are made
- `jest.clearAllMocks()` runs in `beforeEach`

**What is covered:**

| Test                              | Validates                                                  |
| --------------------------------- | ---------------------------------------------------------- |
| Valid single-date request         | 200 + correct body + correct args passed to service        |
| Invalid date format               | 400 — wrong format like `11-03-2026`                       |
| Invalid start_date format         | 400 — slash-separated like `2026/03/01`                    |
| Invalid end_date format           | 400 — slash-separated like `2026/03/99`                    |
| Impossible calendar date          | 400 — `2026-02-31` caught by UTC round-trip validation     |
| Valid count                       | 200 + parsed integer passed to service                     |
| Count = 0                         | 400 — below minimum                                        |
| Count = 101                       | 400 — above maximum                                        |
| Non-numeric count                 | 400 — `abc` rejected by regex                              |
| Partially numeric count           | 400 — `10abc` rejected (not silently parsed by `parseInt`) |
| Decimal count                     | 400 — `20.5` rejected by integer-only regex                |
| end_date + count (load-more)      | 200 + both params forwarded to service                     |
| Valid date range                  | 200 + start_date and end_date forwarded to service         |
| Conflicting params (date + count) | 400 — date cannot combine with other query modes           |
| start_date > end_date             | 400 — invalid range ordering                               |
| NASA service failure              | 502 — error message containing "NASA API" mapped to 502    |
| Unexpected error                  | 500 — delegated to global error handler                    |

## Service Tests — APOD (`services/apod.test.ts`)

These are unit tests against the service's caching, retry, and deduplication logic. `global.fetch` is mocked directly — no HTTP server is involved.

**Setup pattern:**

- `jest.resetModules()` in `beforeEach` — the service holds module-level state (cache maps, in-flight promises, cooldown tracker). Without this, state leaks between tests and produces false passes or flaky failures.
- `jest.useFakeTimers()` + `jest.setSystemTime()` — the cache distinguishes "today" from past dates for date-rollover invalidation, and retry logic uses timed delays. Fake timers make these deterministic.
- Dynamic `import("./apod")` after module reset — gets a fresh `fetchApod` with clean state each time.

**What is covered:**

| Test                             | Validates                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| Cache hit (past date)            | Second call for same past date returns cached data — `fetch` called once                           |
| Exact count                      | `count` param returns exactly the requested number of items                                        |
| end_date + count                 | Load-more pattern returns correct slice                                                            |
| Today cache (same day)           | Today's APOD is cached and served without re-fetch within the same UTC day                         |
| UTC midnight rollover            | Same date re-requested after midnight triggers a fresh fetch (today's cache invalidated)           |
| In-flight deduplication          | Two concurrent requests for the same date share one `fetch` call                                   |
| Cooldown after repeated failures | After 3 retries fail, immediate re-request is blocked without hitting NASA                         |
| Range fallback                   | When NASA fails for uncached dates in a range, any already-cached items in that range are returned |
| Retry with backoff               | Transient 500/503 errors are retried up to 3 times and succeed on the third attempt                |

## Controller Tests — NASA Image Library (`controllers/nasaImage.test.ts`)

These are HTTP-level tests for the NASA Image Library search endpoint. The service layer is mocked — the controller is tested for input validation, parameter forwarding, and error mapping.

**What is covered:**

| Test                    | Validates                                                 |
| ----------------------- | --------------------------------------------------------- |
| Valid search query      | 200 + results returned + correct args passed to service   |
| Missing query           | 400 — `q` parameter is required                           |
| Empty query             | 400 — empty string rejected                               |
| Whitespace-only query   | 400 — whitespace-only string rejected                     |
| Query over 200 chars    | 400 — length limit enforced                               |
| Valid media_type filter | 200 + media_type forwarded to service                     |
| Invalid media_type      | 400 — only image, video, audio accepted                   |
| Valid year range        | 200 + year_start and year_end forwarded                   |
| Invalid year_start      | 400 — non-four-digit year rejected                        |
| Invalid year_end        | 400 — non-four-digit year rejected                        |
| year_start > year_end   | 400 — invalid year range ordering                         |
| Valid page parameter    | 200 + parsed page number forwarded to service             |
| All valid filters       | 200 + all validated filters forwarded together            |
| Non-numeric page        | 400 — `abc` rejected                                      |
| Page = 0                | 400 — zero rejected                                       |
| NASA service failure    | 502 — error containing "NASA Image Library" mapped to 502 |
| Unexpected error        | 500 — delegated to global error handler                   |
| Query trimming          | Leading/trailing whitespace stripped before forwarding    |

## Service Tests — NASA Image Library (`services/nasaImage.test.ts`)

These are unit tests for the NASA Image Library service's search, mapping, and caching logic. `global.fetch` is mocked directly.

**What is covered:**

| Test                             | Validates                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| Search result mapping            | API response items mapped to `NasaImageItem` with correct fields                              |
| Asset manifest mapping           | `entry.href` mapped to `asset_manifest_url` when present                                      |
| Cache hit                        | Second identical query returns cached data — `fetch` called once                              |
| Separate cache (query)           | Different search terms get separate cache entries                                             |
| Separate cache (page)            | Same query on different pages gets separate cache entries                                     |
| URL parameter forwarding         | media_type, year_start, year_end included in fetch URL                                        |
| Retry with backoff               | Transient 500/502/503/504 errors are retried up to 3 times and may succeed on a later attempt |
| Retry exhaustion                 | Persistent transient failures throw after max retries                                         |
| Non-transient error              | 400-type responses are not retried                                                            |
| In-flight deduplication          | Concurrent identical searches share one `fetch` call                                          |
| Cooldown after repeated failures | Immediate re-request is blocked without hitting NASA                                          |
| Empty data filtering             | Items with no `data` entries are filtered out                                                 |
| Missing preview links            | Items without preview links get empty string for `href`                                       |

## Controller Tests — EPIC (`controllers/epic.test.ts`)

These are HTTP-level tests for both EPIC endpoints (`/api/epic` and `/api/epic/dates`). Both service functions are mocked.

**What is covered (getEpicImages):**

| Test                            | Validates                                                   |
| ------------------------------- | ----------------------------------------------------------- |
| Default natural                 | 200 + images returned + service called with `natural`       |
| Collection + date params        | Both parameters forwarded to service                        |
| Invalid collection              | Defaults to `natural` instead of rejecting                  |
| Invalid collection + valid date | Defaults to `natural` while still forwarding the valid date |
| Invalid date format             | 400 — non-YYYY-MM-DD format rejected                        |
| Date with extra chars           | 400 — datetime-like strings rejected                        |
| Impossible calendar date        | 400 — `2026-02-31` rejected by UTC round-trip validation    |
| NASA service failure            | 502 — error containing "NASA EPIC" mapped to 502            |
| Unexpected error                | 500 — delegated to global error handler                     |

**What is covered (getEpicDates):**

| Test                 | Validates                                            |
| -------------------- | ---------------------------------------------------- |
| Natural dates        | 200 + dates returned + service called with `natural` |
| Enhanced collection  | `enhanced` forwarded to service                      |
| Invalid collection   | Defaults to `natural`                                |
| NASA service failure | 502 — error containing "NASA EPIC" mapped to 502     |
| Unexpected error     | 500 — delegated to global error handler              |

## Service Tests — EPIC (`services/epic.test.ts`)

These are unit tests for the EPIC service's image fetching, URL building, date listing, and caching logic. `global.fetch` is mocked directly.

**What is covered (fetchEpicImages):**

| Test                            | Validates                                                     |
| ------------------------------- | ------------------------------------------------------------- |
| Image mapping + URL building    | API items mapped with correct archive image URLs              |
| Enhanced collection URLs        | Image URLs use `/enhanced/` path segment                      |
| Date path appended              | Date parameter adds `/date/YYYY-MM-DD` to API URL             |
| Cache hit (dated request)       | Second identical dated request returns cached data            |
| Cache hit (latest request)      | Latest request is cached and reused within the same UTC day   |
| Latest cache invalidation       | Latest request re-fetches after UTC midnight rollover         |
| Stale latest-image fallback     | Stale latest images are served when NASA fails after rollover |
| Empty results not cached        | Empty responses are not cached (allows retry)                 |
| Separate cache (collection)     | Different collections get separate cache entries              |
| Retry with backoff              | Transient 500/502/503/504 errors are retried and can succeed  |
| Retry exhaustion                | Persistent transient failures throw after max retries         |
| In-flight deduplication         | Concurrent identical image requests share one `fetch` call    |
| Cooldown after repeated failure | Immediate re-request is blocked without hitting NASA          |
| Non-transient error             | 400-type responses are not retried                            |

**What is covered (fetchEpicDates):**

| Test                            | Validates                                                      |
| ------------------------------- | -------------------------------------------------------------- |
| Date sorting                    | Dates returned in reverse chronological order                  |
| Cache hit                       | Second identical request returns cached data                   |
| UTC midnight rollover           | Dates cache invalidates after UTC day change                   |
| Separate cache (collection)     | Different collections get separate cache entries               |
| Retry with backoff              | Transient failures are retried and can succeed                 |
| Retry exhaustion                | Persistent transient failures throw after max retries          |
| In-flight deduplication         | Concurrent identical date requests share one `fetch` call      |
| Stale fallback after rollover   | Stale cached dates are returned when NASA fails after rollover |
| Cooldown after repeated failure | Immediate re-request is blocked without hitting NASA           |
| Non-retryable API error         | Non-OK responses outside the retry set throw immediately       |

## Key Patterns and Gotchas

### Why `jest.resetModules()` + dynamic import?

The service uses module-level `Map` objects for caching and deduplication. Without resetting modules between tests, cached data from one test leaks into the next. Static imports would bind to the original module instance and ignore the reset.

### Why fake timers?

Three service behaviors depend on wall-clock time:

1. **Today's cache validity** — ends at UTC midnight rather than after a fixed duration
2. **Retry delays** — linear backoff (1s, then 2s) between retry attempts
3. **Cooldown window** — suppresses new NASA requests for a period after repeated failures

Fake timers let tests advance time precisely without waiting.

### Why `.catch()` before `advanceTimersByTimeAsync()`?

When a mocked fetch is configured to fail, the retry delay remains pending on a timer. If `jest.advanceTimersByTimeAsync()` advances that timer and the promise rejects before the test attaches `await` or `try/catch`, Node can emit a `PromiseRejectionHandledWarning`. Attaching `.catch()` eagerly before advancing timers prevents this.

```typescript
// Correct — capture rejection before advancing
const promise = fetchApod({ date: '2026-03-09' }).catch((e: Error) => {
  firstError = e
})
await jest.advanceTimersByTimeAsync(1000)
await promise
```

### Why `createApp()` per test in controller tests?

Supertest needs an Express app to make requests against. Creating a fresh app per test keeps route and middleware setup isolated and avoids accidental shared app state across tests.

### Why mock the service in controller tests?

The controller tests are meant to verify request parsing, validation, status codes, and error mapping. Mocking the relevant service function keeps them focused on controller behavior and avoids coupling them to service-layer caching and retry logic.

### Strict count validation

The controller uses `/^\d+$/.test(count)` instead of `parseInt()`. This matters because `parseInt("10abc")` returns `10` and `parseInt("20.5")` returns `20` — both would silently pass range validation. The regex rejects anything that isn't a pure integer string.

### UTC date validation

`new Date("2026-02-31")` doesn't throw — JavaScript normalises it to March 3rd. The controller validates dates by parsing the year/month/day components, constructing a `Date` via `Date.UTC()`, and checking that the resulting UTC components match the input. This catches impossible calendar dates.
