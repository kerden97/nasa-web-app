import type { ReactNode } from 'react'
import MediaBadge from '@/components/Wonders/MediaBadge'

interface MediaCardProps {
  badge: string
  imageAlt: string
  imageSrc?: string
  imageSrcSet?: string
  imageSizes?: string
  shouldLoadImage?: boolean
  readyToShow: boolean
  title: string
  meta: string
  footerLeft: string
  onClick: () => void
  onLoad?: () => void
  fallback?: ReactNode
  fit?: 'cover' | 'contain'
  teaser?: string
}

export default function MediaCard({
  badge,
  imageAlt,
  imageSrc,
  imageSrcSet,
  imageSizes,
  shouldLoadImage = true,
  readyToShow,
  title,
  meta,
  footerLeft,
  onClick,
  onLoad,
  fallback,
  fit = 'cover',
  teaser,
}: MediaCardProps) {
  const canRenderImage = !!imageSrc && shouldLoadImage
  const isDeferredImage = !!imageSrc && !shouldLoadImage

  return (
    <button
      type="button"
      onClick={onClick}
      className="card-glow card-glow--blue group relative flex aspect-9/16 w-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 text-left shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(11,61,145,0.3)] dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-[rgba(140,184,255,0.28)] dark:shadow-[0_22px_56px_rgba(2,6,23,0.35)]"
    >
      {!readyToShow && (
        <div className="absolute inset-0">
          <div className="h-full w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
        </div>
      )}

      {canRenderImage ? (
        <img
          src={imageSrc}
          srcSet={imageSrcSet}
          sizes={imageSizes}
          alt={imageAlt}
          className={`h-full w-full ${fit === 'cover' ? 'object-cover' : 'object-contain'} transition-all duration-700 group-hover:scale-105 ${
            readyToShow ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
          }`}
          loading="lazy"
          decoding="async"
          onLoad={onLoad}
        />
      ) : (
        (fallback ??
        (isDeferredImage ? (
          <div aria-hidden="true" className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No preview
          </div>
        )))
      )}

      <MediaBadge kind={badge} cardStyle className="absolute left-3 top-3" />

      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/78 via-45% to-slate-950/6" />
      <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pt-14 lg:px-4 lg:pb-4 lg:pt-20">
        <p className="text-[11px] font-medium text-slate-400 lg:text-sm">{meta}</p>
        <p className="mt-1 text-sm font-semibold leading-tight text-white line-clamp-2 lg:mt-2 lg:text-xl">
          {title}
        </p>
        {teaser && (
          <p className="mt-1.5 hidden text-sm leading-6 text-slate-300 line-clamp-3 xl:block">
            {teaser}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] lg:mt-3 lg:gap-3 lg:text-[11px]">
          <span className="truncate text-slate-400">{footerLeft}</span>
          <span className="whitespace-nowrap rounded-full border border-white/14 bg-white/5 px-2 py-0.5 font-medium text-white/90 transition-colors group-hover:border-[rgba(140,184,255,0.3)] group-hover:bg-[rgba(11,61,145,0.22)] lg:px-3 lg:py-1.5">
            View details
          </span>
        </div>
      </div>
    </button>
  )
}
