import { IconAlert } from './Icons.jsx'

function ErrorBanner({ message, onRetry }) {
  if (!message) return null

  return (
    <div className="error-banner" role="alert">
      <div className="error-banner-body">
        <IconAlert />
        <div>
          <strong>Couldn't load data.</strong> {message}
        </div>
      </div>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}

export default ErrorBanner
