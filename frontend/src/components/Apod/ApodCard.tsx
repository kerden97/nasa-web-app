import { useEffect, useRef, useState } from 'react'
import type { ApodItem } from '@/types/apod'
import { Play } from 'lucide-react'
import { formatApodLongDate, getApodTeaser, isDirectVideo } from '@/lib/apodMeta'

interface ApodCardProps {
  item: ApodItem
  onClick: (item: ApodItem) => void
}

export default function ApodCard({ item, onClick }: ApodCardProps) {
  const isVideo = item.media_type === 'video'
  const hasDirectVideo = isVideo && isDirectVideo(item.url)
  const thumbnail = isVideo ? item.thumbnail_url : item.url
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const cardRef = useRef<HTMLButtonElement>(null)
  const credit = item.copyright ?? 'NASA APOD'

  const readyToShow = loaded && inView

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
      className="group relative flex aspect-9/16 w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-black text-left shadow-sm transition-transform duration-300 hover:-translate-y-1 dark:border-slate-800"
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

      {thumbnail ? (
        <img
          src={thumbnail}
          alt={item.title}
          className={`h-full w-full object-contain transition-all duration-500 group-hover:scale-105 ${
            readyToShow ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
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

      <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm">
        {item.media_type}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/95 to-transparent px-4 pb-4 pt-14">
        <p className="text-sm font-semibold text-white line-clamp-2">{item.title}</p>
        <p className="mt-1 text-[11px] text-slate-300">{formatApodLongDate(item.date)}</p>
        <p className="mt-3 text-xs text-slate-300 line-clamp-2">
          {getApodTeaser(item.explanation)}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
          <span className="truncate text-slate-400">{credit}</span>
          <span className="whitespace-nowrap rounded-full border border-white/15 px-2.5 py-1 font-medium text-white/90 transition-colors group-hover:bg-white/10">
            View details
          </span>
        </div>
      </div>
    </button>
  )
}
