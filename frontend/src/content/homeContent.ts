import { Globe, Image, Radar, Telescope, type LucideIcon } from 'lucide-react'
import heroNebula from '@/assets/home/hero-nebula.jpg'
import cardApod from '@/assets/home/card-apod.jpg'
import cardLibrary from '@/assets/home/card-library.jpg'
import cardEpic from '@/assets/home/card-epic.jpg'
import cardNeows from '@/assets/home/card-neows.jpg'

export interface HomeFeature {
  to: string
  label: string
  title: string
  description: string
  Icon: LucideIcon
  glow: string
  borderHover: string
  badgeBg: string
  exploreColor: string
  image: string
  imageAlt: string
}

export interface HomeStat {
  value: string
  label: string
}

export const homeHeroImage = heroNebula

export const homeFeatures: HomeFeature[] = [
  {
    to: '/wonders-of-the-universe/apod',
    label: 'APOD',
    title: 'Astronomy Picture of the Day',
    description:
      'Featured daily image, browsable archive, date filters, and immersive detail views.',
    Icon: Telescope,
    glow: 'card-glow--blue',
    borderHover: 'hover:border-blue-500/40',
    badgeBg: 'bg-blue-600/90',
    exploreColor:
      'text-blue-600 group-hover:text-blue-500 dark:text-blue-400 dark:group-hover:text-blue-300',
    image: cardApod,
    imageAlt: 'Carina Nebula — JWST Cosmic Cliffs',
  },
  {
    to: '/wonders-of-the-universe/nasa-image-library',
    label: 'Image Library',
    title: 'NASA Image & Video Search',
    description: '140,000+ assets with full-text search, media filters, and in-app playback.',
    Icon: Image,
    glow: 'card-glow--violet',
    borderHover: 'hover:border-violet-500/40',
    badgeBg: 'bg-violet-600/90',
    exploreColor:
      'text-violet-600 group-hover:text-violet-500 dark:text-violet-400 dark:group-hover:text-violet-300',
    image: cardLibrary,
    imageAlt: 'Astronaut spacewalk with Earth in background',
  },
  {
    to: '/wonders-of-the-universe/epic',
    label: 'EPIC',
    title: 'Earth from Deep Space',
    description:
      'Full-disk Earth imagery from the DSCOVR satellite — natural and enhanced views, date presets, and downloads.',
    Icon: Globe,
    glow: 'card-glow--emerald',
    borderHover: 'hover:border-emerald-500/40',
    badgeBg: 'bg-emerald-600/90',
    exploreColor:
      'text-emerald-600 group-hover:text-emerald-500 dark:text-emerald-400 dark:group-hover:text-emerald-300',
    image: cardEpic,
    imageAlt: 'The Blue Marble — full-disk Earth from Apollo 17',
  },
  {
    to: '/asteroid-watch',
    label: 'NeoWs',
    title: 'Asteroid Watch',
    description:
      'Track near-Earth objects with interactive charts, hazard classification, and an AI radar brief.',
    Icon: Radar,
    glow: 'card-glow--amber',
    borderHover: 'hover:border-amber-500/40',
    badgeBg: 'bg-amber-600/90',
    exploreColor:
      'text-amber-600 group-hover:text-amber-500 dark:text-amber-400 dark:group-hover:text-amber-300',
    image: cardNeows,
    imageAlt: 'Near-Earth asteroid orbital distribution',
  },
]

export const homeStats: HomeStat[] = [
  { value: '4', label: 'Cosmic Feeds' },
  { value: '140K+', label: 'Images & Videos' },
  { value: 'Daily', label: 'Fresh Content' },
  { value: 'Live', label: 'Asteroid Tracking' },
]
