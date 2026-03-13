import Navbar from './components/Header/Navbar'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1" />
      <Footer />
    </div>
  )
}

export default App
