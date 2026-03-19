import {
  createRemoteImageProxyPolicy,
  getOptimizedRemoteImage,
  isOptimizableRemoteImageSource,
  normalizeOptimizedImageQuality,
  normalizeOptimizedImageWidth,
} from './remoteImageProxy'

const epicImagePolicy = createRemoteImageProxyPolicy('EPIC', ['epic.gsfc.nasa.gov'], ['/archive/'])

export function isOptimizableEpicImageSource(sourceUrl: string | undefined): sourceUrl is string {
  return isOptimizableRemoteImageSource(sourceUrl, epicImagePolicy)
}

export function normalizeEpicImageWidth(width: number | undefined, fallback: number): number {
  return normalizeOptimizedImageWidth(width, fallback)
}

export function normalizeEpicImageQuality(quality: number | undefined, fallback: number): number {
  return normalizeOptimizedImageQuality(quality, fallback)
}

export function getOptimizedEpicImage(sourceUrl: string, width: number, quality: number) {
  return getOptimizedRemoteImage(sourceUrl, width, quality, epicImagePolicy)
}
