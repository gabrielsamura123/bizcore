import api from '@/api/axios'

const apiOrigin = api.defaults.baseURL.replace(/\/api\/v1\/?$/, '')

export function resolveUploadUrl(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${apiOrigin}${path.startsWith('/') ? '' : '/'}${path}`
}
