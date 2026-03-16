import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Breadcrumbs from '@/components/Breadcrumbs'
import ApodCardSkeleton from '@/components/Apod/ApodCardSkeleton'
import FeaturedApodHeroSkeleton from '@/components/Apod/FeaturedApodHeroSkeleton'
import EpicCardSkeleton from '@/components/Epic/EpicCardSkeleton'
import Navbar from '@/components/Header/Navbar'
import AsteroidWatchSkeleton from '@/components/NeoWs/AsteroidWatchSkeleton'
import Footer from '@/components/Footer/Footer'
import ScrollToTopButton from '@/components/ScrollToTop/ScrollToTopButton'
import Starfield from '@/components/Starfield/Starfield'
import { useTheme } from '@/context/ThemeContext'

const HomePage = lazy(() => import('@/pages/HomePage'))
const WondersPage = lazy(() => import('@/pages/WondersPage'))
const ApodPage = lazy(() => import('@/pages/ApodPage'))
const NasaImagePage = lazy(() => import('@/pages/NasaImagePage'))
const EpicPage = lazy(() => import('@/pages/EpicPage'))
const AsteroidWatchPage = lazy(() => import('@/pages/AsteroidWatchPage'))

function RouteTabsSkeleton() {
  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      <div className="h-10 w-[13.75rem] animate-pulse rounded-full border border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-900/55" />
      <div className="h-10 w-[10.5rem] animate-pulse rounded-full border border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-900/55" />
      <div className="h-10 w-[4.75rem] animate-pulse rounded-full border border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-900/55" />
    </nav>
  )
}

function ApodRouteSkeleton() {
  return (
    <>
      <FeaturedApodHeroSkeleton />

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-9 w-[20rem] max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-4 w-[28rem] max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="flex flex-1 flex-wrap gap-2">
          {[
            'w-[4.5rem]',
            'w-[6rem]',
            'w-[6.5rem]',
            'w-[6.75rem]',
            'w-[7rem]',
            'w-[6.5rem]',
            'w-[7.25rem]',
          ].map((widthClass, index) => (
            <div
              key={index}
              className={`h-10 animate-pulse rounded-2xl border border-slate-200 bg-white/82 dark:border-slate-800 dark:bg-slate-900/58 ${widthClass}`}
            />
          ))}
        </div>
        <div className="h-10 w-[15.75rem] animate-pulse rounded-2xl border border-slate-200 bg-white/82 p-1 dark:border-slate-800 dark:bg-slate-900/72">
          <div className="grid h-full grid-cols-3 gap-1">
            <div className="rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ApodCardSkeleton key={index} />
        ))}
      </div>
    </>
  )
}

function EpicRouteSkeleton() {
  return (
    <>
      <div className="mb-6 h-4 w-[41rem] max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-9 w-[22rem] max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-4 w-[31rem] max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex gap-3">
          <div className="h-4 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="flex flex-1 flex-wrap gap-2">
          {['w-[4.5rem]', 'w-[5.5rem]', 'w-[6.75rem]', 'w-[7rem]', 'w-[6rem]'].map(
            (widthClass, index) => (
              <div
                key={index}
                className={`h-10 animate-pulse rounded-2xl border border-slate-200 bg-white/82 dark:border-slate-800 dark:bg-slate-900/58 ${widthClass}`}
              />
            ),
          )}
        </div>
        <div className="h-10 w-[14.25rem] animate-pulse rounded-2xl border border-slate-200 bg-white/82 p-1 dark:border-slate-800 dark:bg-slate-900/72">
          <div className="grid h-full grid-cols-2 gap-1">
            <div className="rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <EpicCardSkeleton key={index} />
        ))}
      </div>
    </>
  )
}

function NasaImageRouteSkeleton() {
  return (
    <>
      <div className="mb-8">
        <div className="h-4 w-[43rem] max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="mb-8 rounded-[28px] border border-slate-200 bg-white/82 p-5 shadow-[0_18px_54px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/55 dark:shadow-[0_20px_60px_rgba(2,6,23,0.3)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-3 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-[15.75rem] animate-pulse rounded-2xl border border-slate-200 bg-white/82 p-1 dark:border-slate-800 dark:bg-slate-900/72">
              <div className="grid h-full grid-cols-3 gap-1">
                <div className="rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>
          <div className="h-12 w-[7.5rem] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white/60 px-6 py-12 shadow-[0_14px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/35 dark:shadow-none">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto h-7 w-60 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mx-auto mt-3 h-4 w-[29rem] max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mx-auto mt-2 h-4 w-[24rem] max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="mx-auto mt-8 max-w-xl">
          <div className="mx-auto mb-3 h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="flex flex-wrap justify-center gap-2">
            {['w-[5.25rem]', 'w-[6.5rem]', 'w-[4.5rem]', 'w-[5rem]', 'w-[5.5rem]'].map(
              (widthClass, index) => (
                <div
                  key={index}
                  className={`h-10 animate-pulse rounded-2xl border border-slate-200 bg-white/82 dark:border-slate-800 dark:bg-slate-900/58 ${widthClass}`}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function HomeRouteSkeleton() {
  return (
    <div className="relative overflow-hidden">
      <section className="relative z-1 flex min-h-[calc(100svh-4.5rem)] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-900" />
        <div className="pointer-events-none absolute inset-0 z-2 bg-linear-to-b from-slate-950/50 via-slate-950/35 to-slate-950/55" />
        <div className="relative z-20 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto h-3 w-52 animate-pulse rounded bg-slate-300/70 dark:bg-slate-700/80" />
          <div className="mx-auto mt-6 h-18 w-[28rem] max-w-full animate-pulse rounded bg-slate-300/70 dark:bg-slate-700/80" />
          <div className="mx-auto mt-6 h-4 w-[32rem] max-w-full animate-pulse rounded bg-slate-300/70 dark:bg-slate-700/80" />
          <div className="mx-auto mt-3 h-4 w-[26rem] max-w-full animate-pulse rounded bg-slate-300/70 dark:bg-slate-700/80" />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <div className="h-[3.625rem] w-[15.5rem] animate-pulse rounded-full bg-slate-300/70 dark:bg-slate-700/80" />
            <div className="h-[3.625rem] w-[13rem] animate-pulse rounded-full bg-slate-300/70 dark:bg-slate-700/80" />
          </div>
        </div>
      </section>

      <section className="relative z-20 border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mx-auto mt-2 h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 bg-white py-20 dark:bg-slate-950/65 sm:py-28">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <div className="mx-auto h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mx-auto mt-4 h-10 w-[28rem] max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/65"
              >
                <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800" />
                <div className="p-6">
                  <div className="h-6 w-52 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="mt-2 h-4 w-10/12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="mt-5 h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function AsteroidRouteSkeleton() {
  return (
    <section className="bg-slate-50 dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Asteroid Watch' }]} />

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="mt-3 h-4 w-[42rem] max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="mb-6 rounded-[28px] border border-slate-200 bg-white/82 p-4 dark:border-slate-800 dark:bg-slate-900/55">
          <div className="flex flex-wrap gap-2">
            {['w-[6.5rem]', 'w-[6.75rem]', 'w-[6.25rem]', 'w-[6.5rem]', 'w-[7.25rem]'].map(
              (widthClass, index) => (
                <div
                  key={index}
                  className={`h-10 animate-pulse rounded-2xl border border-slate-200 bg-white/82 dark:border-slate-800 dark:bg-slate-900/58 ${widthClass}`}
                />
              ),
            )}
          </div>
        </div>

        <AsteroidWatchSkeleton />
      </div>
    </section>
  )
}
function WondersRouteSkeleton({ section }: { section: 'apod' | 'nasa-image-library' | 'epic' }) {
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

        <div className="mb-6">
          <div className="mb-2 h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-[22.5rem] max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>

        <RouteTabsSkeleton />

        {section === 'apod' && <ApodRouteSkeleton />}
        {section === 'epic' && <EpicRouteSkeleton />}
        {section === 'nasa-image-library' && <NasaImageRouteSkeleton />}
      </div>
    </section>
  )
}

function RouteFallback({ pathname }: { pathname: string }) {
  if (pathname.startsWith('/wonders-of-the-universe/epic')) {
    return <WondersRouteSkeleton section="epic" />
  }

  if (pathname.startsWith('/wonders-of-the-universe/nasa-image-library')) {
    return <WondersRouteSkeleton section="nasa-image-library" />
  }

  if (pathname.startsWith('/wonders-of-the-universe')) {
    return <WondersRouteSkeleton section="apod" />
  }

  if (pathname.startsWith('/asteroid-watch')) {
    return <AsteroidRouteSkeleton />
  }

  return <HomeRouteSkeleton />
}

function App() {
  const location = useLocation()
  const { theme } = useTheme()
  const showGlobalStarfield = location.pathname !== '/' && theme === 'dark'

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {showGlobalStarfield && <Starfield />}
      <Navbar />
      <main className="relative z-10 flex-1">
        <Suspense fallback={<RouteFallback pathname={location.pathname} />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/wonders-of-the-universe" element={<WondersPage />}>
              <Route path="apod" element={<ApodPage />} />
              <Route path="nasa-image-library" element={<NasaImagePage />} />
              <Route path="epic" element={<EpicPage />} />
            </Route>
            <Route path="/asteroid-watch" element={<AsteroidWatchPage />} />
          </Routes>
        </Suspense>
      </main>
      <ScrollToTopButton />
      <Footer />
    </div>
  )
}

export default App
