import { Link } from 'react-router-dom'

type BreadcrumbItem = {
  label: string
  to?: string
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.to && !isLast ? (
              <Link to={item.to} className="transition hover:text-slate-900 dark:hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? 'text-[#0B3D91] dark:text-[#8CB8FF]'
                    : 'text-slate-500 dark:text-slate-400'
                }
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}

            {!isLast && (
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                /
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
