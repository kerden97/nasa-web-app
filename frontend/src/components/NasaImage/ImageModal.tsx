import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import type { NasaImageItem } from '@/types/nasaImage'
import ModalFrame from '@/components/Wonders/ModalFrame'
import ExternalLinkPrompt from '@/components/Wonders/ExternalLinkPrompt'
import MediaBadge from '@/components/Wonders/MediaBadge'

interface ImageModalProps {
  item: NasaImageItem
  onClose: () => void
}

export default function ImageModal({ item, onClose }: ImageModalProps) {
  const [resolvedAsset, setResolvedAsset] = useState<{
    manifest: string
    url: string | null
  } | null>(null)
  const [expandedDescription, setExpandedDescription] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
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
    return () => document.removeEventListener('keydown', handleKey)
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

    if (expandedDescription || item.description.length <= 500) return item.description

    return `${item.description.slice(0, 500).trimEnd()}...`
  }, [expandedDescription, item.description])
  const shouldTruncateDescription = item.description.length > 500

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

  const copyNasaId = async () => {
    try {
      await navigator.clipboard.writeText(item.nasa_id)
      setCopiedId(true)
      window.setTimeout(() => setCopiedId(false), 1600)
    } catch {
      setCopiedId(false)
    }
  }

  return (
    <ModalFrame onClose={onClose} maxWidthClass="max-w-6xl">
      <div className="h-full overflow-hidden">
        <div className="flex h-full flex-col lg:grid lg:h-[48rem] lg:max-h-[calc(100vh-73px-2rem)] lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          <div className="flex shrink-0 min-h-[14rem] max-h-[36svh] items-center justify-center bg-black sm:min-h-[18rem] sm:max-h-[46svh] lg:max-h-none">
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

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-t border-slate-200 bg-white/98 p-4 dark:border-slate-800 dark:bg-slate-900/96 lg:border-l lg:border-t-0 lg:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-[#0B3D91]/12 blur-3xl" />
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="sticky top-0 z-10 -mx-4 -mt-4 border-b border-slate-200 bg-white/96 px-4 pb-4 pt-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/96 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pb-5 lg:pt-8">
                <div className="flex flex-wrap items-center gap-2 pr-12">
                  <span className="cosmic-pill-date rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.12em]">
                    {date}
                  </span>
                  <MediaBadge kind={item.media_type} />
                </div>
                <h2 className="ui-page-title mt-4 pr-12 text-xl leading-[1.08] text-slate-900 dark:text-white sm:text-3xl">
                  {item.title}
                </h2>
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-hidden lg:mt-5">
                <div className="scrollbar-thin h-full overflow-y-auto overscroll-contain pr-1 lg:pr-2">
                  {descriptionText && (
                    <p
                      className={`text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:leading-8 ${
                        expandedDescription ? '' : 'line-clamp-5'
                      }`}
                    >
                      {descriptionText}
                    </p>
                  )}
                  {shouldTruncateDescription && (
                    <button
                      type="button"
                      onClick={() => setExpandedDescription((current) => !current)}
                      className="mt-2 text-sm font-semibold text-slate-900 underline decoration-slate-400 decoration-2 underline-offset-4 transition hover:text-[#0B3D91] hover:decoration-[#0B3D91] dark:text-white dark:decoration-slate-600 dark:hover:text-[#8CB8FF] dark:hover:decoration-[#8CB8FF] lg:mt-3"
                    >
                      {expandedDescription ? 'See less' : 'See more'}
                    </button>
                  )}
                  {item.keywords && item.keywords.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {item.keywords.slice(0, 10).map((kw) => (
                        <span
                          key={kw}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 lg:hidden">
                    {originalHref && (
                      <button
                        type="button"
                        onClick={() => queueExternalLink(originalHref)}
                        className="cosmic-btn-primary flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium"
                      >
                        <span className="flex h-4 w-4 items-center justify-center">
                          <ExternalLink size={14} />
                        </span>
                        <span>Original</span>
                      </button>
                    )}

                    <div className="grid gap-3 text-sm">
                      <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/85 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          Center
                        </p>
                        <p className="mt-1 text-sm leading-6 font-medium text-slate-800 dark:text-slate-200 [overflow-wrap:anywhere]">
                          {item.center ?? 'NASA'}
                        </p>
                      </div>
                      <div className="relative min-w-0 rounded-2xl border border-slate-200 bg-slate-50/85 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                        <p className="pr-20 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          ID
                        </p>
                        <button
                          type="button"
                          onClick={copyNasaId}
                          className="absolute right-3 top-3 inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 text-[10px] font-medium leading-none text-slate-600 transition hover:border-[rgba(11,61,145,0.3)] hover:text-[#0B3D91] dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-[#8CB8FF]"
                          aria-label="Copy full ID"
                          title="Copy full ID"
                        >
                          {copiedId ? <Check size={11} /> : <Copy size={11} />}
                          <span>{copiedId ? 'Copied' : 'Copy'}</span>
                        </button>
                        <p
                          className="mt-1 truncate text-sm leading-6 font-medium text-slate-800 dark:text-slate-200"
                          title={item.nasa_id}
                        >
                          {item.nasa_id}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        Source
                      </p>
                      <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">
                        NASA Image and Video Library
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 hidden shrink-0 gap-5 border-t border-slate-200 pt-5 dark:border-slate-800 lg:grid">
              {originalHref && (
                <button
                  type="button"
                  onClick={() => queueExternalLink(originalHref)}
                  className="cosmic-btn-primary flex h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    <ExternalLink size={14} />
                  </span>
                  <span>Original</span>
                </button>
              )}

              <div className="grid gap-3 text-sm sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/85 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Center
                  </p>
                  <p className="mt-1 text-sm leading-6 font-medium text-slate-800 dark:text-slate-200 [overflow-wrap:anywhere]">
                    {item.center ?? 'NASA'}
                  </p>
                </div>
                <div className="relative min-w-0 rounded-2xl border border-slate-200 bg-slate-50/85 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="pr-20 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    ID
                  </p>
                  <button
                    type="button"
                    onClick={copyNasaId}
                    className="absolute right-3 top-3 inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 text-[10px] font-medium leading-none text-slate-600 transition hover:border-[rgba(11,61,145,0.3)] hover:text-[#0B3D91] dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-[#8CB8FF]"
                    aria-label="Copy full ID"
                    title="Copy full ID"
                  >
                    {copiedId ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                  <p
                    className="mt-1 truncate text-sm leading-6 font-medium text-slate-800 dark:text-slate-200"
                    title={item.nasa_id}
                  >
                    {item.nasa_id}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Source
                </p>
                <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">
                  NASA Image and Video Library
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pendingExternalLink && (
        <ExternalLinkPrompt
          hostname={pendingExternalLink.hostname}
          label="Original"
          onCancel={() => setPendingExternalLink(null)}
          onConfirm={confirmExternalLink}
        />
      )}
    </ModalFrame>
  )
}
