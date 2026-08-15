import { useState } from 'react'
import { getShortestPath } from '../api.js'
import Skeleton from './Skeleton.jsx'
import NetworkGraph from './NetworkGraph.jsx'
import EmptyState from './EmptyState.jsx'
import { IconNetwork, IconRoute, IconAlert } from './Icons.jsx'

const NODE_ICON = {
  Account: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 20c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Device: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="18.5" x2="14" y2="18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  PaymentMethod: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
}

function NetworkExplorer({ accounts, selectedId, network, networkLoading, networkError }) {
  const [targetId, setTargetId] = useState('')
  const [path, setPath] = useState(null)
  const [pathLoading, setPathLoading] = useState(false)
  const [pathError, setPathError] = useState(null)

  const selectedAccount = accounts.find((a) => a.id === selectedId)
  const otherAccounts = accounts.filter((a) => a.id !== selectedId)

  async function handleFindPath(e) {
    e.preventDefault()
    if (!selectedId || !targetId) return
    setPathLoading(true)
    setPathError(null)
    setPath(null)
    try {
      const result = await getShortestPath(selectedId, targetId)
      setPath(result)
    } catch (err) {
      setPathError(err.message)
    } finally {
      setPathLoading(false)
    }
  }

  if (!selectedId) {
    return (
      <section className="card card-accent-primary">
        <h2>Network explorer</h2>
        <EmptyState
          icon={<IconNetwork />}
          title="No account selected"
          message="Pick an account from the table above to explore its connections."
        />
      </section>
    )
  }

  return (
    <section className="card card-accent-primary">
      <h2>Network for {selectedAccount ? `${selectedAccount.name} (${selectedId})` : selectedId}</h2>
      <p className="card-hint">
        Every account reachable within 4 hops through a shared device or payment method: a variable-length
        traversal that has no clean fixed-depth SQL equivalent.
      </p>

      {networkError ? (
        <EmptyState icon={<IconAlert />} title="Couldn't load the network" message={networkError} tone="danger" />
      ) : networkLoading ? (
        <Skeleton rows={3} />
      ) : network.length === 0 ? (
        <EmptyState
          icon={<IconNetwork />}
          title="No connections found"
          message="This account doesn't share a device or payment method with anyone within 4 hops."
        />
      ) : (
        <div className="network-layout">
          <ul className="network-list">
            {network.map((n) => (
              <li key={n.id} className="network-item">
                <span className="network-name">
                  {n.name} <span className="account-id">({n.id})</span>
                </span>
                <span className="hop-badge">
                  {n.distance} hop{n.distance === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
          <NetworkGraph center={selectedAccount ?? { name: selectedId }} nodes={network} />
        </div>
      )}

      <div className="path-finder">
        <h3>Shortest connection path</h3>
        <form onSubmit={handleFindPath} className="path-form">
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)} aria-label="Target account">
            <option value="">Choose an account…</option>
            {otherAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id})
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary" disabled={!targetId || pathLoading}>
            {pathLoading ? 'Searching…' : 'Find path'}
          </button>
        </form>

        {pathError && (
          <EmptyState icon={<IconAlert />} title="Couldn't find a path" message={pathError} tone="danger" />
        )}

        {path &&
          !pathError &&
          (path.connected ? (
            <ol className="path-trail">
              {path.nodes.map((node, i) => (
                <li key={`${node.label}-${node.id}-${i}`} style={{ display: 'contents' }}>
                  {i > 0 && (
                    <span className="path-arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                  <span className={`path-node path-${node.label}`}>
                    <span className="path-node-icon">{NODE_ICON[node.label]}</span>
                    <span>{node.name || node.id}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={<IconRoute />}
              title="No connection found"
              message="These two accounts aren't linked through any shared device or payment method within 10 hops."
            />
          ))}
      </div>
    </section>
  )
}

export default NetworkExplorer
