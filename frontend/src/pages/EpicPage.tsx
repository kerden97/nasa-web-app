import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, Globe, Sparkles } from 'lucide-react'
import EpicCard from '@/components/Epic/EpicCard'
import EpicCardSkeleton from '@/components/Epic/EpicCardSkeleton'
import EpicModal from '@/components/Epic/EpicModal'
import MiniCalendar from '@/components/MiniCalendar'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import ActiveFilterPill from '@/components/Wonders/ActiveFilterPill'
import SegmentedControl from '@/components/Wonders/SegmentedControl'
import { useClickOutside } from '@/hooks/useClickOutside'
import { formatLabel, todayStr } from '@/lib/calendarUtils'
import { useEpic, useEpicDates } from '@/hooks/useEpic'
import type { EpicCollection, EpicImage } from '@/types/epic'

type EpicDatePreset = 'latest' | 'previous' | 'week' | 'month' | 'custom'

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
    if (datePreset === 'week') return 'Last 7 days'
    if (datePreset === 'month') return 'Last 30 days'
    if (effectiveSelectedDate) return formatLabel(effectiveSelectedDate)
    return null
  })()

  const dateOptions: { label: string; value: Exclude<EpicDatePreset, 'custom'> }[] = [
    { label: 'Latest', value: 'latest' },
    { label: 'Previous', value: 'previous' },
    { label: 'Last 7 days', value: 'week' },
    { label: 'Last 30 days', value: 'month' },
  ]

  return (
    <>
      <p className="mb-6 text-sm leading-7 text-slate-500 dark:text-slate-400">
        EPIC offers full-disk Earth imagery captured from deep space. Switch between natural color
        and enhanced imagery to compare how cloud structures, landmasses, and atmospheric patterns
        appear from the DSCOVR mission.
      </p>

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-nasa text-xs uppercase tracking-[0.28em] text-cyan-500 dark:text-cyan-300">
            Earth From Deep Space
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            Daily full-disk views of Earth
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Switch between the latest Earth views, quick date presets, or a custom day across both
            EPIC collections.
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
            {dateOptions.map((option) => (
              <FilterChipButton
                key={option.value}
                onClick={() => handleDatePreset(option.value)}
                active={datePreset === option.value}
              >
                {option.label}
              </FilterChipButton>
            ))}
            <div className="relative" ref={dropdownRef}>
              <FilterChipButton
                onClick={() => setCalendarOpen(!calendarOpen)}
                active={datePreset === 'custom' || calendarOpen}
                className="inline-flex items-center gap-1.5"
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
            {isEpicFiltered && epicSelectionLabel && (
              <ActiveFilterPill label={epicSelectionLabel} onClear={handleEpicReset} />
            )}
          </div>
        </div>

        <div className="self-start lg:shrink-0 lg:self-auto">
          <SegmentedControl
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
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && images.length === 0 && !datesLoading && (
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No EPIC imagery is available for this collection right now.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((item) => (
          <EpicCard key={item.identifier} item={item} onClick={setSelectedItem} />
        ))}
        {(loading || datesLoading) &&
          Array.from({ length: 8 }).map((_, index) => <EpicCardSkeleton key={index} />)}
      </div>

      {selectedItem && <EpicModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </>
  )
}
