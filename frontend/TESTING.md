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

## Test Files

Tests are co-located next to their source files, with shared setup under `src/test`.

```text
frontend/src/
├── components/
│   └── Apod/
│       ├── ApodCard.tsx
│       └── ApodCard.test.tsx
├── lib/
│   ├── apodMeta.ts
│   └── apodMeta.test.ts
├── pages/
│   ├── ApodPage.tsx
│   └── ApodPage.test.tsx
└── test/
    └── setup.ts
```

## Page Tests (`pages/ApodPage.test.tsx`)

These are page-level behavior tests for the APOD route. External hooks are mocked so the page can be tested deterministically without depending on real viewport logic or the full DateFilter UI.

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
| Empty state                  | No items + no error renders the empty-state message              |
| Error state                  | Hook error renders the error banner                              |
| Initial loading              | Hero skeleton + card skeletons render during first load          |
| Modal open/close             | Featured CTA opens modal and close button dismisses it           |
| Load more button click       | `loadMore` is called when the button is pressed                  |
| Load more hidden             | Button does not render when `hasMore` is false                   |
| Filtered mode layout         | Featured hero disappears and all items stay in archive grid      |
| Filter hook wiring           | Selected date is passed into `useApod` with the current pageSize |
| Filter reset                 | Reset returns page to featured layout and default hook params    |

## Component Tests (`components/Apod/ApodCard.test.tsx`)

These are focused rendering and interaction tests for a single APOD archive card.

**Setup pattern:**

- Uses a reusable `baseItem` fixture for the standard image case
- Variants override only the fields needed for video, thumbnail, or copyright cases
- Click behavior is asserted via a mocked `onClick` handler

**What is covered:**

| Test                   | Validates                                              |
| ---------------------- | ------------------------------------------------------ |
| Image card render      | Image, title, and media type label render correctly    |
| Click interaction      | Clicking the card calls `onClick(item)`                |
| Date rendering         | Card shows a formatted date                            |
| Explanation teaser     | Card shows teaser text                                 |
| CTA rendering          | `View details` call to action is present               |
| Direct video render    | `.mp4` video URLs render a `<video>` element           |
| Embed fallback         | Non-direct videos render fallback UI instead of image  |
| Thumbnail video render | Video with `thumbnail_url` renders as an image preview |
| Copyright credit       | Custom copyright renders when provided                 |
| Default credit         | Falls back to `NASA APOD` when copyright is absent     |

## Utility Tests (`lib/apodMeta.test.ts`)

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
| `isDirectVideo`          | Direct video extensions, query params, uppercase extensions   |
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

### Why fake timers in `apodMeta.test.ts`?

`formatApodRelativeDate()` depends on the current time. Fake timers make `today`, `X days ago`, and future-date assertions deterministic instead of depending on when the test happens to run.

### Why is the `@/` import alias sometimes underlined in test files?

Vitest resolves `@/*` correctly through Vite, so the tests run. If VS Code still shows an alias error inside `*.test.tsx`, it is usually because the TypeScript app config excludes test files. That is an editor/project-config issue, not a failing test.
