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
      className={`rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${className ?? ''}`}
    >
      <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
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

export function DailyCountChart({ data, isDark }: { data: DailyCountItem[]; isDark: boolean }) {
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: textColor }} />
        <Tooltip content={<DailyCountTooltip />} />
        <Bar
          dataKey="safe"
          stackId="a"
          fill={isDark ? '#60a5fa' : '#3b82f6'}
          name="Not Hazardous"
        />
        <Bar
          dataKey="hazardous"
          stackId="a"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
          name="Hazardous"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Hazardous pie chart ──────────────────────────────────────────────

export function HazardousPieChart({ data }: { data: HazardousDataItem[] }) {
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
      <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
        NASA classifies an asteroid as potentially hazardous when its minimum orbit intersection
        distance is ≤ 0.05 AU and its diameter is ≥ ~140 m (H ≤ 22).
      </p>
    </>
  )
}

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

export function VelocityScatterChart({
  data,
  isDark,
}: {
  data: ScatterDataItem[]
  isDark: boolean
}) {
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
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
                key={entry.name}
                fill={entry.hazardous ? '#ef4444' : isDark ? '#60a5fa' : '#3b82f6'}
                fillOpacity={0.7}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="mt-2 pl-20 text-center text-xs text-slate-400 dark:text-slate-500">
        Dot size represents estimated diameter. Red = potentially hazardous.
      </p>
    </>
  )
}
