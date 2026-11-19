import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck } from 'lucide-react'
import Logo from '@/components/Logo'
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher'
import { useAuth } from '@/context/AuthContext'

export default function Navbar({ onOpenCreate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isSuperadmin = Boolean(user?.is_superadmin)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = (user?.full_name || 'B')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  return (
    <header className="pointer-events-none fixed inset-x-0 top-5 z-50 hidden justify-center px-4 md:flex">
      <div className="liquid-glass pointer-events-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 rounded-2xl px-4 sm:px-5">
        <div className="relative z-10 flex min-w-0 items-center gap-3">
          <Logo />
          {!isSuperadmin && (
            <WorkspaceSwitcher onOpenCreate={onOpenCreate || (() => {})} />
          )}
        </div>

        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          {isSuperadmin && (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-neutral-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Platform Admin
            </span>
          )}

          <div className="hidden text-right lg:block">
            <p className="text-sm font-semibold text-white">
              {user?.full_name || 'Loading...'}
            </p>
            <p className="text-xs text-neutral-400">
              {user?.email || 'Loading...'}
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-bold text-white">
            {initials}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-neutral-200 backdrop-blur transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
