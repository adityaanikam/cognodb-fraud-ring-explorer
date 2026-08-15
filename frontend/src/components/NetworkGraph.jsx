import { initials } from '../utils.js'

function NetworkGraph({ center, nodes }) {
  if (nodes.length === 0) return null

  const grouped = new Map()
  nodes.forEach((n) => {
    if (!grouped.has(n.distance)) grouped.set(n.distance, [])
    grouped.get(n.distance).push(n)
  })

  const distances = [...grouped.keys()].sort((a, b) => a - b)
  const maxDistance = distances[distances.length - 1]
  const ringGap = 56
  const baseRadius = 44
  const size = (baseRadius + maxDistance * ringGap + 36) * 2
  const c = size / 2

  const positioned = []
  distances.forEach((distance, ringIndex) => {
    const group = grouped.get(distance)
    const radius = baseRadius + distance * ringGap
    const angleOffset = -90 + ringIndex * 18
    group.forEach((n, i) => {
      const angle = angleOffset + (360 / group.length) * i
      const rad = (angle * Math.PI) / 180
      positioned.push({ ...n, x: c + radius * Math.cos(rad), y: c + radius * Math.sin(rad) })
    })
  })

  return (
    <div className="network-graph">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Network graph centered on ${center.name}`}>
        {distances.map((d) => (
          <circle
            key={d}
            cx={c}
            cy={c}
            r={baseRadius + d * ringGap}
            fill="none"
            stroke="#e2e4f4"
            strokeDasharray="3 5"
          />
        ))}
        {positioned.map((n) => (
          <line key={`edge-${n.id}`} x1={c} y1={c} x2={n.x} y2={n.y} stroke="#d7d9f0" strokeWidth="1.5" />
        ))}
        <circle cx={c} cy={c} r="19" fill="#4f46e5" />
        <text x={c} y={c + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
          {initials(center.name)}
        </text>
        {positioned.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="14" fill="#818cf8" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">
              {initials(n.name)}
            </text>
            <text x={n.x} y={n.y + 26} textAnchor="middle" fontSize="9.5" fill="#676e88">
              {n.id}
            </text>
          </g>
        ))}
      </svg>
      <div className="graph-legend">
        <span>
          <span className="legend-dot" style={{ background: '#4f46e5' }} /> Selected account
        </span>
        <span>
          <span className="legend-dot" style={{ background: '#818cf8' }} /> Connected account
        </span>
      </div>
    </div>
  )
}

export default NetworkGraph
