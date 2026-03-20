interface LoadMoreButtonProps {
  onClick?: () => void
  disabled?: boolean
}

export default function LoadMoreButton({ onClick, disabled }: LoadMoreButtonProps) {
  const isStatic = !onClick || disabled

  return (
    <div className="mt-8 flex justify-center">
      {isStatic ? (
        <span className="cosmic-btn-load-more rounded-full px-6 py-3 text-sm font-semibold opacity-50">
          Load more
        </span>
      ) : (
        <button
          onClick={onClick}
          className="cosmic-btn-load-more rounded-full px-6 py-3 text-sm font-semibold"
        >
          Load more
        </button>
      )}
    </div>
  )
}
