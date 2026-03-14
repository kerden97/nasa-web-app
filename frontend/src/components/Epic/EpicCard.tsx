import { useEffect, useRef, useState } from 'react'
import type { EpicImage } from '@/types/epic'

interface EpicCardProps {
  item: EpicImage
  onClick: (item: EpicImage) => void
}

export default function EpicCard({ item, onClick }: EpicCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const cardRef = useRef<HTMLButtonElement>(null)
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

  const date = new Date(item.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={() => onClick(item)}
      className="group relative flex aspect-9/16 w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-black text-left shadow-sm transition-transform duration-300 hover:-translate-y-1 dark:border-slate-800"
    >
      {!readyToShow && (
        <div className="absolute inset-0">
          <div className="h-full w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
        </div>
      )}

      <img
        src={item.image}
        alt={item.caption}
        className={`h-full w-full object-contain transition-all duration-500 group-hover:scale-105 ${
          readyToShow ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
        }`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />

      <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm">
        EPIC
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/95 to-transparent px-4 pb-4 pt-14">
        <p className="line-clamp-2 text-sm font-semibold text-white">{item.caption}</p>
        <p className="mt-1 text-[11px] text-slate-300">{date}</p>
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
          <span className="truncate text-slate-400">
            {item.centroid_coordinates.lat.toFixed(1)}°, {item.centroid_coordinates.lon.toFixed(1)}°
          </span>
          <span className="whitespace-nowrap rounded-full border border-white/15 px-2.5 py-1 font-medium text-white/90 transition-colors group-hover:bg-white/10">
            View details
          </span>
        </div>
      </div>
    </button>
  )
}
