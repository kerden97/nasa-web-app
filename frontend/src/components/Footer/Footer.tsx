export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-sm text-slate-600 sm:px-6 lg:px-8 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} Home &amp; Beyond</p>
        <p>
          Powered by{' '}
          <a
            href="https://api.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            NASA Open APIs
          </a>
        </p>
      </div>
    </footer>
  )
}
