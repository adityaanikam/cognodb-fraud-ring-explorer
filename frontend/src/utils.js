const AVATAR_COLORS = ['#d9843f', '#5fb3a3', '#b8973f', '#c2604a', '#6b7fa8', '#c9a227', '#9a6bb0', '#6b9a6f']

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
