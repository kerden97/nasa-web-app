import { Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Header/Navbar'
import Footer from '@/components/Footer/Footer'
import ScrollToTopButton from '@/components/ScrollToTop/ScrollToTopButton'
import HomePage from '@/pages/HomePage'
import WondersPage from '@/pages/WondersPage'
import ApodPage from '@/pages/ApodPage'
import NasaImagePage from '@/pages/NasaImagePage'
import EpicPage from '@/pages/EpicPage'
import AsteroidWatchPage from '@/pages/AsteroidWatchPage'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
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
