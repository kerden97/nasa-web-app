import { useEffect, useMemo, useState } from 'react'
import EpicCard from '@/components/Epic/EpicCard'
import EpicCardSkeleton from '@/components/Epic/EpicCardSkeleton'
import EpicModal from '@/components/Epic/EpicModal'
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
  const { dates, loading: datesLoading } = useEpicDates(collection)
  const effectiveSelectedDate =
    selectedDate && dates.includes(selectedDate) ? selectedDate : dates[0]
  const { images, loading, error } = useEpic(collection, effectiveSelectedDate)
  const [selectedItem, setSelectedItem] = useState<EpicImage | null>(null)

  useEffect(() => {
    document.title = 'EPIC | Wonders of the Universe | Home & Beyond'
  }, [])

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
  }

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
  const selectBase =
    'h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:border-blue-500'

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
            <button
              type="button"
              onClick={() => setDatePreset('custom')}
              className={`${pillBase} ${datePreset === 'custom' ? pillActive : pillIdle}`}
            >
              Custom
            </button>
            {datePreset === 'custom' && (
              <select
                value={effectiveSelectedDate ?? ''}
                onChange={(event) => setSelectedDate(event.target.value || undefined)}
                className={selectBase}
              >
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </option>
                ))}
              </select>
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
