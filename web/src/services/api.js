import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

const publicAuthPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
]

const isPublicAuthRequest = (url = '') =>
  publicAuthPaths.some((path) => url.includes(path))

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthRequest(originalRequest.url)
    ) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          const { data } = await api.post('/auth/refresh', {
            refresh_token: refreshToken,
          })
          useAuthStore.getState().setTokens(data)
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
          return api(originalRequest)
        } catch {
          useAuthStore.getState().logout()
          window.location.assign('/login')
        }

        return Promise.reject(error)
      }

      useAuthStore.getState().logout()
      window.location.assign('/login')
    }

    return Promise.reject(error)
  }
)

export default api
