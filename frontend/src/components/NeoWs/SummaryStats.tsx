import type { NeoObject } from '@/types/neows'
import { formatNeoDisplayName } from '@/lib/neoUtils'

interface SummaryStatsProps {
  allNeos: NeoObject[]
}

export default function SummaryStats({ allNeos }: SummaryStatsProps) {
  if (allNeos.length === 0) return null

  const hazardous = allNeos.filter((n) => n.is_potentially_hazardous_asteroid).length

  let closest: NeoObject | null = null
  let closestDist = Infinity
  let fastest: NeoObject | null = null
  let fastestSpeed = 0
  let largest: NeoObject | null = null
  let largestSize = 0

  for (const neo of allNeos) {
    const ca = neo.close_approach_data[0]
    if (ca) {
      const dist = parseFloat(ca.miss_distance.lunar)
      if (dist < closestDist) {
        closestDist = dist
        closest = neo
      }
      const speed = parseFloat(ca.relative_velocity.kilometers_per_second)
      if (speed > fastestSpeed) {
        fastestSpeed = speed
        fastest = neo
      }
    }
    const avgD =
      (neo.estimated_diameter.meters.estimated_diameter_min +
        neo.estimated_diameter.meters.estimated_diameter_max) /
      2
    if (avgD > largestSize) {
      largestSize = avgD
      largest = neo
    }
  }

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total asteroids"
        value={allNeos.length}
        detail={`${hazardous} potentially hazardous`}
        accent={hazardous > 0 ? 'red' : 'blue'}
      />
      <StatCard
        label="Closest approach"
        value={`${closestDist.toFixed(1)} LD`}
        detail={closest ? formatNeoDisplayName(closest.name) : '—'}
        accent="amber"
      />
      <StatCard
        label="Fastest"
        value={`${fastestSpeed.toFixed(1)} km/s`}
        detail={fastest ? formatNeoDisplayName(fastest.name) : '—'}
        accent="blue"
      />
      <StatCard
        label="Largest (est.)"
        value={`${largestSize.toFixed(0)} m`}
        detail={largest ? formatNeoDisplayName(largest.name) : '—'}
        accent="blue"
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string
  value: string | number
  detail: string
  accent: 'blue' | 'red' | 'amber'
}) {
  const accentColors = {
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    amber: 'text-amber-600 dark:text-amber-400',
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${accentColors[accent]}`}>{value}</p>
      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  )
}
