import { useEffect, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import type { EpicImage } from '@/types/epic'

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
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
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
              Earth Polychromatic Imaging Camera
            </p>
            <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
              {item.caption}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex shrink-0 rounded-full border border-slate-300 bg-white p-2.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="scrollbar-thin overflow-y-auto">
          <div className="flex h-[50vh] items-center justify-center bg-black">
            <img src={item.image} alt={item.caption} className="h-full w-full object-contain" />
          </div>

          <div className="p-6">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              EPIC captures daily imagery of the full sunlit Earth from the DSCOVR spacecraft,
              offering a calm orbital perspective on cloud systems, continents, and atmospheric
              motion.
            </p>

            <div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Date
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                    {date}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Coordinates
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                    {item.centroid_coordinates.lat.toFixed(2)}°,{' '}
                    {item.centroid_coordinates.lon.toFixed(2)}°
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openExternalPrompt(item.image)}
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:border-blue-500 hover:bg-blue-500 md:w-auto md:min-w-48"
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  <ExternalLink size={14} />
                </span>
                <span>Original</span>
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60">
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
