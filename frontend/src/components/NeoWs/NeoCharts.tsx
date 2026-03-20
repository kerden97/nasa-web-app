import { memo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'

// ── Shared chart card wrapper ────────────────────────────────────────

export function ChartCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/52 dark:shadow-[0_22px_58px_rgba(2,6,23,0.22)] ${className ?? ''}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(11,61,145,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(140,184,255,0.08),transparent_22%)]" />
      <h2 className="relative mb-4 text-xl font-semibold text-slate-900 dark:text-white">
        {title}
      </h2>
      {children}
    </div>
  )
}

// ── Types ────────────────────────────────────────────────────────────

export interface DailyCountItem {
  date: string
  fullDate: string
  safe: number
  hazardous: number
  total: number
}

export interface ScatterDataItem {
  key: string
  name: string
  distance: number
  diameter: number
  velocity: number
  hazardous: boolean
}

export interface HazardousDataItem {
  name: string
  value: number
  color: string
}

// ── Daily count bar chart ────────────────────────────────────────────

function DailyCountTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: DailyCountItem }[]
}) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="font-medium text-slate-900 dark:text-white">{d.date}</p>
      <p className="text-slate-600 dark:text-slate-300">
        {d.total} asteroid{d.total !== 1 ? 's' : ''}
      </p>
      {d.hazardous > 0 && <p className="text-red-500">{d.hazardous} hazardous</p>}
    </div>
  )
}

export const DailyCountChart = memo(function DailyCountChart({
  data,
  isDark,
}: {
  data: DailyCountItem[]
  isDark: boolean
}) {
  const gridColor = isDark ? '#243041' : '#dbe4f0'
  const textColor = isDark ? '#8ea2c5' : '#64748b'

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="4 6" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: textColor }} />
        <Tooltip content={<DailyCountTooltip />} />
        <Bar
          dataKey="safe"
          stackId="a"
          fill={isDark ? '#60a5fa' : '#3b82f6'}
          name="Not Hazardous"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="hazardous"
          stackId="a"
          fill={isDark ? '#f87171' : '#ef4444'}
          radius={[4, 4, 0, 0]}
          name="Hazardous"
        />
      </BarChart>
    </ResponsiveContainer>
  )
})

// ── Hazardous pie chart ──────────────────────────────────────────────

export const HazardousPieChart = memo(function HazardousPieChart({
  data,
}: {
  data: HazardousDataItem[]
}) {
  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={data.length > 1 ? 4 : 0}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            formatter={(value: string, entry: { payload?: { value?: number } }) =>
              `${value}: ${entry.payload?.value ?? 0}`
            }
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
        NASA classifies an asteroid as potentially hazardous when its minimum orbit intersection
        distance is ≤ 0.05 AU and its diameter is ≥ ~140 m (H ≤ 22).
      </p>
    </>
  )
})

// ── Velocity vs distance scatter chart ───────────────────────────────

function ScatterTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: ScatterDataItem }[]
}) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="font-medium text-slate-900 dark:text-white">{d.name}</p>
      <p className="text-slate-600 dark:text-slate-300">Distance: {d.distance.toFixed(2)} lunar</p>
      <p className="text-slate-600 dark:text-slate-300">Velocity: {d.velocity.toFixed(1)} km/s</p>
      <p className="text-slate-600 dark:text-slate-300">Diameter: {d.diameter.toFixed(0)} m</p>
      {d.hazardous && <p className="font-medium text-red-500">Potentially hazardous</p>}
    </div>
  )
}

export const VelocityScatterChart = memo(function VelocityScatterChart({
  data,
  isDark,
}: {
  data: ScatterDataItem[]
  isDark: boolean
}) {
  const gridColor = isDark ? '#243041' : '#dbe4f0'
  const textColor = isDark ? '#8ea2c5' : '#64748b'

  return (
    <>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="4 6" stroke={gridColor} />
          <XAxis
            type="number"
            dataKey="distance"
            name="Miss Distance"
            unit=" LD"
            padding={{ left: 5 }}
            tick={{ fontSize: 12, fill: textColor }}
            label={{
              value: 'Miss Distance (Lunar Distances)',
              position: 'insideBottom',
              offset: -5,
              style: { fontSize: 12, fill: textColor },
            }}
          />
          <YAxis
            type="number"
            dataKey="velocity"
            name="Velocity"
            unit=" km/s"
            tick={{ fontSize: 12, fill: textColor }}
            label={{
              value: 'Relative Velocity (km/s)',
              angle: -90,
              position: 'insideLeft',
              offset: 15,
              dy: 0,
              style: { fontSize: 12, fill: textColor, textAnchor: 'middle' },
            }}
            width={80}
          />
          <ZAxis type="number" dataKey="diameter" range={[40, 400]} name="Diameter" />
          <Tooltip content={<ScatterTooltip />} />
          <Scatter data={data}>
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={
                  entry.hazardous
                    ? isDark
                      ? '#f87171'
                      : '#ef4444'
                    : isDark
                      ? '#8cb8ff'
                      : '#0b3d91'
                }
                fillOpacity={0.78}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
        Dot size represents estimated diameter. Red = potentially hazardous.
      </p>
    </>
  )
})
