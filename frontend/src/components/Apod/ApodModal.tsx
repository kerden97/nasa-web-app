import { useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import type { ApodItem } from '@/types/apod'
import { formatApodLongDate, formatApodRelativeDate, isDirectVideo } from '@/lib/apodMeta'

interface ApodModalProps {
  item: ApodItem
  onClose: () => void
}

export default function ApodModal({ item, onClose }: ApodModalProps) {
  const originalHref = item.url
  const hdHref = item.hdurl
  const showHdButton = !!hdHref && hdHref !== originalHref

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

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
            {item.media_type === 'image' ? (
              <img src={item.url} alt={item.title} className="h-full w-full object-contain" />
            ) : isDirectVideo(item.url) ? (
              <video src={item.url} controls autoPlay className="h-full w-full object-contain" />
            ) : (
              <iframe src={item.url} title={item.title} className="h-full w-full" allowFullScreen />
            )}
          </div>

          <div className="p-6">
            <p className="mt-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {item.explanation}
            </p>

            <div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {formatApodLongDate(item.date)}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {formatApodRelativeDate(item.date)}
                </p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2 md:w-auto md:min-w-[12.5rem]">
                <a
                  href={originalHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    <ExternalLink size={14} />
                  </span>
                  <span>Original</span>
                </a>
                {showHdButton && (
                  <a
                    href={hdHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:border-blue-500 hover:bg-blue-500"
                  >
                    <span className="flex h-4 w-4 items-center justify-center">
                      <ExternalLink size={14} />
                    </span>
                    <span>HD</span>
                  </a>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Credit
                </p>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                  {item.copyright ?? 'NASA APOD'}
                </p>
              </div>
              <div className="md:text-right">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Source
                </p>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                  NASA Astronomy Picture of the Day
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
