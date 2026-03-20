import { useEffect, useRef, useState } from 'react'
import type { ApodItem } from '@/types/apod'
import { Play } from 'lucide-react'
import MediaBadge from '@/components/Wonders/MediaBadge'
import { formatApodLongDate, getApodTeaser, isDirectVideo } from '@/lib/apodMeta'
import { buildCardSrcSet } from '@/lib/imageProxy'

interface ApodCardProps {
  item: ApodItem
  onClick: (item: ApodItem) => void
}

export default function ApodCard({ item, onClick }: ApodCardProps) {
  const isVideo = item.media_type === 'video'
  const hasDirectVideo = isVideo && isDirectVideo(item.url)
  const thumbnail = isVideo ? item.thumbnail_url : (item.card_url ?? item.url)
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const cardRef = useRef<HTMLButtonElement>(null)
  const credit = item.copyright ?? 'NASA APOD'
  const readyToShow = loaded && inView
  const shouldLoadImage = inView && Boolean(thumbnail)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '50px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <button
      ref={cardRef}
      onClick={() => onClick(item)}
      className="card-glow card-glow--blue group relative flex aspect-9/16 w-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 text-left shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(11,61,145,0.3)] dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-[rgba(140,184,255,0.28)] dark:shadow-[0_22px_56px_rgba(2,6,23,0.35)]"
    >
      {thumbnail && !readyToShow && (
        <div className="absolute inset-0">
          <div className="h-full w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
      )}

      {shouldLoadImage && thumbnail ? (
        <img
          src={thumbnail}
          alt={item.title}
          className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
            readyToShow ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
          }`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          {...(item.card_url
            ? {
                srcSet: buildCardSrcSet(item.card_url),
                sizes: '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
              }
            : {})}
        />
      ) : thumbnail ? (
        <div aria-hidden="true" className="h-full w-full" />
      ) : hasDirectVideo ? (
        <video
          src={item.url}
          muted
          preload="metadata"
          className={`h-full w-full object-contain transition-all duration-500 group-hover:scale-105 ${
            readyToShow ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
          }`}
          onLoadedData={() => setLoaded(true)}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
          <Play size={32} />
          <span className="text-xs">Video</span>
        </div>
      )}

      <MediaBadge kind={item.media_type} cardStyle className="absolute left-3 top-3" />

      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/78 via-45% to-slate-950/6" />
      <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pt-14 lg:px-4 lg:pb-4 lg:pt-20">
        <p className="text-[11px] font-medium text-slate-400 lg:text-sm">
          {formatApodLongDate(item.date)}
        </p>
        <p className="mt-1 text-sm font-semibold leading-tight text-white line-clamp-2 lg:mt-2 lg:text-xl">
          {item.title}
        </p>
        <p className="mt-1.5 hidden text-sm leading-6 text-slate-300 line-clamp-2 xl:block">
          {getApodTeaser(item.explanation)}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] lg:mt-3 lg:gap-3 lg:text-[11px]">
          <span className="truncate text-slate-400">{credit}</span>
          <span className="whitespace-nowrap rounded-full border border-white/14 bg-white/5 px-2 py-0.5 font-medium text-white/90 transition-colors group-hover:border-[rgba(140,184,255,0.3)] group-hover:bg-[rgba(11,61,145,0.22)] lg:px-2.5 lg:py-1">
            View details
          </span>
        </div>
      </div>
    </button>
  )
}
