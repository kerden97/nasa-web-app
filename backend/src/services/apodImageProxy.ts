import {
  createRemoteImageProxyPolicy,
  getOptimizedRemoteImage,
  isOptimizableRemoteImageSource,
  normalizeOptimizedImageQuality,
  normalizeOptimizedImageWidth,
} from './remoteImageProxy'

const apodImagePolicy = createRemoteImageProxyPolicy('APOD', ['apod.nasa.gov'], ['/apod/image/'])

export type OptimizedApodImageAsset = Awaited<ReturnType<typeof getOptimizedApodImage>>

export function isOptimizableApodImageSource(sourceUrl: string | undefined): sourceUrl is string {
  return isOptimizableRemoteImageSource(sourceUrl, apodImagePolicy)
}

export function normalizeApodImageWidth(width: number | undefined, fallback: number): number {
  return normalizeOptimizedImageWidth(width, fallback)
}

export function normalizeApodImageQuality(quality: number | undefined, fallback: number): number {
  return normalizeOptimizedImageQuality(quality, fallback)
}

export function getOptimizedApodImage(sourceUrl: string, width: number, quality: number) {
  return getOptimizedRemoteImage(sourceUrl, width, quality, apodImagePolicy)
}
