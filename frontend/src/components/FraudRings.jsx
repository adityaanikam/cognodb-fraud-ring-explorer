import Skeleton from './Skeleton.jsx'
import EmptyState from './EmptyState.jsx'
import { IconShield } from './Icons.jsx'

const REASON_LABEL = {
  shared_device: 'Shared device',
  shared_payment_method: 'Shared payment method',
}

function DeviceIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <line x1="10" y1="18.5" x2="14" y2="18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function FraudRings({ rings, loading }) {
  return (
    <section className="card card-accent-danger">
      <h2>Flagged fraud rings</h2>
      <p className="card-hint">
        Accounts linked by a shared device fingerprint or payment method — the kind of pattern a graph
        traversal finds in one query, but a relational schema needs a multi-table self-join per identifier
        type to even approximate.
      </p>

      {loading ? (
        <Skeleton rows={2} />
      ) : rings.length === 0 ? (
        <EmptyState
          icon={<IconShield />}
          title="No rings detected"
          message="No accounts currently share a device or payment method in this dataset."
        />
      ) : (
        <ul className="ring-list">
          {rings.map((ring, i) => (
            <li className="ring-item" key={`${ring.shared_resource_id}-${i}`}>
              <span className="ring-icon">{ring.reason === 'shared_device' ? <DeviceIcon /> : <CardIcon />}</span>
              <span className="ring-body">
                <span className="ring-badge">
                  {REASON_LABEL[ring.reason] ?? ring.reason}
                  <span className="ring-resource">{ring.shared_resource_id}</span>
                </span>
                <span className="ring-accounts">{ring.account_ids.join(' · ')}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default FraudRings
