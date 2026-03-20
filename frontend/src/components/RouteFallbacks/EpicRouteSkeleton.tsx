import { Calendar, ChevronDown, Globe, Sparkles } from 'lucide-react'
import EpicCardSkeleton from '@/components/Epic/EpicCardSkeleton'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import SectionHeader from '@/components/Wonders/SectionHeader'
import SegmentedControl from '@/components/Wonders/SegmentedControl'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  epicDateOptions,
  epicInitialCardCount,
  epicIntro,
  epicSectionDescription,
  epicSectionKicker,
  epicSectionTitle,
} from '@/content/epicContent'
import { WONDERS_MEDIA_GRID_CLASS } from '@/lib/wondersLayout'

export default function EpicRouteSkeleton() {
  const isMobile = useMediaQuery('(max-width: 639px)')
  return (
    <>
      <p className="mb-6 text-base leading-8 text-slate-500 dark:text-slate-400">{epicIntro}</p>

      <SectionHeader
        kicker={epicSectionKicker}
        title={epicSectionTitle}
        description={epicSectionDescription}
      >
        <p>{epicInitialCardCount} items</p>
      </SectionHeader>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {isMobile ? (
              <>
                <FilterChipButton active className="pointer-events-none">
                  {epicDateOptions[0].label}
                </FilterChipButton>
                <FilterChipButton className="pointer-events-none inline-flex items-center gap-1.5">
                  More
                  <ChevronDown size={14} />
                </FilterChipButton>
              </>
            ) : (
              epicDateOptions.map((option, index) => (
                <FilterChipButton
                  key={option.value}
                  onClick={() => {}}
                  active={index === 0}
                  className="pointer-events-none"
                >
                  {option.label}
                </FilterChipButton>
              ))
            )}
            <FilterChipButton
              onClick={() => {}}
              className="pointer-events-none inline-flex items-center gap-1.5"
            >
              <Calendar size={13} />
              Custom
            </FilterChipButton>
          </div>
        </div>

        <div className="self-start lg:shrink-0 lg:self-auto">
          <SegmentedControl
            legend="Image collection"
            className="w-fit pointer-events-none"
            value="natural"
            onChange={() => {}}
            options={[
              { value: 'natural', label: 'Natural', icon: <Globe size={14} /> },
              { value: 'enhanced', label: 'Enhanced', icon: <Sparkles size={14} /> },
            ]}
          />
        </div>
      </div>

      <div className={WONDERS_MEDIA_GRID_CLASS}>
        {Array.from({ length: epicInitialCardCount }).map((_, index) => (
          <EpicCardSkeleton key={index} />
        ))}
      </div>
    </>
  )
}
