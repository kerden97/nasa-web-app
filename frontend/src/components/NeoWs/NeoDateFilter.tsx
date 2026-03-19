import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Calendar } from 'lucide-react'
import MiniCalendar from '@/components/MiniCalendar'
import ActiveFilterPill from '@/components/Wonders/ActiveFilterPill'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import PresetOverflowMenu from '@/components/Wonders/PresetOverflowMenu'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { isNeoDateDisabled, useNeoDateFilterState } from '@/components/NeoWs/useNeoDateFilterState'

interface NeoDateFilterProps {
  defaultRange: { start: string; end: string }
  onChange: (start: string, end: string) => void
  trailingAction?: ReactNode
}

interface CalendarModeToggleProps {
  calendarMode: 'single' | 'range'
  onSingleMode: () => void
  onRangeMode: () => void
}

function CalendarModeToggle({ calendarMode, onSingleMode, onRangeMode }: CalendarModeToggleProps) {
  return (
    <div className="mb-3 flex rounded-xl border border-slate-200 bg-slate-50/80 p-1 dark:border-slate-700 dark:bg-slate-950/55">
      <button
        type="button"
        onClick={onSingleMode}
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
        onClick={onRangeMode}
        className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          calendarMode === 'range'
            ? 'bg-[#0B3D91] text-white dark:bg-[#8CB8FF] dark:text-slate-950'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        Date range
      </button>
    </div>
  )
}

export default function NeoDateFilter({
  defaultRange,
  onChange,
  trailingAction,
}: NeoDateFilterProps) {
  const calendarRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery('(max-width: 639px)')
  const {
    activePreset,
    applyPreset,
    calendarMode,
    calendarOpen,
    closeCalendar,
    draftRange,
    handleCalendarSelect,
    handleReset,
    hoveredDate,
    isFiltered,
    mobilePrimaryPreset,
    neoPresets,
    rangeHint,
    selectionLabel,
    setHoveredDate,
    setRangeMode,
    setSingleDateMode,
    toggleCalendar,
  } = useNeoDateFilterState({ defaultRange, onChange })

  useClickOutside(calendarRef, closeCalendar)

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
              onClick={toggleCalendar}
              active={calendarOpen || (isFiltered && !activePreset)}
              className="inline-flex items-center gap-1.5"
              ariaExpanded={calendarOpen}
            >
              <Calendar size={13} />
              Custom
            </FilterChipButton>

            {calendarOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.16)] dark:border-slate-700 dark:bg-slate-900">
                <CalendarModeToggle
                  calendarMode={calendarMode}
                  onSingleMode={setSingleDateMode}
                  onRangeMode={setRangeMode}
                />

                {rangeHint && (
                  <p className="mb-3 text-[11px] text-slate-500 dark:text-slate-400">{rangeHint}</p>
                )}

                <MiniCalendar
                  rangeStart={draftRange.start}
                  rangeEnd={draftRange.end}
                  hoveredDate={calendarMode === 'range' ? hoveredDate : null}
                  onSelect={handleCalendarSelect}
                  onHover={setHoveredDate}
                  isDateDisabled={isNeoDateDisabled}
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
