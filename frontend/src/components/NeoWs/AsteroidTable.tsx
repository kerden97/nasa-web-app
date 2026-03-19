import { useCallback, useMemo, useRef, useState } from 'react'
import type { NeoObject } from '@/types/neows'
import { useClickOutside } from '@/hooks/useClickOutside'
import { formatNeoDisplayName, type SortKey } from '@/lib/neoUtils'

interface AsteroidTableProps {
  neos: NeoObject[]
}

export default function AsteroidTable({ neos }: AsteroidTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('distance')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPageRaw] = useState(25)

  const handleRowsPerPage = useCallback((n: number) => {
    setRowsPerPageRaw(n)
    setPage(0)
  }, [])

  const handleSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortAsc((prev) => !prev)
      } else {
        setSortKey(key)
        setSortAsc(true)
      }
      setPage(0)
    },
    [sortKey],
  )

  const getNeoValue = useCallback((neo: NeoObject, key: SortKey): string | number | boolean => {
    const ca = neo.close_approach_data[0]
    switch (key) {
      case 'name':
        return formatNeoDisplayName(neo.name).toLowerCase()
      case 'date':
        return ca?.close_approach_date ?? ''
      case 'diameter':
        return (
          (neo.estimated_diameter.meters.estimated_diameter_min +
            neo.estimated_diameter.meters.estimated_diameter_max) /
          2
        )
      case 'distance':
        return ca ? parseFloat(ca.miss_distance.lunar) : 0
      case 'velocity':
        return ca ? parseFloat(ca.relative_velocity.kilometers_per_second) : 0
      case 'hazardous':
        return neo.is_potentially_hazardous_asteroid ? 1 : 0
    }
  }, [])

  const sortedNeos = useMemo(() => {
    return [...neos].sort((a, b) => {
      const aVal = getNeoValue(a, sortKey)
      const bVal = getNeoValue(b, sortKey)
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortAsc ? cmp : -cmp
    })
  }, [neos, sortKey, sortAsc, getNeoValue])

  const totalPages = Math.max(1, Math.ceil(sortedNeos.length / rowsPerPage))
  const clampedPage = Math.min(page, totalPages - 1)
  const paginatedNeos = sortedNeos.slice(clampedPage * rowsPerPage, (clampedPage + 1) * rowsPerPage)

  return (
    <div className="mt-8">
      <div className="scrollbar-thin overflow-x-auto rounded-[28px] border border-slate-200/80 bg-white/82 shadow-[0_18px_48px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/45 dark:shadow-[0_20px_52px_rgba(2,6,23,0.2)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Near-Earth Objects
          </h2>
          <RowsPerPageDropdown id="neo-rows-top" value={rowsPerPage} onChange={handleRowsPerPage} />
        </div>

        <table
          aria-label="Near-Earth Objects"
          className="min-w-215 w-full table-fixed text-left text-sm"
        >
          <colgroup>
            <col className="w-45" />
            <col className="w-30" />
            <col className="w-32.5" />
            <col className="w-40" />
            <col className="w-27.5" />
            <col className="w-30" />
          </colgroup>
          <thead>
            <tr className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/92">
              <SortableHeader
                label="Name"
                sortKey="name"
                currentKey={sortKey}
                asc={sortAsc}
                onSort={handleSort}
              />
              <SortableHeader
                label="Diameter (m)"
                sortKey="diameter"
                currentKey={sortKey}
                asc={sortAsc}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Velocity (km/s)"
                sortKey="velocity"
                currentKey={sortKey}
                asc={sortAsc}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Miss Distance (LD)"
                sortKey="distance"
                currentKey={sortKey}
                asc={sortAsc}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Hazardous"
                sortKey="hazardous"
                currentKey={sortKey}
                asc={sortAsc}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Date"
                sortKey="date"
                currentKey={sortKey}
                asc={sortAsc}
                onSort={handleSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {paginatedNeos.map((neo) => {
              const ca = neo.close_approach_data[0]
              const avgD =
                (neo.estimated_diameter.meters.estimated_diameter_min +
                  neo.estimated_diameter.meters.estimated_diameter_max) /
                2
              return (
                <tr
                  key={neo.id}
                  className="border-b border-slate-100 transition odd:bg-white/88 even:bg-slate-50/68 hover:bg-[rgba(11,61,145,0.05)] dark:border-slate-800/50 dark:odd:bg-slate-950/60 dark:even:bg-slate-900/66 dark:hover:bg-slate-800/72"
                >
                  <td
                    className="truncate px-4 py-3 font-medium text-slate-900 dark:text-white"
                    title={formatNeoDisplayName(neo.name)}
                  >
                    {formatNeoDisplayName(neo.name)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#0B3D91] dark:text-[#8CB8FF]">
                    {avgD.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#0B3D91] dark:text-[#8CB8FF]">
                    {ca ? parseFloat(ca.relative_velocity.kilometers_per_second).toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#0B3D91] dark:text-[#8CB8FF]">
                    {ca ? parseFloat(ca.miss_distance.lunar).toFixed(2) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {neo.is_potentially_hazardous_asteroid ? (
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[rgba(11,61,145,0.1)] px-2.5 py-0.5 text-xs font-medium text-[#0B3D91] dark:bg-[rgba(11,61,145,0.28)] dark:text-[#8CB8FF]">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                    {ca?.close_approach_date ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            LD (Lunar Distance) = ~384,400 km, the average distance from Earth to the Moon.
          </p>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <span aria-live="polite" aria-atomic="true">
              {clampedPage * rowsPerPage + 1}–
              {Math.min((clampedPage + 1) * rowsPerPage, sortedNeos.length)} of {sortedNeos.length}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={clampedPage === 0}
              className="rounded-md p-1.5 transition hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-800"
              aria-label="Previous page"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={clampedPage >= totalPages - 1}
              className="rounded-md p-1.5 transition hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-800"
              aria-label="Next page"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Internal sub-components ──────────────────────────────────────────

function SortableHeader({
  label,
  sortKey,
  currentKey,
  asc,
  onSort,
  align = 'left',
}: {
  label: string
  sortKey: SortKey
  currentKey: SortKey
  asc: boolean
  onSort: (key: SortKey) => void
  align?: 'left' | 'right'
}) {
  const active = sortKey === currentKey
  return (
    <th
      aria-sort={
        active ? (asc ? ('ascending' as const) : ('descending' as const)) : ('none' as const)
      }
      className={`whitespace-nowrap px-4 py-3 font-medium text-slate-600 dark:text-slate-400${align === 'right' ? ' text-right' : ''}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 transition hover:text-slate-900 dark:hover:text-white${align === 'right' ? ' ml-auto' : ''}`}
      >
        {label}
        <span className="inline-flex flex-col text-[10px] leading-none">
          <span className={active && asc ? 'text-[#0B3D91] dark:text-[#8CB8FF]' : 'opacity-30'}>
            ▲
          </span>
          <span className={active && !asc ? 'text-[#0B3D91] dark:text-[#8CB8FF]' : 'opacity-30'}>
            ▼
          </span>
        </span>
      </button>
    </th>
  )
}

function RowsPerPageDropdown({
  id,
  value,
  onChange,
}: {
  id: string
  value: number
  onChange: (n: number) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = `${id}-panel`

  const closeMenu = useCallback(() => setOpen(false), [])
  useClickOutside(ref, closeMenu)

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        id={id}
        aria-haspopup="menu"
        aria-expanded={open ? ('true' as const) : ('false' as const)}
        aria-controls={menuId}
        aria-label="Rows per page"
        onClick={() => setOpen((p) => !p)}
        className="inline-flex min-h-8 items-center justify-center rounded-xl border border-slate-300 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950/55 dark:text-slate-200 dark:hover:border-slate-500 sm:text-sm"
      >
        <span>{value}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`ml-1 h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-0 z-100 mt-1 w-14 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          role="menu"
          aria-labelledby={id}
        >
          {([25, 50, 100] as const).map((n) => (
            <button
              type="button"
              key={n}
              role="menuitem"
              onClick={() => {
                onChange(n)
                setOpen(false)
              }}
              className={`block w-full rounded px-2 py-1.5 text-center text-xs font-medium transition sm:text-sm ${
                n === value
                  ? 'text-[#0B3D91] dark:text-[#8CB8FF]'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 ${direction === 'left' ? 'rotate-90' : '-rotate-90'}`}
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
