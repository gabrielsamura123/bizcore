import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react'
import api from '@/api/axios'
import BottomTabBar from '@/components/BottomTabBar'
import Logo from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

function decodeToken(token) {
  if (!token) return null
  try {
    const base64 = token
      .split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export default function DashboardPage() {
  const { logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const accessToken = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')
  const payload = decodeToken(accessToken)
  const expiresAt = payload?.exp
    ? new Date(payload.exp * 1000).toLocaleString()
    : 'Available until refresh'

  useEffect(() => {
    let active = true
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (active) setProfile(data)
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.detail || 'Could not load your profile.')
        }
      })
    return () => {
      active = false
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const bottomItems = [
    {
      label: 'Home',
      icon: Home,
      to: '/',
    },
    {
      label: 'Overview',
      icon: LayoutDashboard,
      active: activeTab === 'overview',
      onClick: () => {
        setActiveTab('overview')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },
    },
    {
      label: 'Profile',
      icon: UserRound,
      active: activeTab === 'profile',
      onClick: () => {
        setActiveTab('profile')
        scrollToSection('profile-section')
      },
    },
    {
      label: 'Session',
      icon: KeyRound,
      active: activeTab === 'session',
      onClick: () => {
        setActiveTab('session')
        scrollToSection('session-section')
      },
    },
    {
      label: 'Theme',
      icon: isDark ? Sun : Moon,
      onClick: toggleTheme,
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
    },
  ]

  const maskedToken = accessToken
    ? `${accessToken.slice(0, 16)}...${accessToken.slice(-8)}`
    : 'Not available'

  return (
    <div className="min-h-screen bg-neutral-50 transition-colors duration-300 dark:bg-neutral-950">
      <header className="pointer-events-none fixed inset-x-0 top-5 z-50 hidden justify-center px-4 md:flex">
        <div className="liquid-glass pointer-events-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 rounded-2xl px-4 sm:px-5">
          <div className="relative z-10">
            <Logo />
          </div>

          <div className="relative z-10 flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {profile?.full_name || 'Loading...'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-300">
                {profile?.email || 'Loading...'}
              </p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-sm font-bold text-neutral-900 dark:border-white/15 dark:bg-white/10 dark:text-white">
              {(profile?.full_name || 'B').charAt(0).toUpperCase()}
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-3 py-2 text-sm font-semibold text-neutral-700 backdrop-blur transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <BottomTabBar items={bottomItems} />

      <main className="mx-auto max-w-6xl px-5 pb-28 pt-24 md:pb-16 md:pt-32">
        <div data-aos="fade-up" className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-neutral-700 dark:text-neutral-300">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Welcome, {profile?.full_name || 'there'}
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Your account is active and your session is verified end to end.
          </p>
        </div>

        {error && (
          <div role="alert" className="notice mb-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section
            id="profile-section"
            data-aos="fade-up"
            className="card p-6 lg:col-span-3"
          >
            <div className="mb-5 flex items-center gap-2">
              <UserRound className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Your profile
              </h2>
            </div>

            <dl className="divide-y divide-neutral-200/70 dark:divide-white/10">
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-300">
                  <UserRound className="h-4 w-4" /> Full name
                </dt>
                <dd className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {profile?.full_name || '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-300">
                  <Mail className="h-4 w-4" /> Email
                </dt>
                <dd className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {profile?.email || '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-300">
                  <ShieldCheck className="h-4 w-4" /> Role
                </dt>
                <dd className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {profile?.is_superadmin ? 'Superadmin' : 'User'}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-300">
                  <CheckCircle2 className="h-4 w-4" /> Account status
                </dt>
                <dd>
                  <span className="rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-900 dark:border-white/15 dark:bg-white/10 dark:text-white">
                    {profile?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-300">
                  <CalendarDays className="h-4 w-4" /> Member since
                </dt>
                <dd className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-sm text-neutral-500 dark:text-neutral-300">
                  User ID
                </dt>
                <dd className="font-mono text-xs text-neutral-500 dark:text-neutral-300">
                  {profile?.id || '—'}
                </dd>
              </div>
            </dl>
          </section>

          <section
            id="session-section"
            data-aos="fade-up"
            data-aos-delay="100"
            className="card p-6 lg:col-span-2"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  JWT session
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-900 dark:border-white/15 dark:bg-white/10 dark:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white" />
                Active
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200/70 bg-neutral-100/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-300">
                  Access token
                </p>
                <p className="mt-1 break-all font-mono text-xs text-neutral-900 dark:text-white">
                  {maskedToken}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-neutral-200/70 p-4 dark:border-white/10">
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-300">
                    Refresh token
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                    {refreshToken ? 'Stored securely' : 'Not available'}
                  </p>
                </div>
                <CheckCircle2
                  className={`h-5 w-5 ${
                    refreshToken
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-300 dark:text-neutral-600'
                  }`}
                />
              </div>
              <div className="rounded-xl border border-neutral-200/70 p-4 dark:border-white/10">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-300">
                  Expires
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                  {expiresAt}
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-300">
              This page loaded your profile from{' '}
              <code className="rounded bg-neutral-200/70 px-1 py-0.5 text-[11px] text-neutral-800 dark:bg-white/10 dark:text-white">
                GET /api/v1/auth/me
              </code>{' '}
              using your bearer token. Refresh the page and you will stay logged
              in.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
