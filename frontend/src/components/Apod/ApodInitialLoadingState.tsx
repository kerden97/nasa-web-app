import { Calendar, ChevronDown, Image as ImageIcon, Play, Shapes } from 'lucide-react'
import ApodCardSkeleton from '@/components/Apod/ApodCardSkeleton'
import FeaturedApodHeroSkeleton from '@/components/Apod/FeaturedApodHeroSkeleton'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import SegmentedControl from '@/components/Wonders/SegmentedControl'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface ApodInitialLoadingStateProps {
  cardCount?: number
}

export default function ApodInitialLoadingState({ cardCount = 20 }: ApodInitialLoadingStateProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')

  return (
    <>
      <FeaturedApodHeroSkeleton />

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="ui-kicker">Archive</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            Browse recent discoveries
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
            Jump through recent APOD entries with quick presets or a custom date range.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <p>
            {cardCount} item{cardCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: cardCount }).map((_, index) => (
          <ApodCardSkeleton key={index} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <span className="cosmic-btn-load-more rounded-full px-6 py-3 text-sm font-semibold opacity-50">
          Load more
        </span>
      </div>
    </>
  )
}
