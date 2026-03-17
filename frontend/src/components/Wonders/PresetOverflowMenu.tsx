import { useCallback, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import { useClickOutside } from '@/hooks/useClickOutside'

interface PresetOverflowMenuOption {
  value: string
  label: string
}

interface PresetOverflowMenuProps {
  currentValue: string
  options: readonly PresetOverflowMenuOption[]
  onSelect: (value: string) => void
  currentActive?: boolean
  menuLabel?: string
}

export default function PresetOverflowMenu({
  currentValue,
  options,
  onSelect,
  currentActive = false,
  menuLabel = 'More presets',
}: PresetOverflowMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeMenu = useCallback(() => setOpen(false), [])
  useClickOutside(menuRef, closeMenu)

  const currentOption = options.find((option) => option.value === currentValue) ?? options[0]
  const overflowOptions = options.filter((option) => option.value !== currentValue)

  if (!currentOption) return null

  return (
    <div className="flex items-center gap-2.5">
      <FilterChipButton active={currentActive} onClick={() => onSelect(currentOption.value)}>
        {currentOption.label}
      </FilterChipButton>

      <div className="relative" ref={menuRef}>
        <FilterChipButton
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-1.5"
          ariaLabel={menuLabel}
          ariaExpanded={open}
        >
          More
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </FilterChipButton>

        {open && overflowOptions.length > 0 && (
          <div
            role="menu"
            className="absolute left-0 top-full z-40 mt-2 min-w-44 rounded-[22px] border border-slate-200 bg-white/95 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/96 dark:shadow-[0_24px_70px_rgba(2,6,23,0.5)]"
          >
            {overflowOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelect(option.value)
                  setOpen(false)
                }}
                className="flex w-full items-center rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
