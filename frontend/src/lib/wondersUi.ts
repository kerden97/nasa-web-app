import { Globe2, Image, Telescope, type LucideIcon } from 'lucide-react'

export interface WondersUiItem {
  slug: 'apod' | 'nasa-image-library' | 'epic'
  to: string
  label: string
  shortLabel: string
  description: string
  Icon: LucideIcon
}

export const wondersUiConfig = [
  {
    slug: 'apod',
    to: '/wonders-of-the-universe/apod',
    label: 'Astronomy Picture of the Day',
    shortLabel: 'APOD',
    description: 'NASA’s daily featured story with archive browsing and immersive detail views.',
    Icon: Telescope,
  },
  {
    slug: 'nasa-image-library',
    to: '/wonders-of-the-universe/nasa-image-library',
    label: 'NASA Image Library',
    shortLabel: 'Image Library',
    description: 'Search NASA’s massive archive of photos, video, and mission media.',
    Icon: Image,
  },
  {
    slug: 'epic',
    to: '/wonders-of-the-universe/epic',
    label: 'EPIC',
    shortLabel: 'EPIC',
    description: 'See full-disk Earth imagery from deep space in natural and enhanced views.',
    Icon: Globe2,
  },
] as const satisfies readonly WondersUiItem[]
