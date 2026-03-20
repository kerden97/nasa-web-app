import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { ApodItem } from '@/types/apod'
import ModalFrame from '@/components/Wonders/ModalFrame'
import ModalShell from '@/components/Wonders/ModalShell'
import ExternalLinkPrompt from '@/components/Wonders/ExternalLinkPrompt'
import InfoBox from '@/components/Wonders/InfoBox'
import MediaBadge from '@/components/Wonders/MediaBadge'
import useExternalLink from '@/hooks/useExternalLink'
import { formatApodLongDate, isDirectVideo } from '@/lib/apodMeta'

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
  const { pendingExternalLink, queueExternalLink, confirmExternalLink, cancelExternalLink } =
    useExternalLink<'Original' | 'HD'>('Original')
  const shouldTruncateExplanation = item.explanation.length > explanationPreviewLength
  const explanationText = useMemo(() => {
    if (!shouldTruncateExplanation || expandedExplanation) return item.explanation

    return `${item.explanation.slice(0, explanationPreviewLength).trimEnd()}...`
  }, [expandedExplanation, item.explanation, shouldTruncateExplanation])

  return (
    <ModalFrame onClose={onClose} titleId="apod-modal-title">
      <ModalShell
        media={
          item.media_type === 'image' ? (
            <img src={item.url} alt={item.title} className="h-full w-full object-contain" />
          ) : isDirectVideo(item.url) ? (
            <video src={item.url} controls autoPlay className="h-full w-full object-contain" />
          ) : (
            <iframe src={item.url} title={item.title} className="h-full w-full" allowFullScreen />
          )
        }
        header={
          <>
            <div className="flex flex-wrap items-center gap-2 pr-12">
              <span className="cosmic-pill-date rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.12em]">
                {formatApodLongDate(item.date)}
              </span>
              <MediaBadge kind={item.media_type} />
            </div>

            <h2
              id="apod-modal-title"
              className="ui-page-title mt-4 pr-12 text-xl leading-[1.08] text-slate-900 dark:text-white sm:text-3xl"
            >
              {item.title}
            </h2>
          </>
        }
        footer={
          <>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => queueExternalLink(originalHref, 'Original')}
                className={`flex h-10 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-medium sm:h-11 sm:px-3 sm:text-sm ${
                  !showHdButton ? 'col-span-2' : ''
                } ${showHdButton ? 'cosmic-btn-ghost' : 'cosmic-btn-primary'}`}
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
                  className="cosmic-btn-primary flex h-10 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold sm:h-11 sm:px-3 sm:text-sm"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    <ExternalLink size={14} />
                  </span>
                  <span>HD</span>
                </button>
              ) : null}
            </div>

            <InfoBox
              label="Credit"
              className="bg-slate-50 text-sm dark:bg-slate-950/60"
              paddingClassName="p-3 lg:p-4"
            >
              <p className="font-medium text-slate-800 dark:text-slate-200">{credit}</p>
            </InfoBox>
          </>
        }
      >
        <p
          className={`text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:leading-8 ${
            expandedExplanation ? '' : 'line-clamp-5'
          }`}
        >
          {explanationText}
        </p>
        {shouldTruncateExplanation && (
          <button
            type="button"
            onClick={() => setExpandedExplanation((current) => !current)}
            className="mt-2 text-sm font-semibold text-slate-900 underline decoration-slate-400 decoration-2 underline-offset-4 transition hover:text-[#0B3D91] hover:decoration-[#0B3D91] dark:text-white dark:decoration-slate-600 dark:hover:text-[#8CB8FF] dark:hover:decoration-[#8CB8FF] lg:mt-3"
          >
            {expandedExplanation ? 'See less' : 'See more'}
          </button>
        )}

        <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => queueExternalLink(originalHref, 'Original')}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-medium ${
                !showHdButton ? 'col-span-2' : ''
              } ${showHdButton ? 'cosmic-btn-ghost' : 'cosmic-btn-primary'}`}
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
                className="cosmic-btn-primary flex h-10 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold"
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  <ExternalLink size={14} />
                </span>
                <span>HD</span>
              </button>
            ) : null}
          </div>

          <InfoBox label="Credit" className="bg-slate-50 dark:bg-slate-950/60">
            <p className="font-medium text-slate-800 dark:text-slate-200">{credit}</p>
          </InfoBox>
        </div>
      </ModalShell>

      {pendingExternalLink && (
        <ExternalLinkPrompt
          hostname={pendingExternalLink.hostname}
          label={pendingExternalLink.label}
          onCancel={cancelExternalLink}
          onConfirm={confirmExternalLink}
        />
      )}
    </ModalFrame>
  )
}
