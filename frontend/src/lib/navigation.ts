import { wondersUiConfig } from '@/lib/wondersUi'

export const wondersDestinations = wondersUiConfig

export const asteroidDestination = {
  to: '/asteroid-watch',
  label: 'Asteroid Watch',
  description: 'Track near-Earth objects, hazard counts, velocities, and close approaches.',
} as const
