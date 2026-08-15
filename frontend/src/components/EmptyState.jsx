function EmptyState({ icon, title, message, tone = 'neutral' }) {
  return (
    <div className={`empty-state empty-${tone}`}>
      <div className="empty-icon">{icon}</div>
      <div className="empty-copy">
        <div className="empty-title">{title}</div>
        {message && <div className="empty-message">{message}</div>}
      </div>
    </div>
  )
}

export default EmptyState
