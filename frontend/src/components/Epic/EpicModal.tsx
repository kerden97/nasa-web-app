import { ExternalLink } from 'lucide-react'
import type { EpicImage } from '@/types/epic'
import ModalFrame from '@/components/Wonders/ModalFrame'
import ModalShell from '@/components/Wonders/ModalShell'
import ExternalLinkPrompt from '@/components/Wonders/ExternalLinkPrompt'
import InfoBox from '@/components/Wonders/InfoBox'
import MediaBadge from '@/components/Wonders/MediaBadge'
import useExternalLink from '@/hooks/useExternalLink'
import { formatUtcLongDate } from '@/lib/dateFormat'

interface EpicModalProps {
  item: EpicImage
  onClose: () => void
}

export default function EpicModal({ item, onClose }: EpicModalProps) {
  const { pendingExternalLink, queueExternalLink, confirmExternalLink, cancelExternalLink } =
    useExternalLink('Original')
  const date = formatUtcLongDate(item.date)

  return (
    <ModalFrame onClose={onClose} maxWidthClass="max-w-6xl" titleId="epic-modal-title">
      <ModalShell
        media={<img src={item.image} alt={item.caption} className="h-full w-full object-contain" />}
        header={
          <>
            <div className="flex flex-wrap items-center gap-2 pr-12">
              <span className="cosmic-pill-date rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.12em]">
                {date}
              </span>
              <MediaBadge kind="Image" />
            </div>
            <h2
              id="epic-modal-title"
              className="ui-page-title mt-4 pr-12 text-xl leading-[1.08] text-slate-900 dark:text-white sm:text-3xl"
            >
              {item.caption}
            </h2>
          </>
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => queueExternalLink(item.image)}
              className="cosmic-btn-primary flex h-11 w-full items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium"
            >
              <span className="flex h-4 w-4 items-center justify-center">
                <ExternalLink size={14} />
              </span>
              <span>Original</span>
            </button>

            <InfoBox label="Mission">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Earth Polychromatic Imaging Camera aboard DSCOVR
              </p>
            </InfoBox>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <InfoBox label="Coordinates">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {item.centroid_coordinates.lat.toFixed(2)}°,{' '}
                  {item.centroid_coordinates.lon.toFixed(2)}°
                </p>
              </InfoBox>
              <InfoBox
                label="Image ID"
                className="bg-slate-50 text-sm dark:bg-slate-950/60"
                paddingClassName="p-4"
              >
                <p className="font-medium text-slate-800 dark:text-slate-200">{item.identifier}</p>
              </InfoBox>
            </div>
          </>
        }
      >
        <p className="text-sm leading-7 text-slate-700 dark:text-slate-300 sm:leading-8">
          EPIC captures daily imagery of the full sunlit Earth from the DSCOVR spacecraft, offering
          a calm orbital perspective on cloud systems, continents, and atmospheric motion.
        </p>

        <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 lg:hidden">
          <button
            type="button"
            onClick={() => queueExternalLink(item.image)}
            className="cosmic-btn-primary flex h-10 w-full items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium"
          >
            <span className="flex h-4 w-4 items-center justify-center">
              <ExternalLink size={14} />
            </span>
            <span>Original</span>
          </button>

          <InfoBox label="Mission">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Earth Polychromatic Imaging Camera aboard DSCOVR
            </p>
          </InfoBox>

          <div className="grid gap-3">
            <InfoBox label="Coordinates">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {item.centroid_coordinates.lat.toFixed(2)}°,{' '}
                {item.centroid_coordinates.lon.toFixed(2)}°
              </p>
            </InfoBox>
            <InfoBox label="Image ID" className="bg-slate-50 text-sm dark:bg-slate-950/60">
              <p className="font-medium text-slate-800 dark:text-slate-200">{item.identifier}</p>
            </InfoBox>
          </div>
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
