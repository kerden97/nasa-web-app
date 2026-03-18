import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Calendar } from 'lucide-react'
import MiniCalendar from '@/components/MiniCalendar'
import ActiveFilterPill from '@/components/Wonders/ActiveFilterPill'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import PresetOverflowMenu from '@/components/Wonders/PresetOverflowMenu'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { addDays, formatLabel, todayStr } from '@/lib/calendarUtils'
import { getDefaultRange } from '@/lib/neoUtils'

interface NeoDateFilterProps {
  defaultRange: { start: string; end: string }
  onChange: (start: string, end: string) => void
  trailingAction?: ReactNode
}

type NeoPreset = { label: string; getRange: () => [string, string] | [string] }

export default function NeoDateFilter({
  defaultRange,
  onChange,
  trailingAction,
}: NeoDateFilterProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMode, setCalendarMode] = useState<'single' | 'range'>('range')
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>('Last 7 days')
  const [currentStart, setCurrentStart] = useState(defaultRange.start)
  const [currentEnd, setCurrentEnd] = useState(defaultRange.end)
  const calendarRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery('(max-width: 639px)')

  const closeCalendar = useCallback(() => setCalendarOpen(false), [])
  useClickOutside(calendarRef, closeCalendar)

  const isDateDisabled = (iso: string) => iso > todayStr()

  const neoPresets: NeoPreset[] = useMemo(
    () => [
      { label: 'Today', getRange: () => [todayStr()] },
      { label: 'Yesterday', getRange: () => [addDays(todayStr(), -1)] },
      {
        label: 'Last 3 days',
        getRange: () => {
          const t = todayStr()
          return [addDays(t, -2), t]
        },
      },
      {
        label: 'Last 7 days',
        getRange: () => {
          const t = todayStr()
          return [addDays(t, -6), t]
        },
      },
    ],
    [],
  )

  const applyPreset = useCallback(
    (preset: NeoPreset) => {
      const result = preset.getRange()
      setActivePreset(preset.label)
      setCalendarOpen(false)
      setRangeStart(null)
      setRangeEnd(null)
      const start = result[0]
      const end = result.length === 1 ? result[0] : result[1]
      setCurrentStart(start)
      setCurrentEnd(end)
      onChange(start, end)
    },
    [onChange],
  )

  const handleCalendarSelect = useCallback(
    (iso: string) => {
      if (calendarMode === 'single') {
        setRangeStart(iso)
        setRangeEnd(null)
        setActivePreset(null)
        setCalendarOpen(false)
        setCurrentStart(iso)
        setCurrentEnd(iso)
        onChange(iso, iso)
      } else {
        if (!rangeStart || rangeEnd) {
          setRangeStart(iso)
          setRangeEnd(null)
        } else {
          const [start, initialEnd] = iso < rangeStart ? [iso, rangeStart] : [rangeStart, iso]
          const diffMs =
            new Date(`${initialEnd}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()
          const diffDays = diffMs / (1000 * 60 * 60 * 24)
          const end = diffDays > 6 ? addDays(start, 6) : initialEnd
          setRangeStart(start)
          setRangeEnd(end)
          setActivePreset(null)
          setCalendarOpen(false)
          setCurrentStart(start)
          setCurrentEnd(end)
          onChange(start, end)
        }
      }
    },
    [calendarMode, rangeStart, rangeEnd, onChange],
  )

  const handleReset = useCallback(() => {
    const def = getDefaultRange()
    setRangeStart(null)
    setRangeEnd(null)
    setActivePreset('Last 7 days')
    setCalendarOpen(false)
    setCurrentStart(def.start)
    setCurrentEnd(def.end)
    onChange(def.start, def.end)
  }, [onChange])

  const isFiltered = currentStart !== defaultRange.start || currentEnd !== defaultRange.end

  const selectionLabel = (() => {
    if (activePreset) return activePreset
    if (rangeStart && rangeEnd) return `${formatLabel(rangeStart)} – ${formatLabel(rangeEnd)}`
    if (rangeStart) return formatLabel(rangeStart)
    return null
  })()
  const mobilePrimaryPreset =
    neoPresets.find((preset) => preset.label === activePreset) ?? neoPresets[0]
  const shouldShowSelectionPill = isFiltered && (!isMobile || !activePreset)

  return (
    <div className="relative z-30 mb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {isMobile ? (
            <PresetOverflowMenu
              currentValue={mobilePrimaryPreset.label}
              currentActive={activePreset === mobilePrimaryPreset.label}
              options={neoPresets.map((preset) => ({ value: preset.label, label: preset.label }))}
              onSelect={(value) => {
                const preset = neoPresets.find((entry) => entry.label === value)
                if (preset) applyPreset(preset)
              }}
            />
          ) : (
            neoPresets.map((preset) => (
              <FilterChipButton
                key={preset.label}
                onClick={() => applyPreset(preset)}
                active={activePreset === preset.label}
              >
                {preset.label}
              </FilterChipButton>
            ))
          )}

          <div className="relative" ref={calendarRef}>
            <FilterChipButton
              onClick={() => setCalendarOpen(!calendarOpen)}
              active={calendarOpen || (isFiltered && !activePreset)}
              className="inline-flex items-center gap-1.5"
              ariaExpanded={calendarOpen}
            >
              <Calendar size={13} />
              Custom
            </FilterChipButton>

            {calendarOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.16)] dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-3 flex rounded-xl border border-slate-200 bg-slate-50/80 p-1 dark:border-slate-700 dark:bg-slate-950/55">
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarMode('single')
                      setRangeStart(null)
                      setRangeEnd(null)
                    }}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      calendarMode === 'single'
                        ? 'bg-[#0B3D91] text-white dark:bg-[#8CB8FF] dark:text-slate-950'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Single date
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarMode('range')
                      setRangeStart(null)
                      setRangeEnd(null)
                    }}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      calendarMode === 'range'
                        ? 'bg-[#0B3D91] text-white dark:bg-[#8CB8FF] dark:text-slate-950'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Date range
                  </button>
                </div>

                {calendarMode === 'range' && (
                  <p className="mb-3 text-[11px] text-slate-500 dark:text-slate-400">
                    {!rangeStart
                      ? 'Pick a start date'
                      : !rangeEnd
                        ? 'Now pick an end date (max 7 days)'
                        : 'Range selected'}
                  </p>
                )}

                <MiniCalendar
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  hoveredDate={calendarMode === 'range' ? hoveredDate : null}
                  onSelect={handleCalendarSelect}
                  onHover={setHoveredDate}
                  isDateDisabled={isDateDisabled}
                />
              </div>
            )}
          </div>

          {shouldShowSelectionPill && selectionLabel && (
            <div className="ml-1">
              <ActiveFilterPill label={selectionLabel} onClear={handleReset} />
            </div>
          )}
        </div>

        {trailingAction ? (
          <div className="w-full sm:w-auto sm:shrink-0">{trailingAction}</div>
        ) : null}
      </div>
    </div>
  )
}
