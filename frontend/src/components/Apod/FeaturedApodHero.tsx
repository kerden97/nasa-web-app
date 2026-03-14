import type { ApodItem } from '@/types/apod'
import { formatApodLongDate, formatApodRelativeDate, isDirectVideo } from '@/lib/apodMeta'

interface FeaturedApodHeroProps {
  item: ApodItem
  onOpen: (item: ApodItem) => void
}

export default function FeaturedApodHero({ item, onOpen }: FeaturedApodHeroProps) {
  const isVideo = item.media_type === 'video'
  const heroImage = isVideo ? item.thumbnail_url : item.url
  const hasDirectVideo = isVideo && isDirectVideo(item.url)

  return (
    <section className="mb-10 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <div className="relative max-h-130 min-h-130 overflow-hidden bg-black">
          {heroImage ? (
            <img src={heroImage} alt={item.title} className="h-full w-full object-cover" />
          ) : hasDirectVideo ? (
            <video src={item.url} muted autoPlay loop className="h-full w-full object-cover" />
          ) : isVideo ? (
            <iframe src={item.url} title={item.title} className="h-full w-full" allowFullScreen />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No preview available
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
          <div className="font-nasa absolute left-5 top-5 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white backdrop-blur-sm">
            Featured APOD
          </div>
        </div>

        <div className="flex flex-col justify-between overflow-hidden p-6 lg:p-7">
          <div className="min-h-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              {item.media_type}
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-950 dark:text-white">
              {item.title}
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {formatApodLongDate(item.date)}
            </p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {formatApodRelativeDate(item.date)}
            </p>
            <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {item.explanation}
            </p>
          </div>

          <div className="mt-4 flex shrink-0 items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {item.copyright ?? 'NASA APOD'}
            </span>
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Explore details
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
