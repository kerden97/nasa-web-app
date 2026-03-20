import { useEffect, useRef, useState } from 'react'
import type { EpicImage } from '@/types/epic'
import MediaCard from '@/components/Wonders/MediaCard'
import { buildCardSrcSet } from '@/lib/imageProxy'

interface EpicCardProps {
  item: EpicImage
  onClick: (item: EpicImage) => void
}

export default function EpicCard({ item, onClick }: EpicCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
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
    <div ref={cardRef} className="w-full">
      <MediaCard
        badge="EPIC"
        imageAlt={item.caption}
        imageSrc={item.card_url ?? item.image}
        imageSrcSet={item.card_url ? buildCardSrcSet(item.card_url) : undefined}
        imageSizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        shouldLoadImage={inView}
        readyToShow={readyToShow}
        title={item.caption}
        meta={date}
        footerLeft={`${item.centroid_coordinates.lat.toFixed(1)}°, ${item.centroid_coordinates.lon.toFixed(1)}°`}
        teaser="DSCOVR full-disk Earth imagery from deep space."
        onClick={() => onClick(item)}
        onLoad={() => setLoaded(true)}
        fit="contain"
      />
    </div>
  )
}
