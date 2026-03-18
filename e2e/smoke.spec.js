const { test, expect } = require('@playwright/test')

function jsonResponse(body) {
  return {
    status: 200,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin': '*',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  }
}

const apodItems = [
  {
    date: '2026-03-18',
    title: 'Mock Nebula',
    explanation: 'A mock APOD hero description used for smoke-test coverage.',
    url: 'https://images-assets.nasa.gov/image/mock-nebula/mock-nebula~orig.jpg',
    media_type: 'image',
    service_version: 'v1',
  },
  {
    date: '2026-03-17',
    title: 'Mock Galaxy',
    explanation: 'A mock APOD archive item used for smoke-test coverage.',
    url: 'https://images-assets.nasa.gov/image/mock-galaxy/mock-galaxy~orig.jpg',
    media_type: 'image',
    service_version: 'v1',
  },
]

const neoFeed = {
  element_count: 2,
  near_earth_objects: {
    '2026-03-18': [
      {
        id: '1',
        name: '(2026 AB)',
        nasa_jpl_url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
        absolute_magnitude_h: 22.1,
        estimated_diameter: {
          kilometers: { estimated_diameter_min: 0.08, estimated_diameter_max: 0.12 },
          meters: { estimated_diameter_min: 80, estimated_diameter_max: 120 },
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [
          {
            close_approach_date: '2026-03-18',
            close_approach_date_full: '2026-Mar-18 08:15',
            epoch_date_close_approach: 1773821700000,
            relative_velocity: {
              kilometers_per_second: '18.4',
              kilometers_per_hour: '66240',
              miles_per_hour: '41164',
            },
            miss_distance: {
              astronomical: '0.012',
              lunar: '4.67',
              kilometers: '1790000',
              miles: '1112260',
            },
            orbiting_body: 'Earth',
          },
        ],
        is_sentry_object: false,
      },
      {
        id: '2',
        name: '(2026 CD)',
        nasa_jpl_url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=2',
        absolute_magnitude_h: 24.3,
        estimated_diameter: {
          kilometers: { estimated_diameter_min: 0.03, estimated_diameter_max: 0.05 },
          meters: { estimated_diameter_min: 30, estimated_diameter_max: 50 },
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: '2026-03-18',
            close_approach_date_full: '2026-Mar-18 13:05',
            epoch_date_close_approach: 1773839100000,
            relative_velocity: {
              kilometers_per_second: '9.7',
              kilometers_per_hour: '34920',
              miles_per_hour: '21698',
            },
            miss_distance: {
              astronomical: '0.023',
              lunar: '8.95',
              kilometers: '3440000',
              miles: '2137522',
            },
            orbiting_body: 'Earth',
          },
        ],
        is_sentry_object: false,
      },
    ],
  },
}

const radarBrief = {
  source: 'ai',
  model: 'gpt-4o-mini',
  generatedAt: '2026-03-18T09:00:00.000Z',
  startDate: '2026-03-18',
  endDate: '2026-03-18',
  headline: 'Mock radar headline',
  overview:
    'Two near-Earth objects crossed the selected range, with one flagged as potentially hazardous.',
  impactScenario:
    'This is a mock illustrative scenario used to verify the modal flow in end-to-end coverage.',
  watchNotes: [
    'Closest pass: 2026 AB at 4.67 lunar distances.',
    'Fastest object: 2026 AB at 18.4 km/s.',
    'Largest hazardous-class object: 2026 AB at roughly 100 meters.',
  ],
  disclaimer:
    'Illustrative scenario only. This test fixture is not a real impact forecast or NASA alert.',
  factsUsed: {
    totalObjects: 2,
    hazardousCount: 1,
    observationDays: 1,
    busiestDay: {
      date: '2026-03-18',
      count: 2,
      hazardousCount: 1,
    },
    closestApproach: {
      id: '1',
      name: '2026 AB',
      date: '2026-03-18',
      hazardous: true,
      diameterMeters: 100,
      velocityKmS: 18.4,
      missDistanceLd: 4.67,
      nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
    },
    fastestObject: {
      id: '1',
      name: '2026 AB',
      date: '2026-03-18',
      hazardous: true,
      diameterMeters: 100,
      velocityKmS: 18.4,
      missDistanceLd: 4.67,
      nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
    },
    largestObject: {
      id: '1',
      name: '2026 AB',
      date: '2026-03-18',
      hazardous: true,
      diameterMeters: 100,
      velocityKmS: 18.4,
      missDistanceLd: 4.67,
      nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
    },
    largestHazardousObject: {
      id: '1',
      name: '2026 AB',
      date: '2026-03-18',
      hazardous: true,
      diameterMeters: 100,
      velocityKmS: 18.4,
      missDistanceLd: 4.67,
      nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
    },
    impactSubject: {
      id: '1',
      name: '2026 AB',
      date: '2026-03-18',
      hazardous: true,
      diameterMeters: 100,
      velocityKmS: 18.4,
      missDistanceLd: 4.67,
      nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
    },
    impactComparison: 'roughly football-field scale',
    impactBand: 'a regional catastrophe',
    illustrativeEnergyMegatons: 120,
  },
}

test('home route navigates into the APOD experience', async ({ page }) => {
  await page.route('**/api/apod**', async (route) => {
    await route.fulfill(jsonResponse(apodItems))
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: /home & beyond/i })).toBeVisible()
  await page.getByRole('link', { name: /astronomy picture of the day/i }).click()

  await expect(page).toHaveURL(/\/wonders-of-the-universe\/apod$/)
  await expect(page.getByRole('heading', { name: 'Mock Nebula' })).toBeVisible()
  await expect(page.getByText('Browse recent discoveries')).toBeVisible()
})

test('asteroid watch loads mocked feed data and opens the radar brief modal', async ({ page }) => {
  await page.route('**/api/neows/feed**', async (route) => {
    await route.fulfill(jsonResponse(neoFeed))
  })

  await page.route('**/api/neows/radar-brief**', async (route) => {
    await route.fulfill(jsonResponse(radarBrief))
  })

  await page.goto('/asteroid-watch')

  await expect(page.getByRole('heading', { name: 'Asteroid Watch' })).toBeVisible()
  await expect(page.getByRole('cell', { name: '2026 AB', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Radar Brief' }).click()

  await expect(page.getByRole('heading', { name: 'Radar Brief' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Mock radar headline' })).toBeVisible()
  await expect(page.getByText(/illustrative scenario only/i)).toBeVisible()
})
