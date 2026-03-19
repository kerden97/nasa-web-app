import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, Globe, Sparkles } from 'lucide-react'
import EpicCard from '@/components/Epic/EpicCard'
import EpicCardSkeleton from '@/components/Epic/EpicCardSkeleton'
import InlineErrorNotice from '@/components/Feedback/InlineErrorNotice'
import MiniCalendar from '@/components/MiniCalendar'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import ActiveFilterPill from '@/components/Wonders/ActiveFilterPill'
import PresetOverflowMenu from '@/components/Wonders/PresetOverflowMenu'
import SegmentedControl from '@/components/Wonders/SegmentedControl'
import {
  epicDateOptions,
  epicInitialCardCount,
  epicIntro,
  epicSectionDescription,
  epicSectionKicker,
  epicSectionTitle,
} from '@/content/epicContent'
import { useClickOutside } from '@/hooks/useClickOutside'
import { formatLabel, todayStr } from '@/lib/calendarUtils'
import { useEpic, useEpicDates } from '@/hooks/useEpic'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { EpicCollection, EpicImage } from '@/types/epic'

type EpicDatePreset = 'latest' | 'previous' | 'week' | 'month' | 'custom'
const EpicModal = lazy(() => import('@/components/Epic/EpicModal'))

export default function EpicPage() {
  const [collection, setCollection] = useState<EpicCollection>('natural')
  const [datePreset, setDatePreset] = useState<EpicDatePreset>('latest')
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const { dates, loading: datesLoading } = useEpicDates(collection)
  const effectiveSelectedDate =
    selectedDate && dates.includes(selectedDate) ? selectedDate : dates[0]
  const { images, loading, error } = useEpic(collection, effectiveSelectedDate)
  const [selectedItem, setSelectedItem] = useState<EpicImage | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery('(max-width: 639px)')

  useEffect(() => {
    document.title = 'EPIC | Wonders of the Universe | Home & Beyond'
  }, [])

  const closeCalendar = useCallback(() => setCalendarOpen(false), [])
  useClickOutside(dropdownRef, closeCalendar)

  const availableDatesSet = useMemo(() => new Set(dates), [dates])

  const isDateDisabled = (iso: string) => iso > todayStr() || !availableDatesSet.has(iso)

  const selectClosestDate = (target: Date) => {
    const targetValue = target.toISOString().slice(0, 10)
    return dates.find((date) => date <= targetValue) ?? dates.at(-1) ?? dates[0]
  }

  const handleDatePreset = (preset: Exclude<EpicDatePreset, 'custom'>) => {
    if (dates.length === 0) return

    let nextDate = dates[0]

    if (preset === 'previous') {
      nextDate = dates[1] ?? dates[0]
    }

    if (preset === 'week') {
      const target = new Date()
      target.setDate(target.getDate() - 7)
      nextDate = selectClosestDate(target)
    }

    if (preset === 'month') {
      const target = new Date()
      target.setDate(target.getDate() - 30)
      nextDate = selectClosestDate(target)
    }

    setDatePreset(preset)
    setSelectedDate(nextDate)
    setCalendarOpen(false)
  }

  const handleCalendarSelect = (iso: string) => {
    setDatePreset('custom')
    setSelectedDate(iso)
    setCalendarOpen(false)
  }

  const handleEpicReset = () => {
    setDatePreset('latest')
    setSelectedDate(undefined)
    setCalendarOpen(false)
  }

  const isEpicFiltered = datePreset !== 'latest'

  const epicSelectionLabel = (() => {
    if (datePreset === 'latest') return null
    if (datePreset === 'previous') return 'Previous'
    if (datePreset === 'week') return '1 week ago'
    if (datePreset === 'month') return '1 month ago'
    if (effectiveSelectedDate) return formatLabel(effectiveSelectedDate)
    return null
  })()

  const dateOptions = epicDateOptions
  const mobilePrimaryOption =
    datePreset === 'custom'
      ? dateOptions[0]
      : (dateOptions.find((option) => option.value === datePreset) ?? dateOptions[0])
  const shouldShowEpicSelectionPill =
    isEpicFiltered && epicSelectionLabel && (!isMobile || datePreset === 'custom')

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

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          {images.length > 0 && (
            <p>
              {images.length} item{images.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {isMobile ? (
              <PresetOverflowMenu
                currentValue={mobilePrimaryOption.value}
                currentActive={datePreset === mobilePrimaryOption.value}
                options={dateOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onSelect={(value) => handleDatePreset(value as Exclude<EpicDatePreset, 'custom'>)}
              />
            ) : (
              dateOptions.map((option) => (
                <FilterChipButton
                  key={option.value}
                  onClick={() => handleDatePreset(option.value)}
                  active={datePreset === option.value}
                >
                  {option.label}
                </FilterChipButton>
              ))
            )}
            <div className="relative" ref={dropdownRef}>
              <FilterChipButton
                onClick={() => setCalendarOpen(!calendarOpen)}
                active={datePreset === 'custom' || calendarOpen}
                className="inline-flex items-center gap-1.5"
                ariaExpanded={calendarOpen}
              >
                <Calendar size={13} />
                Custom
              </FilterChipButton>

              {calendarOpen && (
                <div className="absolute left-0 top-full z-40 mt-2 rounded-[22px] border border-slate-200 bg-white/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/96 dark:shadow-[0_24px_70px_rgba(2,6,23,0.5)]">
                  <MiniCalendar
                    rangeStart={effectiveSelectedDate ?? null}
                    rangeEnd={null}
                    hoveredDate={null}
                    onSelect={handleCalendarSelect}
                    onHover={() => {}}
                    isDateDisabled={isDateDisabled}
                  />
                </div>
              )}
            </div>
            {shouldShowEpicSelectionPill && (
              <ActiveFilterPill label={epicSelectionLabel} onClear={handleEpicReset} />
            )}
          </div>
        </div>

        <div className="self-start lg:shrink-0 lg:self-auto">
          <SegmentedControl
            legend="Image collection"
            className="w-fit"
            value={collection}
            onChange={(value: EpicCollection) => {
              setCollection(value)
              setDatePreset('latest')
              setSelectedDate(undefined)
              setCalendarOpen(false)
            }}
            options={[
              { value: 'natural', label: 'Natural', icon: <Globe size={14} /> },
              { value: 'enhanced', label: 'Enhanced', icon: <Sparkles size={14} /> },
            ]}
          />
        </div>
      </div>

      {error && (
        <InlineErrorNotice className="mb-6" title="Unable to load EPIC imagery" message={error} />
      )}

      {!loading && !error && images.length === 0 && !datesLoading && (
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No EPIC imagery is available for this collection right now.
        </div>
      )}

      <div aria-live="polite" className="sr-only">
        {loading || datesLoading
          ? 'Loading EPIC imagery...'
          : `${images.length} image${images.length === 1 ? '' : 's'} loaded`}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((item) => (
          <EpicCard key={item.identifier} item={item} onClick={setSelectedItem} />
        ))}
        {(loading || datesLoading) &&
          Array.from({ length: epicInitialCardCount }).map((_, index) => (
            <EpicCardSkeleton key={index} />
          ))}
      </div>

      {selectedItem && (
        <Suspense fallback={null}>
          <EpicModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </Suspense>
      )}
    </>
  )
}
