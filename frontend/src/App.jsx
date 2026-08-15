import { useCallback, useEffect, useState } from 'react'
import { getAccounts, getAccountNetwork, getFraudRings, getHealth } from './api.js'
import Header from './components/Header.jsx'
import StatsBar from './components/StatsBar.jsx'
import ErrorBanner from './components/ErrorBanner.jsx'
import FraudRings from './components/FraudRings.jsx'
import AccountsTable from './components/AccountsTable.jsx'
import NetworkExplorer from './components/NetworkExplorer.jsx'

function App() {
  const [status, setStatus] = useState('checking')
  const [accounts, setAccounts] = useState([])
  const [rings, setRings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [selectedId, setSelectedId] = useState(null)
  const [network, setNetwork] = useState([])
  const [networkLoading, setNetworkLoading] = useState(false)
  const [networkError, setNetworkError] = useState(null)

  const loadData = useCallback(() => {
    setLoading(true)
    setLoadError(null)
    setStatus('checking')

    getHealth()
      .then(() => setStatus('ok'))
      .catch(() => setStatus('unreachable'))

    Promise.all([getAccounts(), getFraudRings()])
      .then(([accountsData, ringsData]) => {
        setAccounts(accountsData)
        setRings(ringsData)
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function selectAccount(accountId) {
    setSelectedId(accountId)
    setNetworkLoading(true)
    setNetworkError(null)
    getAccountNetwork(accountId)
      .then(setNetwork)
      .catch((err) => setNetworkError(err.message))
      .finally(() => setNetworkLoading(false))
  }

  const flaggedIds = new Set(rings.flatMap((ring) => ring.account_ids))

  return (
    <div className="app">
      <Header status={status} />
      <StatsBar
        accountCount={accounts.length}
        flaggedCount={flaggedIds.size}
        ringCount={rings.length}
        loading={loading}
      />

      <main className="layout">
        <ErrorBanner message={loadError} onRetry={loadData} />

        <FraudRings rings={rings} loading={loading} />
        <AccountsTable
          accounts={accounts}
          loading={loading}
          flaggedIds={flaggedIds}
          selectedId={selectedId}
          onSelect={selectAccount}
        />
        <NetworkExplorer
          accounts={accounts}
          selectedId={selectedId}
          network={network}
          networkLoading={networkLoading}
          networkError={networkError}
        />
      </main>
    </div>
  )
}

export default App
