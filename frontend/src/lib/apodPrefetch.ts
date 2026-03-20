import type { ApodItem } from '@/types/apod'
import { fetchApi } from '@/lib/api'
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
  const url = item.media_type === 'video' ? item.thumbnail_url : (item.hero_url ?? item.url)
  if (!url) return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = url
  document.head.appendChild(link)
}
