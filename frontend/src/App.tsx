import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Footer from '@/components/Footer/Footer'
import { triggerApodPrefetch } from '@/lib/apodPrefetch'
import Navbar from '@/components/Header/Navbar'
import AsteroidRouteSkeleton from '@/components/RouteFallbacks/AsteroidRouteSkeleton'
import WondersRouteSkeleton from '@/components/RouteFallbacks/WondersRouteSkeleton'
import RouteScrollRestoration from '@/components/ScrollToTop/RouteScrollRestoration'
import ScrollToTopButton from '@/components/ScrollToTop/ScrollToTopButton'
import Starfield from '@/components/Starfield/Starfield'
import { useTheme } from '@/context/ThemeContext'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import WondersHubPage from '@/pages/WondersHubPage'
import WondersPage from '@/pages/WondersPage'

const ApodPage = lazy(() => import('@/pages/ApodPage'))
const NasaImagePage = lazy(() => import('@/pages/NasaImagePage'))
const EpicPage = lazy(() => import('@/pages/EpicPage'))
const AsteroidWatchPage = lazy(() => import('@/pages/AsteroidWatchPage'))

function RouteFallback({ pathname }: { pathname: string }) {
  if (pathname.startsWith('/wonders-of-the-universe/epic')) {
    return <WondersRouteSkeleton section="epic" />
  }

  if (pathname.startsWith('/wonders-of-the-universe/nasa-image-library')) {
    return <WondersRouteSkeleton section="nasa-image-library" />
  }

  if (pathname.startsWith('/wonders-of-the-universe')) {
    if (pathname === '/wonders-of-the-universe') {
      return null
    }

    triggerApodPrefetch()
    return <WondersRouteSkeleton section="apod" />
  }

  if (pathname.startsWith('/asteroid-watch')) {
    return <AsteroidRouteSkeleton />
  }

  return null
}

function App() {
  const location = useLocation()
  const { theme } = useTheme()
  const showGlobalStarfield = location.pathname !== '/' && theme === 'dark'

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg focus:ring-2 focus:ring-[#2563EB] dark:focus:bg-slate-900 dark:focus:text-white"
      >
        Skip to main content
      </a>
      <RouteScrollRestoration />
      {showGlobalStarfield && <Starfield />}
      <Navbar />
      <main id="main-content" className="relative z-10 flex-1">
        <Suspense fallback={<RouteFallback pathname={location.pathname} />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/wonders-of-the-universe" element={<WondersPage />}>
              <Route index element={<WondersHubPage />} />
              <Route path="apod" element={<ApodPage />} />
              <Route path="nasa-image-library" element={<NasaImagePage />} />
              <Route path="epic" element={<EpicPage />} />
            </Route>
            <Route path="/asteroid-watch" element={<AsteroidWatchPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <ScrollToTopButton />
      <Footer />
    </div>
  )
}

export default App
