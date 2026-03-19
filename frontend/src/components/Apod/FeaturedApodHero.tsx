import type { KeyboardEvent } from 'react'
import type { ApodItem } from '@/types/apod'
import MediaBadge from '@/components/Wonders/MediaBadge'
import { formatApodLongDate, formatApodRelativeDate, isDirectVideo } from '@/lib/apodMeta'

interface FeaturedApodHeroProps {
  item: ApodItem
  onOpen: (item: ApodItem) => void
}

export default function FeaturedApodHero({ item, onOpen }: FeaturedApodHeroProps) {
  const isVideo = item.media_type === 'video'
  const heroImage = isVideo ? item.thumbnail_url : (item.hero_url ?? item.url)
  const hasDirectVideo = isVideo && isDirectVideo(item.url)
  const credit = item.copyright ?? 'NASA APOD'
  const handleOpen = () => onOpen(item)
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpen()
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${item.title}`}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className="card-glow card-glow--blue relative mb-12 block w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 text-left shadow-[0_28px_90px_rgba(15,23,42,0.1)] transition-transform duration-300 hover:-translate-y-0.5 dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_30px_90px_rgba(2,6,23,0.45)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(11,61,145,0.16),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(99,102,241,0.12),transparent_28%)]" />
      <div className="relative grid lg:h-[32.5rem] lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.95fr)]">
        <div className="relative min-h-[30rem] overflow-hidden bg-black sm:min-h-[21rem] lg:h-[32.5rem]">
          {heroImage ? (
            <img
              src={heroImage}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          ) : hasDirectVideo ? (
            <video src={item.url} muted autoPlay loop className="h-full w-full object-cover" />
          ) : isVideo ? (
            <iframe src={item.url} title={item.title} className="h-full w-full" allowFullScreen />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No preview available
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-tr from-slate-950/18 via-transparent to-[#0B3D91]/10" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/72 via-slate-950/18 to-transparent" />
          <div className="absolute left-5 top-5 rounded-full border border-amber-300/30 bg-amber-400/16 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 backdrop-blur-sm">
            Today&apos;s pick
          </div>
        </div>

        <div className="relative flex flex-col overflow-hidden p-6 lg:h-[32.5rem] lg:min-h-0 lg:p-7">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#0B3D91]/12 blur-3xl" />
          <div className="min-h-0 flex-1 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2">
              <span className="cosmic-pill-date rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.12em]">
                {formatApodLongDate(item.date)}
              </span>
              <MediaBadge kind={item.media_type} />
            </div>

            <h2 className="ui-page-title mt-4 text-2xl leading-[1.08] text-slate-950 dark:text-white sm:text-3xl">
              {item.title}
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {formatApodRelativeDate(item.date)}
            </p>
            <p className="mt-4 max-w-xl overflow-hidden line-clamp-6 text-base leading-8 text-slate-600 dark:text-slate-300">
              {item.explanation}
            </p>
          </div>

          <div className="mt-6 flex shrink-0 flex-col gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:mt-auto sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Credit
              </p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 [overflow-wrap:anywhere]">
                {credit}
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                handleOpen()
              }}
              aria-label="Explore details"
              className="cosmic-btn-primary shrink-0 whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold"
            >
              View details
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
