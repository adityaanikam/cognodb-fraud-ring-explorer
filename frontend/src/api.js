const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(path) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`)
  } catch {
    const error = new Error('Could not reach the backend API. Is it running?')
    error.status = 0
    throw error
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      message = body.message || body.error || message
    } catch {
      // response wasn't JSON — keep the generic message
    }
    const error = new Error(message)
    error.status = res.status
    throw error
  }

  return res.json()
}

export const getHealth = () => request('/api/health')
export const getAccounts = () => request('/api/accounts')
export const getFraudRings = () => request('/api/fraud-rings')
export const getAccountNetwork = (id) => request(`/api/accounts/${encodeURIComponent(id)}/network`)
export const getShortestPath = (fromId, toId) =>
  request(`/api/accounts/${encodeURIComponent(fromId)}/path/${encodeURIComponent(toId)}`)
