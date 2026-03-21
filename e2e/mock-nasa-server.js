const http = require('node:http')

const port = Number(process.env.MOCK_NASA_PORT || 4100)

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

function sendSvg(res, statusCode, svg) {
  res.writeHead(statusCode, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'no-store',
  })
  res.end(svg)
}

function getDateRange(startDate, endDate) {
  const dates = []
  const cursor = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T00:00:00Z`)

  while (cursor <= end) {
    dates.push(cursor.toISOString().split('T')[0])
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return dates.filter(Boolean)
}

function createApodItem(date, index) {
  return {
    date,
    title: `Mock APOD ${date}`,
    explanation: `Mock APOD explanation ${index + 1} for ${date}.`,
    url: `http://127.0.0.1:${port}/assets/apod-${date}.svg`,
    media_type: 'image',
    service_version: 'v1',
  }
}

function handleApod(url, res) {
  const date = url.searchParams.get('date')
  if (date) {
    sendJson(res, 200, createApodItem(date, 0))
    return
  }

  const startDate = url.searchParams.get('start_date')
  const endDate = url.searchParams.get('end_date') || startDate

  if (!startDate || !endDate) {
    sendJson(res, 400, { error: 'start_date is required' })
    return
  }

  const items = getDateRange(startDate, endDate).map((currentDate, index) =>
    createApodItem(currentDate, index),
  )
  sendJson(res, 200, items)
}

function createNeoObject({
  id,
  name,
  date,
  hazardous,
  distanceLd,
  velocityKmS,
  minMeters,
  maxMeters,
}) {
  return {
    id,
    name,
    nasa_jpl_url: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${id}`,
    absolute_magnitude_h: hazardous ? 21.4 : 24.1,
    estimated_diameter: {
      kilometers: {
        estimated_diameter_min: minMeters / 1000,
        estimated_diameter_max: maxMeters / 1000,
      },
      meters: {
        estimated_diameter_min: minMeters,
        estimated_diameter_max: maxMeters,
      },
    },
    is_potentially_hazardous_asteroid: hazardous,
    close_approach_data: [
      {
        close_approach_date: date,
        close_approach_date_full: `${date} 09:30`,
        epoch_date_close_approach: Date.parse(`${date}T09:30:00Z`),
        relative_velocity: {
          kilometers_per_second: String(velocityKmS),
          kilometers_per_hour: String(Math.round(velocityKmS * 3600)),
          miles_per_hour: String(Math.round(velocityKmS * 2236.936)),
        },
        miss_distance: {
          astronomical: (distanceLd * 0.00257).toFixed(5),
          lunar: distanceLd.toFixed(2),
          kilometers: String(Math.round(distanceLd * 384400)),
          miles: String(Math.round(distanceLd * 238855)),
        },
        orbiting_body: 'Earth',
      },
    ],
    is_sentry_object: false,
  }
}

function handleNeoFeed(url, res) {
  const startDate = url.searchParams.get('start_date')
  const endDate = url.searchParams.get('end_date')

  if (!startDate || !endDate) {
    sendJson(res, 400, { error: 'start_date and end_date are required' })
    return
  }

  const range = getDateRange(startDate, endDate)
  const lastDate = range[range.length - 1] || endDate
  const nearEarthObjects = {}

  for (const date of range) {
    nearEarthObjects[date] = []
  }

  nearEarthObjects[lastDate] = [
    createNeoObject({
      id: 'mock-alpha',
      name: '(Mock Alpha)',
      date: lastDate,
      hazardous: true,
      distanceLd: 4.67,
      velocityKmS: 18.4,
      minMeters: 80,
      maxMeters: 120,
    }),
    createNeoObject({
      id: 'mock-beta',
      name: '(Mock Beta)',
      date: lastDate,
      hazardous: false,
      distanceLd: 8.95,
      velocityKmS: 9.7,
      minMeters: 30,
      maxMeters: 50,
    }),
  ]

  sendJson(res, 200, {
    element_count: nearEarthObjects[lastDate].length,
    near_earth_objects: nearEarthObjects,
  })
}

function handleAsset(pathname, res) {
  const label = pathname.replace('/assets/', '').replace('.svg', '')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#0b1020"/><circle cx="960" cy="180" r="90" fill="#2563eb" opacity="0.65"/><circle cx="240" cy="520" r="140" fill="#f59e0b" opacity="0.42"/><text x="80" y="340" fill="#f8fafc" font-family="Arial, sans-serif" font-size="64" font-weight="700">${label}</text></svg>`
  sendSvg(res, 200, svg)
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`)

  if (url.pathname === '/healthz') {
    sendJson(res, 200, { status: 'ok' })
    return
  }

  if (url.pathname === '/planetary/apod') {
    handleApod(url, res)
    return
  }

  if (url.pathname === '/neo/rest/v1/feed') {
    handleNeoFeed(url, res)
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    handleAsset(url.pathname, res)
    return
  }

  sendJson(res, 404, { error: 'Not found' })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Mock NASA server listening on http://127.0.0.1:${port}`)
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
