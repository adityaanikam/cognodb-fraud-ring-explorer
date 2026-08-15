import Skeleton from './Skeleton.jsx'
import EmptyState from './EmptyState.jsx'
import { IconUsers } from './Icons.jsx'
import { initials, colorFor } from '../utils.js'

function AccountsTable({ accounts, loading, flaggedIds, selectedId, onSelect }) {
  return (
    <section className="card card-accent-neutral">
      <h2>Accounts</h2>

      {loading ? (
        <Skeleton rows={6} />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={<IconUsers />}
          title="No accounts found"
          message="Run the seed script (backend/seed.py) to load the sample dataset."
        />
      ) : (
        <table className="accounts-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Opened</th>
              <th>Status</th>
              <th aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const flagged = flaggedIds.has(account.id)
              return (
                <tr key={account.id} className={selectedId === account.id ? 'row-selected' : ''}>
                  <td>
                    <div className="account-cell">
                      <div
                        className={`avatar${flagged ? ' flagged' : ''}`}
                        style={{ background: colorFor(account.id) }}
                        title={flagged ? 'Part of a flagged ring' : undefined}
                      >
                        {initials(account.name)}
                      </div>
                      <div>
                        <div className="account-name">{account.name}</div>
                        <div className="account-id">{account.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{account.opened_at}</td>
                  <td>
                    <span className={`status-chip status-${account.status}`}>{account.status}</span>
                  </td>
                  <td>
                    <button className="btn-link" onClick={() => onSelect(account.id)}>
                      Explore network →
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default AccountsTable
