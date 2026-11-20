export function formatDate(value) {
  const fallback = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })

  if (!value) return fallback

  const normalized = String(value).replace(' ', 'T')
  const hasTimezone =
    normalized.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(normalized)
  const date = new Date(hasTimezone ? normalized : `${normalized}Z`)

  if (Number.isNaN(date.getTime())) return fallback

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}
