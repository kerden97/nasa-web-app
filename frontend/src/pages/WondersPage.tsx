import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '@/components/Breadcrumbs'
import { wondersDestinations } from '@/lib/navigation'

export default function WondersPage() {
  const location = useLocation()

  useEffect(() => {
    document.title = 'Wonders of the Universe | Home & Beyond'
  }, [])

  const activeTabLabel = wondersDestinations.find((tab) =>
    location.pathname.endsWith(`/${tab.slug}`),
  )?.label
  const isHub = location.pathname === '/wonders-of-the-universe'

  const breadcrumbs = activeTabLabel
    ? [
        { label: 'Home', to: '/' },
        { label: 'Wonders of the Universe', to: '/wonders-of-the-universe' },
        { label: activeTabLabel },
      ]
    : [{ label: 'Home', to: '/' }, { label: 'Wonders of the Universe' }]

  return (
    <section className="bg-slate-50 dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        {isHub ? (
          <div className="mb-6">
            <p className="ui-kicker mb-2">Space Stories Hub</p>
            <h1 className="ui-page-title text-3xl text-slate-900 dark:text-white">
              Wonders of the Universe
            </h1>
            <p className="mt-2 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-400">
              Explore NASA&apos;s featured daily stories, image archive, and Earth imagery
            </p>
          </div>
        ) : (
          <h1 className="sr-only">{activeTabLabel ?? 'Wonders of the Universe'}</h1>
        )}

        <Outlet />
      </div>
    </section>
  )
}
