const STORAGE_KEY = 'bizcore_saved_accounts'
const MAX_SAVED_ACCOUNTS = 3

export function getSavedAccounts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((account) => account && typeof account.email === 'string')
      .slice(0, MAX_SAVED_ACCOUNTS)
  } catch {
    return []
  }
}

export function saveAccount(account) {
  if (!account?.email) return getSavedAccounts()

  const email = account.email.toLowerCase()
  const next = [
    {
      email,
      name: account.name || email.split('@')[0],
      role: account.role || 'Owner',
    },
    ...getSavedAccounts().filter(
      (saved) => saved.email.toLowerCase() !== email
    ),
  ].slice(0, MAX_SAVED_ACCOUNTS)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function removeSavedAccount(email) {
  const next = getSavedAccounts().filter(
    (saved) => saved.email.toLowerCase() !== String(email).toLowerCase()
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
