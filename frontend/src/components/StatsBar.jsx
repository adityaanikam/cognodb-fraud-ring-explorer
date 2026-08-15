import { IconUsers, IconShield, IconNetwork } from './Icons.jsx'

function StatsBar({ accountCount, flaggedCount, ringCount, loading }) {
  const stats = [
    { label: 'Accounts', value: accountCount, icon: <IconUsers /> },
    { label: 'Flagged accounts', value: flaggedCount, icon: <IconShield />, tone: 'danger' },
    { label: 'Fraud rings', value: ringCount, icon: <IconNetwork />, tone: 'danger' },
  ]

  return (
    <div className="stats-bar">
      {stats.map((s) => (
        <div className={`stat-tile${s.tone ? ` stat-${s.tone}` : ''}`} key={s.label}>
          <div className="stat-icon">{s.icon}</div>
          <div>
            <div className="stat-value">{loading ? '-' : s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsBar
