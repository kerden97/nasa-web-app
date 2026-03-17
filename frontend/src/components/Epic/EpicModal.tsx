import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { EpicImage } from '@/types/epic'
import ModalFrame from '@/components/Wonders/ModalFrame'
import ExternalLinkPrompt from '@/components/Wonders/ExternalLinkPrompt'
import MediaBadge from '@/components/Wonders/MediaBadge'

interface EpicModalProps {
  item: EpicImage
  onClose: () => void
}

export default function EpicModal({ item, onClose }: EpicModalProps) {
  const [pendingExternalLink, setPendingExternalLink] = useState<{
    href: string
    hostname: string
  } | null>(null)

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

  const date = new Date(item.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const openExternalPrompt = (href: string) => {
    const hostname = new URL(href).hostname.replace(/^www\./, '')
    setPendingExternalLink({ href, hostname })
  }

  const confirmExternalLink = () => {
    if (!pendingExternalLink) return
    window.open(pendingExternalLink.href, '_blank', 'noopener,noreferrer')
    setPendingExternalLink(null)
  }

  return (
    <ModalFrame onClose={onClose} maxWidthClass="max-w-6xl">
      <div className="max-h-full overflow-y-auto lg:overflow-hidden">
        <div className="grid lg:h-[48rem] lg:max-h-[calc(100vh-73px-2rem)] lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          <div className="flex min-h-[18rem] max-h-[46svh] items-center justify-center bg-black sm:min-h-[20rem] sm:max-h-[52svh] lg:max-h-none">
            <img src={item.image} alt={item.caption} className="h-full w-full object-contain" />
          </div>

          <div className="relative flex flex-col border-t border-slate-200 bg-white/98 p-5 dark:border-slate-800 dark:bg-slate-900/96 lg:min-h-0 lg:border-l lg:border-t-0 lg:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-[#0B3D91]/12 blur-3xl" />
            <div className="relative flex flex-1 flex-col lg:min-h-0">
              <div className="sticky top-0 z-10 -mx-5 -mt-5 border-b border-slate-200 bg-white/96 px-5 pb-5 pt-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/96 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8">
                <div className="flex flex-wrap items-center gap-2 pr-12">
                  <span className="cosmic-pill-date rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.12em]">
                    {date}
                  </span>
                  <MediaBadge kind="Image" />
                </div>
                <h2 className="ui-page-title mt-5 pr-12 text-2xl leading-[1.08] text-slate-900 dark:text-white sm:text-3xl">
                  {item.caption}
                </h2>
              </div>

              <div className="mt-5 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
                <div className="lg:scrollbar-thin lg:h-full lg:overflow-y-auto lg:pr-2">
                  <p className="text-sm leading-8 text-slate-700 dark:text-slate-300">
                    EPIC captures daily imagery of the full sunlit Earth from the DSCOVR spacecraft,
                    offering a calm orbital perspective on cloud systems, continents, and
                    atmospheric motion.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/85 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Mission
                </p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  Earth Polychromatic Imaging Camera aboard DSCOVR
                </p>
              </div>

              <div className="mt-6 grid gap-5 border-t border-slate-200 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => openExternalPrompt(item.image)}
                  className="cosmic-btn-primary flex h-11 w-full items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    <ExternalLink size={14} />
                  </span>
                  <span>Original</span>
                </button>

                <div className="grid gap-4 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/85 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Coordinates
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {item.centroid_coordinates.lat.toFixed(2)}°,{' '}
                      {item.centroid_coordinates.lon.toFixed(2)}°
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Image ID
                    </p>
                    <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                      {item.identifier}
                    </p>
                  </div>
                </div>
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
