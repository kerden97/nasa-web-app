import { useRef, useState } from 'react'
import type { NasaImageItem } from '@/types/nasaImage'
import MediaCard from '@/components/Wonders/MediaCard'
import { buildCardSrcSet } from '@/lib/imageProxy'
import { useInView } from '@/hooks/useInView'
import { formatUtcMediumDate } from '@/lib/dateFormat'
import { WONDERS_CARD_IMAGE_SIZES } from '@/lib/wondersLayout'

interface ImageCardProps {
  item: NasaImageItem
  onClick: (item: NasaImageItem) => void
}

export default function ImageCard({ item, onClick }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const inView = useInView(cardRef)
  const readyToShow = loaded && inView
  const date = formatUtcMediumDate(item.date_created)

  return (
    <div ref={cardRef} className="w-full">
      <MediaCard
        badge={item.media_type}
        imageAlt={item.title}
        imageSrc={item.card_url ?? item.href}
        imageSrcSet={item.card_url ? buildCardSrcSet(item.card_url) : undefined}
        imageSizes={WONDERS_CARD_IMAGE_SIZES}
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
