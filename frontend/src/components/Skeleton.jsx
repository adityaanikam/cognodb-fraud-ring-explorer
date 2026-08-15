function Skeleton({ rows = 3 }) {
  return (
    <div className="skeleton-list" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton-row" key={i} />
      ))}
    </div>
  )
}

export default Skeleton
