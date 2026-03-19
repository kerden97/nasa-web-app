import {
  ChartCard,
  DailyCountChart,
  HazardousPieChart,
  VelocityScatterChart,
  type DailyCountItem,
  type HazardousDataItem,
  type ScatterDataItem,
} from '@/components/NeoWs/NeoCharts'
import { asteroidWatchChartTitles } from '@/content/asteroidWatchContent'

interface AsteroidChartsSectionProps {
  dailyData: DailyCountItem[]
  hazardousData: HazardousDataItem[]
  scatterData: ScatterDataItem[]
  isDark: boolean
}

export default function AsteroidChartsSection({
  dailyData,
  hazardousData,
  scatterData,
  isDark,
}: AsteroidChartsSectionProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title={asteroidWatchChartTitles[0]}>
        <DailyCountChart data={dailyData} isDark={isDark} />
      </ChartCard>

      <ChartCard title={asteroidWatchChartTitles[1]}>
        <HazardousPieChart data={hazardousData} />
      </ChartCard>

      <ChartCard title={asteroidWatchChartTitles[2]} className="lg:col-span-2">
        <VelocityScatterChart data={scatterData} isDark={isDark} />
      </ChartCard>
    </div>
  )
}
