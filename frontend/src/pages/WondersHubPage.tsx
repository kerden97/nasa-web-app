import { Link } from 'react-router-dom'
import { triggerApodPrefetch } from '@/lib/apodPrefetch'
import { wondersUiConfig } from '@/lib/wondersUi'

export default function WondersHubPage() {
  return (
    <div className="space-y-8">
      <section className="ui-card-surface rounded-4xl p-6 sm:min-h-84 sm:p-8 lg:min-h-87 lg:p-10">
        <div className="max-w-4xl">
          <p className="ui-kicker text-amber-500 dark:text-amber-400">Observatory Deck</p>
          <h2 className="ui-page-title mt-4 text-3xl leading-[1.12] text-slate-950 sm:text-4xl lg:max-w-4xl lg:text-5xl dark:text-white">
            Pick a NASA story stream and follow it all the way through.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-400">
            Wonders brings together NASA&apos;s daily spotlight image, its deep media archive, and
            live Earth views from deep space. Start anywhere, then move across the three feeds as a
            single curated section instead of three disconnected tools.
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {wondersUiConfig.map((destination) => {
          const { Icon } = destination
          return (
            <Link
              key={destination.to}
              to={destination.slug}
              onMouseEnter={destination.slug === 'apod' ? triggerApodPrefetch : undefined}
              onFocus={destination.slug === 'apod' ? triggerApodPrefetch : undefined}
              className="ui-card-surface group flex min-h-[16.9rem] flex-col rounded-[28px] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(11,61,145,0.26)] dark:hover:border-[rgba(140,184,255,0.26)]"
            >
              <div className="flex items-center gap-4">
                <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-[#0B3D91] dark:border-slate-800 dark:bg-slate-800/85 dark:text-[#8CB8FF]">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="text-xl font-semibold text-slate-950 dark:text-white">
                  {destination.label}
                </h3>
              </div>

              <p className="mt-3 text-base leading-8 text-slate-600 dark:text-slate-400">
                {destination.description}
              </p>

              <span className="mt-auto pt-8 inline-flex items-center gap-2 text-sm font-medium text-[#0B3D91] transition-colors group-hover:text-[#0F4FB8] dark:text-[#8CB8FF] dark:group-hover:text-[#B5CFFF]">
                Open stream
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
