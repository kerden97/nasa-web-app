import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, X } from 'lucide-react'
import EpicCard from '@/components/Epic/EpicCard'
import EpicCardSkeleton from '@/components/Epic/EpicCardSkeleton'
import EpicModal from '@/components/Epic/EpicModal'
import MiniCalendar from '@/components/MiniCalendar'
import { formatLabel, todayStr } from '@/lib/calendarUtils'
import { useEpic, useEpicDates } from '@/hooks/useEpic'
import type { EpicCollection, EpicImage } from '@/types/epic'

const collectionOptions: { label: string; value: EpicCollection }[] = [
  { label: 'Natural', value: 'natural' },
  { label: 'Enhanced', value: 'enhanced' },
]

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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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

  const latestDateLabel = useMemo(() => {
    if (!effectiveSelectedDate) return 'Fetching the latest Earth imagery...'

    return new Date(effectiveSelectedDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [effectiveSelectedDate])

  const pillBase =
    'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap'
  const pillIdle =
    'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800'
  const pillActive =
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
  const dateOptions: { label: string; value: Exclude<EpicDatePreset, 'custom'> }[] = [
    { label: 'Latest', value: 'latest' },
    { label: 'Previous', value: 'previous' },
    { label: 'Last 7 days', value: 'week' },
    { label: 'Last 30 days', value: 'month' },
  ]

  return (
    <>
      <div className="mb-6 flex flex-col gap-5">
        <div className="max-w-3xl">
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            EPIC offers full-disk Earth imagery captured from deep space. Switch between natural
            color and enhanced imagery to compare how cloud structures, landmasses, and atmospheric
            patterns appear from the DSCOVR mission.
          </p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{latestDateLabel}</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {dateOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleDatePreset(option.value)}
                className={`${pillBase} ${datePreset === option.value ? pillActive : pillIdle}`}
              >
                {option.label}
              </button>
            ))}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCalendarOpen(!calendarOpen)}
                className={`${pillBase} inline-flex items-center gap-1.5 ${
                  datePreset === 'custom' || calendarOpen ? pillActive : pillIdle
                }`}
              >
                <Calendar size={13} />
                Custom
              </button>

              {calendarOpen && (
                <div className="absolute left-0 top-full z-40 mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
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
              <div className="ml-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                <span>{epicSelectionLabel}</span>
                <button
                  type="button"
                  onClick={handleEpicReset}
                  className="rounded-full p-0.5 text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-900 dark:hover:text-blue-200"
                  aria-label="Clear filter"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {collectionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setCollection(option.value)
                  setDatePreset('latest')
                  setSelectedDate(undefined)
                  setCalendarOpen(false)
                }}
                className={`${pillBase} ${collection === option.value ? pillActive : pillIdle}`}
              >
                {option.label}
              </button>
            ))}
          </div>
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
