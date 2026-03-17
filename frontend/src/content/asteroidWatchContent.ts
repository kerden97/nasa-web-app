export const asteroidWatchKicker = 'Near-Earth Radar'

export const asteroidWatchTitle = 'Asteroid Watch'

export const asteroidWatchIntroPrimary =
  "Track near-Earth objects approaching our planet. Visualize asteroid count, size, velocity, and miss distance from NASA's NeoWs data."

export const asteroidWatchIntroSecondary =
  'A few million years earlier, a dashboard like this might have been the most important screen on Earth.'

export const asteroidWatchDatePresets = [
  'Today',
  'Yesterday',
  'Last 3 days',
  'Last 7 days',
] as const

export const asteroidWatchSummaryLabels = [
  'Total asteroids',
  'Closest approach',
  'Fastest',
  'Largest (est.)',
] as const

export const asteroidWatchChartTitles = [
  'Daily Near-Earth Objects',
  'Hazardous Classification',
  'Velocity vs. Miss Distance',
] as const

export const asteroidWatchHazardousNote =
  'NASA classifies an asteroid as potentially hazardous when its minimum orbit intersection distance is ≤ 0.05 AU and its diameter is ≥ ~140 m (H ≤ 22).'

export const asteroidWatchScatterNote =
  'Dot size represents estimated diameter. Red = potentially hazardous.'

export const asteroidWatchTableTitle = 'Near-Earth Objects'

export const asteroidWatchTableHeaders = [
  'Name',
  'Diameter (m)',
  'Velocity (km/s)',
  'Miss Distance (LD)',
  'Hazardous',
  'Date',
] as const

export const asteroidWatchTableNote =
  'LD (Lunar Distance) = ~384,400 km, the average distance from Earth to the Moon.'

export const asteroidWatchEmptyTitle = 'No near-Earth objects found for this range'

export const asteroidWatchEmptyDescription =
  'Try another date or a broader 7-day window to explore recent NeoWs activity.'
