import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import type { NasaImageItem } from '@/types/nasaImage'
import ModalFrame from '@/components/Wonders/ModalFrame'
import ModalShell from '@/components/Wonders/ModalShell'
import ExternalLinkPrompt from '@/components/Wonders/ExternalLinkPrompt'
import InfoBox from '@/components/Wonders/InfoBox'
import MediaBadge from '@/components/Wonders/MediaBadge'
import useExternalLink from '@/hooks/useExternalLink'
import { formatUtcLongDate } from '@/lib/dateFormat'
import { fetchApi } from '@/lib/api'
import { nasaImageAssetResultSchema } from '@/schemas/api'

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
  const { pendingExternalLink, queueExternalLink, confirmExternalLink, cancelExternalLink } =
    useExternalLink('Original')
  const requiresAsset = item.media_type !== 'image' && Boolean(item.asset_manifest_url)
  const assetResolvedForCurrent =
    !requiresAsset || resolvedAsset?.manifest === item.asset_manifest_url
  const assetUrl = assetResolvedForCurrent ? (resolvedAsset?.url ?? null) : null
  const assetLoading = requiresAsset && !assetResolvedForCurrent

  useEffect(() => {
    if (
      !requiresAsset ||
      !item.asset_manifest_url ||
      resolvedAsset?.manifest === item.asset_manifest_url
    ) {
      return
    }

    const controller = new AbortController()

    fetchApi(
      '/api/nasa-image/assets',
      {
        src: item.asset_manifest_url,
        media_type: item.media_type,
      },
      controller.signal,
      nasaImageAssetResultSchema,
    )
      .then((result) => {
        setResolvedAsset({ manifest: item.asset_manifest_url!, url: result.preferredAsset })
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResolvedAsset({ manifest: item.asset_manifest_url!, url: null })
        }
      })

    return () => controller.abort()
  }, [item.asset_manifest_url, item.media_type, requiresAsset, resolvedAsset?.manifest])

  const date = formatUtcLongDate(item.date_created)
  const descriptionText = useMemo(() => {
    if (!item.description) return ''

    if (expandedDescription || item.description.length <= 500) return item.description

    return `${item.description.slice(0, 500).trimEnd()}...`
  }, [expandedDescription, item.description])
  const shouldTruncateDescription = item.description.length > 500

  const originalHref = item.media_type === 'image' ? item.href : assetUrl

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
    <ModalFrame onClose={onClose} maxWidthClass="max-w-6xl" titleId="image-modal-title">
      <ModalShell
        media={
          <>
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
          </>
        }
        header={
          <>
            <div className="flex flex-wrap items-center gap-2 pr-12">
              <span className="cosmic-pill-date rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.12em]">
                {date}
              </span>
              <MediaBadge kind={item.media_type} />
            </div>
            <h2
              id="image-modal-title"
              className="ui-page-title mt-4 pr-12 text-xl leading-[1.08] text-slate-900 dark:text-white sm:text-3xl"
            >
              {item.title}
            </h2>
          </>
        }
        footer={
          <>
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
              <InfoBox label="Center" className="min-w-0">
                <p className="text-sm leading-6 font-medium text-slate-800 dark:text-slate-200 [overflow-wrap:anywhere]">
                  {item.center ?? 'NASA'}
                </p>
              </InfoBox>
              <InfoBox label="ID" className="relative min-w-0" labelClassName="pr-20">
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
                  className="truncate text-sm leading-6 font-medium text-slate-800 dark:text-slate-200"
                  title={item.nasa_id}
                >
                  {item.nasa_id}
                </p>
              </InfoBox>
            </div>

            <InfoBox
              label="Source"
              className="bg-slate-50 text-sm dark:bg-slate-950/60"
              paddingClassName="p-4"
            >
              <p className="font-medium text-slate-800 dark:text-slate-200">
                NASA Image and Video Library
              </p>
            </InfoBox>
          </>
        }
      >
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
            <InfoBox label="Center" className="min-w-0">
              <p className="text-sm leading-6 font-medium text-slate-800 dark:text-slate-200 [overflow-wrap:anywhere]">
                {item.center ?? 'NASA'}
              </p>
            </InfoBox>
            <InfoBox label="ID" className="relative min-w-0" labelClassName="pr-20">
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
                className="truncate text-sm leading-6 font-medium text-slate-800 dark:text-slate-200"
                title={item.nasa_id}
              >
                {item.nasa_id}
              </p>
            </InfoBox>
          </div>

          <InfoBox label="Source" className="bg-slate-50 text-sm dark:bg-slate-950/60">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              NASA Image and Video Library
            </p>
          </InfoBox>
        </div>
      </ModalShell>

      {pendingExternalLink && (
        <ExternalLinkPrompt
          hostname={pendingExternalLink.hostname}
          label="Original"
          onCancel={cancelExternalLink}
          onConfirm={confirmExternalLink}
        />
      )}
    </ModalFrame>
  )
}
