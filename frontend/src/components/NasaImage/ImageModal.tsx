import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import type { NasaImageItem } from '@/types/nasaImage'

interface ImageModalProps {
  item: NasaImageItem
  onClose: () => void
}

export default function ImageModal({ item, onClose }: ImageModalProps) {
  const [resolvedAsset, setResolvedAsset] = useState<{
    manifest: string
    url: string | null
  } | null>(null)
  const [pendingExternalLink, setPendingExternalLink] = useState<{
    href: string
    hostname: string
  } | null>(null)
  const requiresAsset = item.media_type !== 'image' && Boolean(item.asset_manifest_url)
  const assetResolvedForCurrent =
    !requiresAsset || resolvedAsset?.manifest === item.asset_manifest_url
  const assetUrl = assetResolvedForCurrent ? (resolvedAsset?.url ?? null) : null
  const assetLoading = requiresAsset && !assetResolvedForCurrent

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingExternalLink) {
          setPendingExternalLink(null)
          return
        }
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, pendingExternalLink])

  useEffect(() => {
    if (
      !requiresAsset ||
      !item.asset_manifest_url ||
      resolvedAsset?.manifest === item.asset_manifest_url
    ) {
      return
    }

    const controller = new AbortController()

    fetch(item.asset_manifest_url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Asset manifest responded with ${response.status}`)
        return response.json()
      })
      .then((assets: string[]) => {
        const normalizedAssets = assets.map((asset) => asset.replace(/^http:\/\//, 'https://'))
        const preferredAsset =
          item.media_type === 'video'
            ? (normalizedAssets.find((asset) => asset.endsWith('~orig.mp4')) ??
              normalizedAssets.find((asset) => asset.endsWith('.mp4')))
            : (normalizedAssets.find((asset) => asset.endsWith('.mp3')) ??
              normalizedAssets.find((asset) => asset.endsWith('.m4a')) ??
              normalizedAssets.find((asset) => asset.endsWith('.wav')))

        setResolvedAsset({ manifest: item.asset_manifest_url!, url: preferredAsset ?? null })
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResolvedAsset({ manifest: item.asset_manifest_url!, url: null })
        }
      })

    return () => controller.abort()
  }, [item.asset_manifest_url, item.media_type, requiresAsset, resolvedAsset?.manifest])

  const date = new Date(item.date_created).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const descriptionText = useMemo(() => {
    if (!item.description) return ''

    return item.description.length > 500
      ? `${item.description.slice(0, 500).trimEnd()}...`
      : item.description
  }, [item.description])

  const originalHref = item.media_type === 'image' ? item.href : assetUrl

  const queueExternalLink = (href: string) => {
    const hostname = new URL(href).hostname.replace(/^www\./, '')
    setPendingExternalLink({ href, hostname })
  }

  const confirmExternalLink = () => {
    if (!pendingExternalLink) return
    window.open(pendingExternalLink.href, '_blank', 'noopener,noreferrer')
    setPendingExternalLink(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              {item.media_type}
            </p>
            <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
              {item.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex shrink-0 rounded-full border border-slate-300 bg-white p-2.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="scrollbar-thin overflow-y-auto">
          <div className="flex h-[50vh] items-center justify-center bg-black">
            {item.media_type === 'image' && item.href && (
              <img src={item.href} alt={item.title} className="h-full w-full object-contain" />
            )}
            {item.media_type === 'video' && assetUrl && (
              <video
                src={assetUrl}
                controls
                className="h-full w-full object-contain"
                preload="metadata"
              />
            )}
            {item.media_type === 'audio' && (
              <div className="flex w-full max-w-xl flex-col items-center gap-6 px-6 text-center">
                {item.href && (
                  <img
                    src={item.href}
                    alt={item.title}
                    className="max-h-72 w-full rounded-2xl object-contain"
                  />
                )}
                {assetUrl && (
                  <audio src={assetUrl} controls className="w-full" preload="metadata" />
                )}
              </div>
            )}
            {item.media_type !== 'image' && assetLoading && (
              <div className="text-sm text-slate-300">Loading media...</div>
            )}
            {item.media_type !== 'image' && !assetLoading && !assetUrl && (
              <div className="max-w-md px-6 text-center text-sm text-slate-300">
                This media preview is not available right now.
              </div>
            )}
          </div>

          <div className="p-6">
            {descriptionText && (
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {descriptionText}
              </p>
            )}

            <div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Date
                  </p>
                  <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{date}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Center
                  </p>
                  <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                    {item.center ?? 'NASA'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    ID
                  </p>
                  <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                    {item.nasa_id}
                  </p>
                </div>
              </div>
              {originalHref && (
                <button
                  type="button"
                  onClick={() => queueExternalLink(originalHref)}
                  className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:border-blue-500 hover:bg-blue-500 md:w-auto md:min-w-48"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    <ExternalLink size={14} />
                  </span>
                  <span>Original</span>
                </button>
              )}
            </div>

            {item.keywords && item.keywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.keywords.slice(0, 10).map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 dark:border-slate-700 dark:text-slate-400"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingExternalLink && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 p-4"
          onClick={(e) => {
            e.stopPropagation()
            setPendingExternalLink(null)
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              Leaving Home &amp; Beyond
            </p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
              Open Original media?
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              You are about to leave this site and open the media on{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {pendingExternalLink.hostname}
              </span>
              .
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingExternalLink(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Stay here
              </button>
              <button
                type="button"
                onClick={confirmExternalLink}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                Continue to Original
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
