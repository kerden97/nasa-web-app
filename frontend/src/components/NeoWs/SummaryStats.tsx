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
        accent="cyan"
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
        accent="red"
      />
      <StatCard
        label="Largest (est.)"
        value={`${largestSize.toFixed(0)} m`}
        detail={largest ? formatNeoDisplayName(largest.name) : '—'}
        accent="violet"
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
  accent: 'cyan' | 'red' | 'amber' | 'violet'
}) {
  const accentColors = {
    cyan: 'text-[#0B3D91] dark:text-[#8CB8FF]',
    red: 'text-rose-600 dark:text-rose-400',
    amber: 'text-amber-500 dark:text-amber-300',
    violet: 'text-violet-600 dark:text-violet-400',
  }
  const accentCard = { cyan: '', red: '', amber: '', violet: '' }
  const valueGlow = { cyan: '', red: '', amber: '', violet: '' }
  return (
    <div
      className={`relative min-h-[8.5rem] overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/88 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-slate-900/55 dark:shadow-[0_18px_46px_rgba(2,6,23,0.22)] ${accentCard[accent]}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(11,61,145,0.05),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(140,184,255,0.08),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent dark:via-white/12" />
      <p className="ui-kicker text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`font-nasa mt-2 text-3xl tracking-[0.04em] ${accentColors[accent]} ${valueGlow[accent]}`}
      >
        {value}
      </p>
      <p className="mt-2 truncate text-base text-slate-600 dark:text-slate-400">{detail}</p>
    </div>
  )
}
