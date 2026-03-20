import { useRef, useState } from 'react'
import type { EpicImage } from '@/types/epic'
import MediaCard from '@/components/Wonders/MediaCard'
import { buildCardSrcSet } from '@/lib/imageProxy'
import { useInView } from '@/hooks/useInView'
import { formatUtcLongDate } from '@/lib/dateFormat'
import { WONDERS_CARD_IMAGE_SIZES } from '@/lib/wondersLayout'

interface EpicCardProps {
  item: EpicImage
  onClick: (item: EpicImage) => void
}

export default function EpicCard({ item, onClick }: EpicCardProps) {
  const [loaded, setLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const inView = useInView(cardRef)
  const readyToShow = loaded && inView
  const date = formatUtcLongDate(item.date)

  return (
    <div ref={cardRef} className="w-full">
      <MediaCard
        badge="EPIC"
        imageAlt={item.caption}
        imageSrc={item.card_url ?? item.image}
        imageSrcSet={item.card_url ? buildCardSrcSet(item.card_url) : undefined}
        imageSizes={WONDERS_CARD_IMAGE_SIZES}
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
