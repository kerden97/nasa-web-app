import { Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Header/Navbar'
import Footer from '@/components/Footer/Footer'
import ScrollToTopButton from '@/components/ScrollToTop/ScrollToTopButton'
import HomePage from '@/pages/HomePage'
import ApodPage from '@/pages/ApodPage'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wonders-of-the-universe" element={<ApodPage />} />
        </Routes>
      </main>
      <ScrollToTopButton />
      <Footer />
    </div>
  )
}

export default App
