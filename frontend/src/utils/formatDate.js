export function formatDate(value) {
  if (!value) return '—'

  const normalized = String(value).replace(' ', 'T')
  const hasTimezone =
    normalized.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(normalized)
  const date = new Date(hasTimezone ? normalized : `${normalized}Z`)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
