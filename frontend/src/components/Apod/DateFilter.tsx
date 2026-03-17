import { useCallback, useRef, useState } from 'react'
import { Calendar } from 'lucide-react'
import { APOD_EPOCH } from '@/lib/apodMeta'
import MiniCalendar from '@/components/MiniCalendar'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import ActiveFilterPill from '@/components/Wonders/ActiveFilterPill'
import PresetOverflowMenu from '@/components/Wonders/PresetOverflowMenu'
import { useClickOutside } from '@/hooks/useClickOutside'
import { addDays, formatLabel, todayStr } from '@/lib/calendarUtils'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface DateFilterProps {
  onSingleDate: (date: string) => void
  onDateRange: (start: string, end: string) => void
  onReset: () => void
  isFiltered: boolean
}

/* ── helpers ── */

function clamp(iso: string) {
  if (iso < APOD_EPOCH) return APOD_EPOCH
  const t = todayStr()
  if (iso > t) return t
  return iso
}

/* ── presets ── */

type Preset = { label: string; getRange: () => [string, string] | [string] }

const presets: Preset[] = [
  { label: 'Today', getRange: () => [todayStr()] },
  { label: 'Yesterday', getRange: () => [addDays(todayStr(), -1)] },
  {
    label: 'This week',
    getRange: () => {
      const t = todayStr()
      const d = new Date(`${t}T00:00:00`)
      const day = d.getDay()
      const mon = addDays(t, -(day === 0 ? 6 : day - 1))
      return [clamp(mon), t]
    },
  },
  {
    label: 'Last 7 days',
    getRange: () => {
      const t = todayStr()
      return [clamp(addDays(t, -6)), t]
    },
  },
  {
    label: 'Last 30 days',
    getRange: () => {
      const t = todayStr()
      return [clamp(addDays(t, -29)), t]
    },
  },
  {
    label: 'This month',
    getRange: () => {
      const t = todayStr()
      const start = t.slice(0, 8) + '01'
      return [clamp(start), t]
    },
  },
]

/* ── main component ── */

export default function DateFilter({
  onSingleDate,
  onDateRange,
  onReset,
  isFiltered,
}: DateFilterProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [mode, setMode] = useState<'single' | 'range'>('single')
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery('(max-width: 639px)')

  const isDateDisabled = (iso: string) => iso > todayStr() || iso < APOD_EPOCH

  const closeCalendar = useCallback(() => setCalendarOpen(false), [])
  useClickOutside(dropdownRef, closeCalendar)

  function applyPreset(preset: Preset) {
    const result = preset.getRange()
    setActivePreset(preset.label)
    setCalendarOpen(false)
    setRangeStart(null)
    setRangeEnd(null)
    if (result.length === 1) {
      onSingleDate(result[0])
    } else {
      onDateRange(result[0], result[1])
    }
  }

  function handleCalendarSelect(iso: string) {
    if (mode === 'single') {
      setRangeStart(iso)
      setRangeEnd(null)
      setActivePreset(null)
      setCalendarOpen(false)
      onSingleDate(iso)
    } else {
      if (!rangeStart || rangeEnd) {
        setRangeStart(iso)
        setRangeEnd(null)
      } else {
        const [start, end] = iso < rangeStart ? [iso, rangeStart] : [rangeStart, iso]
        setRangeStart(start)
        setRangeEnd(end)
        setActivePreset(null)
        setCalendarOpen(false)
        onDateRange(start, end)
      }
    }
  }

  function handleReset() {
    setRangeStart(null)
    setRangeEnd(null)
    setActivePreset(null)
    setCalendarOpen(false)
    onReset()
  }

  const selectionLabel = (() => {
    if (activePreset) return activePreset
    if (rangeStart && rangeEnd) return `${formatLabel(rangeStart)} – ${formatLabel(rangeEnd)}`
    if (rangeStart) return formatLabel(rangeStart)
    return null
  })()
  const mobilePrimaryPreset = presets.find((preset) => preset.label === activePreset) ?? presets[0]
  const shouldShowSelectionPill = isFiltered && (!isMobile || !activePreset)

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Preset chips */}
      {isMobile ? (
        <PresetOverflowMenu
          currentValue={mobilePrimaryPreset.label}
          currentActive={activePreset === mobilePrimaryPreset.label}
          options={presets.map((preset) => ({ value: preset.label, label: preset.label }))}
          onSelect={(value) => {
            const preset = presets.find((entry) => entry.label === value)
            if (preset) applyPreset(preset)
          }}
        />
      ) : (
        presets.map((preset) => (
          <FilterChipButton
            key={preset.label}
            onClick={() => applyPreset(preset)}
            active={activePreset === preset.label}
          >
            {preset.label}
          </FilterChipButton>
        ))
      )}

      {/* Custom calendar trigger */}
      <div className="relative" ref={dropdownRef}>
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
          <div className="absolute left-0 top-full z-40 mt-3 rounded-[22px] border border-slate-200 bg-white/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/96 dark:shadow-[0_24px_70px_rgba(2,6,23,0.5)]">
            {/* Single / Range toggle */}
            <div className="mb-3 flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950/60">
              <button
                type="button"
                onClick={() => {
                  setMode('single')
                  setRangeStart(null)
                  setRangeEnd(null)
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === 'single'
                    ? 'rounded-lg bg-[#0B3D91] text-white dark:bg-[#8CB8FF] dark:text-slate-950'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                } rounded-lg`}
              >
                Single date
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('range')
                  setRangeStart(null)
                  setRangeEnd(null)
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === 'range'
                    ? 'rounded-lg bg-[#0B3D91] text-white dark:bg-[#8CB8FF] dark:text-slate-950'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                } rounded-lg`}
              >
                Date range
              </button>
            </div>

            {mode === 'range' && (
              <p className="mb-3 text-[11px] text-slate-500 dark:text-slate-400">
                {!rangeStart
                  ? 'Pick a start date'
                  : !rangeEnd
                    ? 'Now pick an end date'
                    : 'Range selected'}
              </p>
            )}

            <MiniCalendar
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hoveredDate={mode === 'range' ? hoveredDate : null}
              onSelect={handleCalendarSelect}
              onHover={setHoveredDate}
              isDateDisabled={isDateDisabled}
            />
          </div>
        )}
      </div>

      {/* Active selection label + clear */}
      {shouldShowSelectionPill && (
        <div className="ml-1">
          <ActiveFilterPill label={selectionLabel ?? 'Custom'} onClear={handleReset} />
        </div>
      )}
    </div>
  )
}
