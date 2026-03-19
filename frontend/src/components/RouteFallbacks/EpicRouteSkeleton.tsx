import { Calendar, Globe, Sparkles } from 'lucide-react'
import EpicCardSkeleton from '@/components/Epic/EpicCardSkeleton'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import SegmentedControl from '@/components/Wonders/SegmentedControl'
import {
  epicDateOptions,
  epicInitialCardCount,
  epicIntro,
  epicSectionDescription,
  epicSectionKicker,
  epicSectionTitle,
} from '@/content/epicContent'

export default function EpicRouteSkeleton() {
  return (
    <>
      <p className="mb-6 text-base leading-8 text-slate-500 dark:text-slate-400">{epicIntro}</p>

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="ui-kicker">{epicSectionKicker}</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            {epicSectionTitle}
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
            {epicSectionDescription}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {epicDateOptions.map((option, index) => (
              <FilterChipButton
                key={option.value}
                onClick={() => {}}
                active={index === 0}
                className="pointer-events-none"
              >
                {option.label}
              </FilterChipButton>
            ))}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: epicInitialCardCount }).map((_, index) => (
          <EpicCardSkeleton key={index} />
        ))}
      </div>
    </>
  )
}
