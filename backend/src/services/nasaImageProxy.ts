import {
  createRemoteImageProxyPolicy,
  getOptimizedRemoteImage,
  isOptimizableRemoteImageSource,
  normalizeOptimizedImageQuality,
  normalizeOptimizedImageWidth,
} from './remoteImageProxy'

const nasaImagePolicy = createRemoteImageProxyPolicy('NASA Image Library', [
  'images-assets.nasa.gov',
])

export function isOptimizableNasaImageSource(sourceUrl: string | undefined): sourceUrl is string {
  return isOptimizableRemoteImageSource(sourceUrl, nasaImagePolicy)
}

export function normalizeNasaImageWidth(width: number | undefined, fallback: number): number {
  return normalizeOptimizedImageWidth(width, fallback)
}

export function normalizeNasaImageQuality(quality: number | undefined, fallback: number): number {
  return normalizeOptimizedImageQuality(quality, fallback)
}

export function getOptimizedNasaImage(sourceUrl: string, width: number, quality: number) {
  return getOptimizedRemoteImage(sourceUrl, width, quality, nasaImagePolicy)
}
