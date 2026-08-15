const AVATAR_COLORS = ['#4f46e5', '#0f766e', '#b45309', '#be185d', '#4338ca', '#0369a1', '#65a30d', '#9333ea']

export function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function colorFor(id) {
  const sum = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}
