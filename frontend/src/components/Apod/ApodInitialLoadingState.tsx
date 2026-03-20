import { Calendar, ChevronDown, Image as ImageIcon, Play, Shapes } from 'lucide-react'
import ApodCardSkeleton from '@/components/Apod/ApodCardSkeleton'
import FeaturedApodHeroSkeleton from '@/components/Apod/FeaturedApodHeroSkeleton'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import LoadMoreButton from '@/components/Wonders/LoadMoreButton'
import SectionHeader from '@/components/Wonders/SectionHeader'
import SegmentedControl from '@/components/Wonders/SegmentedControl'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { WONDERS_MEDIA_GRID_CLASS } from '@/lib/wondersLayout'

interface ApodInitialLoadingStateProps {
  cardCount?: number
}

export default function ApodInitialLoadingState({ cardCount = 20 }: ApodInitialLoadingStateProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')

  return (
    <>
      <FeaturedApodHeroSkeleton />

      <SectionHeader
        kicker="Archive"
        title="Browse recent discoveries"
        description="Jump through recent APOD entries with quick presets or a custom date range."
      >
        <p>
          {cardCount} item{cardCount === 1 ? '' : 's'}
        </p>
      </SectionHeader>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {isMobile ? (
              <>
                <FilterChipButton>Today</FilterChipButton>
                <FilterChipButton className="inline-flex items-center gap-1.5">
                  More
                  <ChevronDown size={14} />
                </FilterChipButton>
              </>
            ) : (
              <>
                <FilterChipButton>Today</FilterChipButton>
                <FilterChipButton>Yesterday</FilterChipButton>
                <FilterChipButton>This week</FilterChipButton>
                <FilterChipButton>Last 7 days</FilterChipButton>
                <FilterChipButton>Last 30 days</FilterChipButton>
                <FilterChipButton>This month</FilterChipButton>
              </>
            )}
            <FilterChipButton className="inline-flex items-center gap-1.5">
              <Calendar size={13} />
              Custom
            </FilterChipButton>
          </div>
        </div>

        <div className="self-start lg:shrink-0 lg:self-auto">
          <SegmentedControl
            legend="Filter by media type"
            className="w-fit p-0.5 [&_button]:h-8 [&_button]:min-w-19 [&_button]:px-3 [&_button]:text-xs"
            value="all"
            onChange={() => {}}
            options={[
              { value: 'image', label: 'Image', icon: <ImageIcon size={13} /> },
              { value: 'video', label: 'Video', icon: <Play size={13} /> },
              { value: 'all', label: 'All', icon: <Shapes size={13} /> },
            ]}
          />
        </div>
      </div>

      <div className={WONDERS_MEDIA_GRID_CLASS}>
        {Array.from({ length: cardCount }).map((_, index) => (
          <ApodCardSkeleton key={index} />
        ))}
      </div>

      <LoadMoreButton disabled />
    </>
  )
}
