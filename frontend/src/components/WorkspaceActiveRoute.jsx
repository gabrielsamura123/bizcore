import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useBusiness } from '@/context/BusinessContext'

export default function WorkspaceActiveRoute() {
  const { activeBusiness, loading } = useBusiness()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-[#07090b] text-sm text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading workspace...
      </div>
    )
  }

  if (!activeBusiness || activeBusiness.status !== 'active') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
