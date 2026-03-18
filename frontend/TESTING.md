# Frontend Testing

## Stack

| Tool                  | Purpose                                 |
| --------------------- | --------------------------------------- |
| Vitest                | Test runner                             |
| React Testing Library | Component rendering and UI assertions   |
| jest-dom              | DOM-specific matchers                   |
| jsdom                 | Browser-like test environment for React |

## Running Tests

```bash
cd frontend
npm test -- --run
```

This document covers the frontend Vitest + React Testing Library layer. Separate Playwright smoke tests live at the repository root in `e2e/` and run through `npm run test:e2e` from the root.

## Test Files

Tests are co-located next to their source files, with shared setup under `src/test`.

```text
frontend/src/
├── components/
│   └── Apod/
│       ├── ApodCard.tsx
│       ├── ApodCard.test.tsx
│       ├── DateFilter.tsx
│       └── DateFilter.test.tsx
├── components/
│   └── Header/
│       ├── Navbar.tsx
│       └── Navbar.test.tsx
├── lib/
│   ├── apodMeta.ts
│   ├── apodMeta.test.ts
│   ├── api.ts
│   └── api.test.ts
├── pages/
│   ├── HomePage.tsx
│   ├── HomePage.test.tsx
│   ├── ApodPage.tsx
│   ├── ApodPage.test.tsx
│   ├── NasaImagePage.tsx
│   ├── NasaImagePage.test.tsx
│   ├── EpicPage.tsx
│   ├── EpicPage.test.tsx
│   ├── WondersPage.tsx
│   ├── WondersPage.test.tsx
│   ├── AsteroidWatchPage.tsx
│   └── AsteroidWatchPage.test.tsx
└── test/
    └── setup.ts
```

These frontend tests are intentionally split into:

- page tests for user-visible route behavior
- component tests for focused rendering and interaction
- utility tests for pure formatting and helper logic
- shared setup for browser API mocks and DOM matchers

## Page Tests — Home (`pages/HomePage.test.tsx`)

These are page-level rendering tests for the homepage. Because the page uses `react-router-dom` links, it is rendered inside a `MemoryRouter`.

**Setup pattern:**

- `HomePage` is rendered through a small `renderPage()` helper wrapped in `MemoryRouter`
- No hooks or async data are mocked because the page is currently static
- Assertions focus on visible content, routing targets, and document title

**What is covered:**

| Test                | Validates                                                   |
| ------------------- | ----------------------------------------------------------- |
| Document title      | `document.title` is set to `Home & Beyond` on mount         |
| Hero rendering      | Hero badge, heading, and intro copy render correctly        |
| Main CTA links      | Both homepage CTA links point to `/wonders-of-the-universe` |
| Feature cards       | APOD, NASA Image Library, EPIC, and NeoWs cards render      |
| Feature card routes | Each homepage card links to the correct destination         |

## Page Tests — Wonders (`pages/WondersPage.test.tsx`)

These are page-level rendering tests for the Wonders layout shell. Because the page uses `NavLink` and `Outlet` from `react-router-dom`, it is rendered inside a `MemoryRouter`.

**Setup pattern:**

- `WondersPage` is rendered through a `renderPage()` helper wrapped in `MemoryRouter`
- No hooks or async data are mocked because the page is a static layout shell

**What is covered:**

| Test             | Validates                                                                      |
| ---------------- | ------------------------------------------------------------------------------ |
| Document title   | `document.title` is set to `Wonders of the Universe \| Home & Beyond` on mount |
| Heading and copy | Page heading and description render correctly                                  |
| Navigation tabs  | All three tab links (APOD, NASA Image Library, EPIC) render                    |
| Tab href targets | Each tab links to the correct sub-route                                        |

## Page Tests — APOD (`pages/ApodPage.test.tsx`)

These are page-level behavior tests for the APOD route. External hooks are mocked so the page can be tested deterministically without depending on real viewport logic or the full `DateFilter` UI.

**Setup pattern:**

- `useApod` is mocked to control items, loading, errors, and pagination
- `useGridSize` is mocked so tests do not depend on real window size behavior
- `DateFilter` is mocked as a small test double so filtered-mode behavior can be triggered directly
- Skeleton components are mocked with test IDs for stable loading-state assertions
- `vi.clearAllMocks()` runs in `beforeEach`

**What is covered:**

| Test                         | Validates                                                        |
| ---------------------------- | ---------------------------------------------------------------- |
| Featured + archive rendering | First item is treated as featured, later items render in grid    |
| Document title               | Page sets `document.title` on mount                              |
| Empty state                  | No items + no error renders the empty-state message              |
| Error state                  | Hook error renders the error banner                              |
| Initial loading              | Hero skeleton + card skeletons render during first load          |
| Modal open/close             | Featured CTA opens modal and close button dismisses it           |
| Load more button click       | `loadMore` is called when the button is pressed                  |
| Load more hidden             | Button does not render when `hasMore` is false                   |
| Filtered mode layout         | Featured hero disappears and all items stay in archive grid      |
| Filter hook wiring           | Selected date is passed into `useApod` with the current pageSize |
| Filter reset                 | Reset returns page to featured layout and default hook params    |

## Page Tests — NASA Image Library (`pages/NasaImagePage.test.tsx`)

These are page-level behavior tests for the NASA Image Library route. The `useNasaImage` hook is mocked, and card, skeleton, and modal components are replaced with test doubles.

**What is covered:**

| Test                   | Validates                                                          |
| ---------------------- | ------------------------------------------------------------------ |
| Initial empty state    | Popular search suggestions render before any query is submitted    |
| Search submission      | Submitting a query displays result cards                           |
| Result count display   | Total hit count renders when results are found                     |
| Loading skeletons      | 100 skeleton cards render during the first search-loading state    |
| Error state            | Hook error renders the error banner                                |
| No-results state       | Empty search results render a no-results message                   |
| Load more button click | `loadMore` is called when the button is pressed                    |
| Load more hidden       | Button does not render when `hasMore` is false                     |
| Modal open/close       | Clicking a card opens the detail modal, close button dismisses it  |
| Suggestion pill click  | Clicking a suggestion pill triggers a search with the correct term |
| Document title         | Page sets `document.title` on mount                                |
| Media filter wiring    | Selected media type is passed into `useNasaImage`                  |
| Clear search           | Clear button resets both `searchInput` and `activeQuery`           |
| Query trimming         | Search query is trimmed before being passed into hook state        |

## Page Tests — EPIC (`pages/EpicPage.test.tsx`)

These are page-level behavior tests for the EPIC route. Both `useEpic` and `useEpicDates` hooks are mocked, and card, skeleton, and modal components are replaced with test doubles.

**Setup pattern:**

- `useEpicDates` is mocked to control available date options
- `useEpic` is mocked to control image data, loading, and errors
- Fake timers are used so date-preset logic can be tested deterministically
- Modal and card components are replaced with small test doubles

**What is covered:**

| Test                         | Validates                                                         |
| ---------------------------- | ----------------------------------------------------------------- |
| Description and date display | Page description and formatted date label render                  |
| Document title               | Page sets `document.title` on mount                               |
| Image card rendering         | EPIC cards render for returned images                             |
| Loading skeletons (images)   | Skeletons render when images are loading                          |
| Loading skeletons (dates)    | Skeletons render when dates are loading                           |
| Error state                  | Hook error renders the error banner                               |
| Empty state                  | No-imagery message renders when no images are available           |
| Collection switch            | Clicking Enhanced pill switches to enhanced collection            |
| Date preset pills            | All preset pills and Custom button render                         |
| Previous preset              | Previous preset selects the second available date                 |
| Last 7 days preset           | Closest available date is chosen for the 7-day preset             |
| Custom date picker           | Clicking Custom shows the date dropdown                           |
| Custom date selection        | Changing the dropdown updates the selected date                   |
| Collection reset behavior    | Switching collection resets back to the latest available date     |
| Modal open/close             | Clicking a card opens the detail modal, close button dismisses it |
| Default date selection       | Hook is called with the first available date by default           |

## Component Tests — APOD Date Filter (`components/Apod/DateFilter.test.tsx`)

These tests cover the APOD preset control itself, separate from page-level APOD behavior.

**What is covered:**

| Test                     | Validates                                                                 |
| ------------------------ | ------------------------------------------------------------------------- |
| Mobile preset collapse   | On mobile widths, one primary preset chip remains visible                 |
| Overflow preset menu     | Remaining APOD presets move into a `More` menu instead of a full chip row |
| Custom button separation | `Custom` remains visible as its own control                               |
| Preset callback wiring   | Selecting a preset from the overflow menu calls the expected date handler |

## Component Tests — Navbar (`components/Header/Navbar.test.tsx`)

These tests cover the responsive navigation shell and mobile-menu behavior.

**What is covered:**

| Test                    | Validates                                                           |
| ----------------------- | ------------------------------------------------------------------- |
| Mobile menu open/close  | Menu opens and closes through the navbar controls                   |
| Escape handling         | `Escape` closes the mobile menu                                     |
| Resize close behavior   | Resizing from mobile to desktop closes the menu                     |
| Body scroll restoration | Closing the mobile menu restores document scroll                    |
| Wonders active state    | Only one Wonders destination is active at a time in the mobile menu |

## Utility Tests — API Client (`lib/api.test.ts`)

These tests cover frontend-side error normalization in the shared fetch client.

**What is covered:**

| Test                       | Validates                                                            |
| -------------------------- | -------------------------------------------------------------------- |
| Network failure mapping    | Raw browser fetch failures become public-friendly network copy       |
| Upstream error passthrough | Structured backend error messages are preserved                      |
| Generic 5xx mapping        | Unknown server errors fall back to shared temporary-unavailable copy |
| Generic 4xx mapping        | Unknown client errors fall back to shared request-adjustment copy    |
| Abort passthrough          | `AbortError` is rethrown unchanged for request-cancellation flows    |

## Page Tests — Asteroid Watch (`pages/AsteroidWatchPage.test.tsx`)

These are page-level behavior tests for the NeoWs asteroid route. The `useNeows` hook is mocked, Recharts is replaced with test doubles, and the theme context is stubbed so the page can be exercised deterministically.

**Setup pattern:**

- `useNeows` is mocked to control feed data, loading, and errors
- `recharts` components are mocked because real chart SVG rendering is unreliable in `jsdom`
- `useTheme` is mocked so chart color branches stay deterministic
- `AsteroidWatchSkeleton` is mocked with a test ID for stable loading assertions
- The page is wrapped in `MemoryRouter` because breadcrumbs now render `Link` elements
- `userEvent` is used for sorting, presets, calendar selection, and pagination

**What is covered:**

| Test                         | Validates                                                               |
| ---------------------------- | ----------------------------------------------------------------------- |
| Document title               | Page sets `document.title` on mount                                     |
| Heading and description      | Hero title and intro copy render correctly                              |
| Loading skeleton             | NeoWs skeleton renders during initial loading                           |
| Error state                  | Hook error renders the error banner                                     |
| Radar Brief action           | The Asteroid Watch toolbar renders the Radar Brief action               |
| Empty valid feed             | A valid empty NeoWs response renders the dedicated empty state          |
| Summary stats                | Total, hazardous, closest, fastest, and largest cards render            |
| Chart rendering              | Bar, pie, and scatter chart containers render                           |
| Table rendering              | Sorted asteroid rows render in the data table                           |
| Hazardous badge              | Potentially hazardous asteroids show a `Yes` badge                      |
| Preset pills                 | `Today`, `Yesterday`, `Last 3 days`, `Last 7 days`, and `Custom` render |
| Yesterday preset             | Single-day preset updates the hook with matching start/end dates        |
| Custom single-date selection | Calendar single-date mode updates the hook with one selected date       |
| Reset behavior               | Clear filter returns the page to the default date range                 |
| 7-day UI guard               | Custom ranges are clamped to a 7-day inclusive window                   |
| Null data guard              | Charts and table stay hidden when no feed data exists                   |
| Sorting interactions         | Table headers sort by name and toggle distance ordering                 |
| Rows-per-page controls       | Dropdown menus and pagination summary render correctly                  |
| Pagination flow              | Next/previous pagination updates the visible range                      |
| Default range wiring         | Page calls `useNeows` with the default last-7-days range on mount       |
| Today / Last 3 days presets  | Preset buttons update the hook with the expected date ranges            |
| Calendar close behavior      | Clicking outside closes the custom calendar popover                     |
| Calendar mode switch         | Toggling between single-date and date-range modes updates the UI        |
| Rows-per-page reset          | Changing rows per page resets pagination to the first page              |
| Single-page disable state    | Pagination buttons disable when all rows fit on one page                |

## Component Tests — APOD Card (`components/Apod/ApodCard.test.tsx`)

These are focused rendering and interaction tests for a single APOD archive card.

**Setup pattern:**

- Uses a reusable `baseItem` fixture for the standard image case
- Variants override only the fields needed for video, thumbnail, or copyright cases
- Click behavior is asserted via a mocked `onClick` handler

**What is covered:**

| Test                   | Validates                                                |
| ---------------------- | -------------------------------------------------------- |
| Image card render      | Image, title, src, and media type label render correctly |
| Click interaction      | Clicking the card calls `onClick(item)`                  |
| Date rendering         | Card shows a formatted date                              |
| Explanation teaser     | Card shows teaser text                                   |
| Direct video render    | `.mp4` video URLs render a `<video>` element             |
| Embed fallback         | Non-direct videos render fallback UI instead of image    |
| Thumbnail video render | Video with `thumbnail_url` renders as an image preview   |
| Copyright credit       | Custom copyright renders when provided                   |
| Default credit         | Falls back to `NASA APOD` when copyright is absent       |

## Utility Tests — APOD Meta (`lib/apodMeta.test.ts`)

These are pure unit tests for APOD formatting and helper logic.

**Setup pattern:**

- Uses fake timers for relative-date calculations
- Sets system time explicitly in `beforeEach`
- Restores real timers in `afterEach`

**What is covered:**

| Test group               | Validates                                                     |
| ------------------------ | ------------------------------------------------------------- |
| `APOD_EPOCH`             | First valid APOD date constant is correct                     |
| `formatApodLongDate`     | Long-form date formatting for normal and epoch dates          |
| `formatApodRelativeDate` | Today, past dates, and future dates                           |
| `isDirectVideo`          | Direct video extensions, query params, and supported formats  |
| `getApodTeaser`          | Truncation, whitespace cleanup, exact length, and empty input |

## Shared Test Setup (`test/setup.ts`)

The shared setup file loads:

- `@testing-library/jest-dom`
- a mock `IntersectionObserver`

The `IntersectionObserver` mock is important because APOD cards and similar UI can rely on viewport-based behavior in the browser. Without this mock, tests can fail in jsdom even when the component logic is otherwise correct.

## Key Patterns and Gotchas

### Why mock `useGridSize()` in page tests?

`ApodPage` only needs the hook output, not the real resize behavior. Mocking it keeps tests independent from viewport state and avoids coupling the page tests to browser width logic.

### Why mock `DateFilter` in page tests?

The real `DateFilter` has its own UI complexity. For `ApodPage`, what matters is whether the page reacts correctly when a date is selected or reset. A test double keeps those tests focused on page behavior instead of filter internals.

### Why mock skeleton components?

The real skeletons are purely visual and do not expose accessible labels. Small test doubles with `data-testid` make loading-state assertions stable and intentional.

### Why fake timers in `apodMeta.test.ts`, `EpicPage.test.tsx`, and `AsteroidWatchPage.test.tsx`?

`apodMeta.test.ts`, `EpicPage.test.tsx`, and `AsteroidWatchPage.test.tsx` all rely on date-sensitive logic, so fake timers are used to keep assertions deterministic.

### Why is the Radar Brief feature not deeply mocked in frontend tests?

The Radar Brief modal depends on a backend-generated AI/system summary rather than a purely local UI transformation. Frontend coverage currently focuses on the deterministic page shell, filter behavior, tables, and charts, while the summary generation contract is documented and handled server-side.

### Why wrap `HomePage` in `MemoryRouter`?

`HomePage` uses `Link` from `react-router-dom`. Rendering it without a router causes tests to fail. `MemoryRouter` provides the routing context needed for link assertions.

### Why is the `@/` import alias sometimes underlined in test files?

Vitest resolves `@/*` correctly through Vite, so the tests run. If VS Code still shows an alias error inside `*.test.tsx`, it is usually because the TypeScript app config excludes test files. That is an editor or project-config issue, not a failing test.
