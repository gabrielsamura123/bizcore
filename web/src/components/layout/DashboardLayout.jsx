import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import Backdrop from '@/components/ui/Backdrop'
import Brand from '@/components/ui/Brand'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    let active = true
    authService
      .getMe()
      .then(({ data }) => {
        if (active) setUser(data)
      })
      .catch(() => setUser(null))
    return () => {
      active = false
    }
  }, [setUser])

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060b]">
      <Backdrop />
      <div className="relative flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-black/20 px-5 py-8 backdrop-blur-xl lg:flex">
          <Brand />
          <p className="mt-10 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>
          <nav className="mt-4 space-y-1">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? 'border border-violet-400/20 bg-violet-500/15 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
          </nav>
          <p className="mt-auto text-xs text-slate-600">More modules coming soon</p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-white/5 px-6 py-5">
            <div className="lg:hidden">
              <Brand />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500">Overview</p>
              <h1 className="text-lg font-semibold text-white">Dashboard</h1>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="hidden text-sm text-slate-300 sm:block">
                {user?.full_name || user?.email || 'Your account'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost px-3 py-2"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
