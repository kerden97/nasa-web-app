import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from '@/components/Header/Navbar'
import Footer from '@/components/Footer/Footer'
import ScrollToTopButton from '@/components/ScrollToTop/ScrollToTopButton'
import Starfield from '@/components/Starfield/Starfield'
import HomePage from '@/pages/HomePage'
import WondersPage from '@/pages/WondersPage'
import ApodPage from '@/pages/ApodPage'
import NasaImagePage from '@/pages/NasaImagePage'
import EpicPage from '@/pages/EpicPage'
import AsteroidWatchPage from '@/pages/AsteroidWatchPage'

function App() {
  const location = useLocation()
  const showGlobalStarfield = location.pathname !== '/'

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-slate-950">
      {showGlobalStarfield && <Starfield />}
      <Navbar />
      <main className="relative z-10 flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wonders-of-the-universe" element={<WondersPage />}>
            <Route path="apod" element={<ApodPage />} />
            <Route path="nasa-image-library" element={<NasaImagePage />} />
            <Route path="epic" element={<EpicPage />} />
          </Route>
          <Route path="/asteroid-watch" element={<AsteroidWatchPage />} />
        </Routes>
      </main>
      <ScrollToTopButton />
      <Footer />
    </div>
  )
}

export default App
