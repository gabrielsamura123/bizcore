import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '@/api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem('access_token')
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    if (!accessToken) {
      setLoading(false)
      return undefined
    }

    api
      .get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(data)
      })
      .catch(() => {
        if (!active) return
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setAccessToken(null)
        setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { username: email, password })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    setAccessToken(data.access_token)

    const profile = await api.get('/auth/me')
    setUser(profile.data)
    return profile.data
  }

  const register = async (data) => {
    await api.post('/auth/register', data)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setAccessToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isAuthenticated: Boolean(accessToken),
      loading,
    }),
    [user, accessToken, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
