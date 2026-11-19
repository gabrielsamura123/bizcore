import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'
import api from '@/api/axios'
import { useAuth } from '@/context/AuthContext'

const STORAGE_KEY = 'bizcore_active_business_id'
const BusinessContext = createContext(null)

export function BusinessProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const { pathname } = useLocation()
  const [myBusinesses, setMyBusinesses] = useState([])
  const [activeBusiness, setActiveBusinessState] = useState(null)
  const [loading, setLoading] = useState(false)

  const applyBusinesses = useCallback((items) => {
    const safeItems = Array.isArray(items) ? items : []
    setMyBusinesses(safeItems)

    const storedId = Number(localStorage.getItem(STORAGE_KEY))
    const selected =
      safeItems.find((item) => item.business.id === storedId) || safeItems[0]

    if (selected) {
      setActiveBusinessState(selected.business)
      localStorage.setItem(STORAGE_KEY, String(selected.business.id))
    } else {
      setActiveBusinessState(null)
      localStorage.removeItem(STORAGE_KEY)
    }

    return safeItems
  }, [])

  const fetchMyBusinesses = useCallback(async () => {
    if (!isAuthenticated || user?.is_superadmin) {
      applyBusinesses([])
      return []
    }

    setLoading(true)
    try {
      const { data } = await api.get('/businesses/my')
      return applyBusinesses(data)
    } catch {
      return applyBusinesses([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, applyBusinesses])

  useEffect(() => {
    if (!isAuthenticated || user?.is_superadmin) {
      applyBusinesses([])
      return
    }

    fetchMyBusinesses()
  }, [isAuthenticated, user, pathname, fetchMyBusinesses, applyBusinesses])

  const setActiveBusiness = useCallback((business) => {
    const value = business?.business || business
    if (!value?.id) return

    setActiveBusinessState(value)
    localStorage.setItem(STORAGE_KEY, String(value.id))
  }, [])

  const userRole = useMemo(() => {
    if (!activeBusiness) return null
    return (
      myBusinesses.find((item) => item.business.id === activeBusiness.id)?.role ||
      null
    )
  }, [activeBusiness, myBusinesses])

  const value = useMemo(
    () => ({
      myBusinesses,
      activeBusiness,
      userRole,
      setActiveBusiness,
      fetchMyBusinesses,
      loading,
    }),
    [
      myBusinesses,
      activeBusiness,
      userRole,
      setActiveBusiness,
      fetchMyBusinesses,
      loading,
    ]
  )

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (!context) {
    throw new Error('useBusiness must be used inside BusinessProvider')
  }
  return context
}
