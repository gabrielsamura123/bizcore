import { useEffect } from 'react'
import AOS from 'aos'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardPage from '@/pages/DashboardPage'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import { useAuth } from '@/context/AuthContext'

function HomeRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />
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
      </Route>
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
