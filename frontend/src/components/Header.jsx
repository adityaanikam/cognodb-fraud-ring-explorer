function BrandMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 38 38" fill="none" className="brand-mark" aria-hidden="true">
      <circle cx="9" cy="10" r="4.5" fill="#d9843f" />
      <circle cx="29" cy="9" r="4" fill="#c9a227" />
      <circle cx="19" cy="29" r="5" fill="#5fb3a3" />
      <path d="M12.5 12.5L16 25.5M25.5 12L21.5 25" stroke="#5c4a32" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 10.5L25 9.3" stroke="#5c4a32" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Header({ status }) {
  const label =
    status === 'ok' ? 'Database connected' : status === 'checking' ? 'Connecting' : 'Database unreachable'

  return (
    <div className="header-band">
      <header className="header">
        <div className="brand">
          <BrandMark />
          <div>
            <p className="eyebrow">Fraud investigation console</p>
            <h1>CognoDB Fraud Ring Explorer</h1>
            <p className="subtitle">
              Trace shared devices, payment methods, and money flow across accounts to surface fraud rings a
              relational join would struggle to find.
            </p>
          </div>
        </div>
        <div className={`status-pill status-${status}`}>
          <span className="status-dot" />
          {label}
        </div>
      </header>
    </div>
  )
}

export default Header
