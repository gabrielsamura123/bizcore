import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function AdminRoute() {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090b] text-sm text-neutral-400">
        Loading platform console...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090b] text-sm text-neutral-400">
        Loading platform console...
      </div>
    )
  }

  if (!user.is_superadmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
