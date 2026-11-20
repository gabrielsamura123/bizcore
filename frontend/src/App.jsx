import { useEffect } from 'react'
import AOS from 'aos'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminRoute from '@/components/AdminRoute'
import ProtectedRoute from '@/components/ProtectedRoute'
import WorkspaceActiveRoute from '@/components/WorkspaceActiveRoute'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import DashboardPage from '@/pages/DashboardPage'
import InventoryPage from '@/pages/InventoryPage'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import PosTerminalPage from '@/pages/PosTerminalPage'
import ReceiptSettingsPage from '@/pages/ReceiptSettingsPage'
import RegisterPage from '@/pages/RegisterPage'
import { useAuth } from '@/context/AuthContext'

function HomeRedirect() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading || (isAuthenticated && !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090b] text-sm text-neutral-400">
        Loading BizCore...
      </div>
    )
  }

  const target = !isAuthenticated
    ? '/'
    : user.is_superadmin
      ? '/admin'
      : '/dashboard'

  return <Navigate to={target} replace />
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    AOS.refreshHard()
  }, [location.pathname])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route element={<WorkspaceActiveRoute />}>
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/pos" element={<PosTerminalPage />} />
          <Route path="/receipt-settings" element={<ReceiptSettingsPage />} />
        </Route>
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
