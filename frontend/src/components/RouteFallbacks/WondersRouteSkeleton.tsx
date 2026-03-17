import Breadcrumbs from '@/components/Breadcrumbs'
import ApodRouteSkeleton from '@/components/RouteFallbacks/ApodRouteSkeleton'
import EpicRouteSkeleton from '@/components/RouteFallbacks/EpicRouteSkeleton'
import NasaImageRouteSkeleton from '@/components/RouteFallbacks/NasaImageRouteSkeleton'

interface WondersRouteSkeletonProps {
  section: 'apod' | 'nasa-image-library' | 'epic'
}

export default function WondersRouteSkeleton({ section }: WondersRouteSkeletonProps) {
  const activeTabLabel =
    section === 'epic'
      ? 'EPIC'
      : section === 'nasa-image-library'
        ? 'NASA Image Library'
        : 'Astronomy Picture of the Day'

  return (
    <section className="bg-slate-50 dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Wonders of the Universe' },
            { label: activeTabLabel },
          ]}
        />

        {section === 'apod' && <ApodRouteSkeleton />}
        {section === 'epic' && <EpicRouteSkeleton />}
        {section === 'nasa-image-library' && <NasaImageRouteSkeleton />}
      </div>
    </section>
  )
}
