import type { ApodItem } from '@/types/apod'
import { fetchApi } from '@/lib/api'
import { buildProxyUrlAtWidth } from '@/lib/imageProxy'
import { apodResponseSchema } from '@/schemas/api'

const FIRST_PAGE_SIZE = 21

let prefetchPromise: Promise<ApodItem[]> | null = null
let consumed = false

export function triggerApodPrefetch(): void {
  if (prefetchPromise) return
  prefetchPromise = fetchApi(
    '/api/apod',
    { count: String(FIRST_PAGE_SIZE) },
    undefined,
    apodResponseSchema,
  ).then((data) => {
    const items = Array.isArray(data) ? data : [data]
    preloadHeroImage(items[0])
    return items
  })
}

export function consumeApodPrefetch(): Promise<ApodItem[]> | null {
  if (!prefetchPromise || consumed) return null
  consumed = true
  return prefetchPromise
}

export function resetApodPrefetch(): void {
  prefetchPromise = null
  consumed = false
}

function preloadHeroImage(item: ApodItem | undefined): void {
  if (!item) return
  const isVideo = item.media_type === 'video'
  const url = isVideo ? item.thumbnail_url : (item.hero_url ?? item.url)
  if (!url) return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'

  // Match the exact srcSet/sizes the <img> in FeaturedApodHero uses
  // so the browser reuses this preload instead of making a second request
  if (!isVideo && item.hero_url) {
    link.setAttribute(
      'imagesrcset',
      `${buildProxyUrlAtWidth(item.hero_url, 640)} 640w, ${buildProxyUrlAtWidth(item.hero_url, 960)} 960w, ${item.hero_url} 1280w`,
    )
    link.setAttribute('imagesizes', '(min-width: 1024px) 57vw, 100vw')
  }

  link.href = url
  link.fetchPriority = 'high'
  document.head.appendChild(link)
}
