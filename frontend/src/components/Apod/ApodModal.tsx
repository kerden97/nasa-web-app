import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { ApodItem } from '@/types/apod'
import ModalFrame from '@/components/Wonders/ModalFrame'
import ExternalLinkPrompt from '@/components/Wonders/ExternalLinkPrompt'
import MediaBadge from '@/components/Wonders/MediaBadge'
import { formatApodLongDate, formatApodRelativeDate, isDirectVideo } from '@/lib/apodMeta'

interface ApodModalProps {
  item: ApodItem
  onClose: () => void
}

export default function ApodModal({ item, onClose }: ApodModalProps) {
  const originalHref = item.url
  const hdHref = item.hdurl
  const showHdButton = !!hdHref && hdHref !== originalHref
  const credit = item.copyright ?? 'NASA/ESA'
  const explanationPreviewLength = 260
  const [expandedExplanation, setExpandedExplanation] = useState(false)
  const [pendingExternalLink, setPendingExternalLink] = useState<{
    href: string
    label: 'Original' | 'HD'
    hostname: string
  } | null>(null)
  const shouldTruncateExplanation = item.explanation.length > explanationPreviewLength
  const explanationText = useMemo(() => {
    if (!shouldTruncateExplanation || expandedExplanation) return item.explanation

    return `${item.explanation.slice(0, explanationPreviewLength).trimEnd()}...`
  }, [expandedExplanation, item.explanation, shouldTruncateExplanation])

  const queueExternalLink = (href: string, label: 'Original' | 'HD') => {
    const hostname = new URL(href).hostname.replace(/^www\./, '')
    setPendingExternalLink({ href, label, hostname })
  }

  const confirmExternalLink = () => {
    if (!pendingExternalLink) return
    window.open(pendingExternalLink.href, '_blank', 'noopener,noreferrer')
    setPendingExternalLink(null)
  }

  return (
    <ModalFrame onClose={onClose}>
      <div className="max-h-full overflow-y-auto lg:overflow-hidden">
        <div className="grid lg:h-[48rem] lg:max-h-[calc(100vh-73px-2rem)] lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          <div className="flex min-h-[18rem] max-h-[46svh] items-center justify-center bg-black sm:min-h-[20rem] sm:max-h-[52svh] lg:max-h-none">
            {item.media_type === 'image' ? (
              <img src={item.url} alt={item.title} className="h-full w-full object-contain" />
            ) : isDirectVideo(item.url) ? (
              <video src={item.url} controls autoPlay className="h-full w-full object-contain" />
            ) : (
              <iframe src={item.url} title={item.title} className="h-full w-full" allowFullScreen />
            )}
          </div>

          <div className="relative flex flex-col border-t border-slate-200 bg-white/98 p-5 dark:border-slate-800 dark:bg-slate-900/96 lg:min-h-0 lg:border-l lg:border-t-0 lg:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-[#0B3D91]/12 blur-3xl" />

            <div className="relative flex flex-1 flex-col lg:min-h-0">
              <div className="sticky top-0 z-10 -mx-5 -mt-5 border-b border-slate-200 bg-white/96 px-5 pb-5 pt-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/96 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8">
                <div className="flex flex-wrap items-center gap-2 pr-12">
                  <span className="cosmic-pill-date rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.12em]">
                    {formatApodLongDate(item.date)}
                  </span>
                  <MediaBadge kind={item.media_type} />
                </div>

                <h2 className="ui-page-title mt-5 pr-12 text-2xl leading-[1.08] text-slate-900 dark:text-white sm:text-3xl">
                  {item.title}
                </h2>
              </div>

              <div
                className={`mt-5 ${expandedExplanation ? 'lg:min-h-0 lg:flex-1 lg:overflow-hidden' : ''}`}
              >
                <div
                  className={
                    expandedExplanation
                      ? 'lg:scrollbar-thin lg:h-full lg:overflow-y-auto lg:pr-2'
                      : ''
                  }
                >
                  <p
                    className={`text-[15px] leading-8 text-slate-600 dark:text-slate-300 ${
                      expandedExplanation ? '' : 'line-clamp-5'
                    }`}
                  >
                    {explanationText}
                  </p>
                  {shouldTruncateExplanation && (
                    <button
                      type="button"
                      onClick={() => setExpandedExplanation((current) => !current)}
                      className="mt-3 text-sm font-semibold text-slate-900 underline decoration-slate-400 decoration-2 underline-offset-4 transition hover:text-[#0B3D91] hover:decoration-[#0B3D91] dark:text-white dark:decoration-slate-600 dark:hover:text-[#8CB8FF] dark:hover:decoration-[#8CB8FF]"
                    >
                      {expandedExplanation ? 'See less' : 'See more'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 border-t border-slate-200 pt-5 dark:border-slate-800">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => queueExternalLink(originalHref, 'Original')}
                  className={`flex h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium ${
                    showHdButton ? 'cosmic-btn-ghost' : 'cosmic-btn-primary'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    <ExternalLink size={14} />
                  </span>
                  <span>Original</span>
                </button>

                {showHdButton ? (
                  <button
                    type="button"
                    onClick={() => queueExternalLink(hdHref, 'HD')}
                    className="cosmic-btn-primary flex h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold"
                  >
                    <span className="flex h-4 w-4 items-center justify-center">
                      <ExternalLink size={14} />
                    </span>
                    <span>HD</span>
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/85 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Published
                  </p>
                  <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">
                    {formatApodRelativeDate(item.date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/85 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Media
                  </p>
                  <p className="mt-2 font-medium uppercase text-slate-800 dark:text-slate-200">
                    {item.media_type}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Credit
                </p>
                <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">{credit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pendingExternalLink && (
        <ExternalLinkPrompt
          hostname={pendingExternalLink.hostname}
          label={pendingExternalLink.label}
          onCancel={() => setPendingExternalLink(null)}
          onConfirm={confirmExternalLink}
        />
      )}
    </ModalFrame>
  )
}
