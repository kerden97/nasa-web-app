import Breadcrumbs from '@/components/Breadcrumbs'
import { AsteroidWatchSkeletonContent } from '@/components/NeoWs/AsteroidWatchSkeleton'

export default function AsteroidRouteSkeleton() {
  return (
    <section className="bg-slate-50 dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Asteroid Watch' }]} />

        <AsteroidWatchSkeletonContent withHeader />
      </div>
    </section>
  )
}
