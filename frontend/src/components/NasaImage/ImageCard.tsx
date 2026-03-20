import { useEffect, useRef, useState } from 'react'
import type { NasaImageItem } from '@/types/nasaImage'
import MediaCard from '@/components/Wonders/MediaCard'
import { buildCardSrcSet } from '@/lib/imageProxy'

interface ImageCardProps {
  item: NasaImageItem
  onClick: (item: NasaImageItem) => void
}

export default function ImageCard({ item, onClick }: ImageCardProps) {
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

  const date = new Date(item.date_created).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div ref={cardRef} className="w-full">
      <MediaCard
        badge={item.media_type}
        imageAlt={item.title}
        imageSrc={item.card_url ?? item.href}
        imageSrcSet={item.card_url ? buildCardSrcSet(item.card_url) : undefined}
        imageSizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        shouldLoadImage={inView}
        readyToShow={readyToShow}
        title={item.title}
        meta={date}
        footerLeft={item.center ?? 'NASA'}
        teaser={item.description?.slice(0, 120)}
        onClick={() => onClick(item)}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
