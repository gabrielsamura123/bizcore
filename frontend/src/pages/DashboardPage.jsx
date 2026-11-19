import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Banknote,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  LayoutDashboard,
  LayoutGrid,
  Loader2,
  LogOut,
  Plus,
  ScanLine,
  Store,
  UserRound,
} from 'lucide-react'
import api from '@/api/axios'
import BottomTabBar from '@/components/BottomTabBar'
import CreateBusinessModal from '@/components/CreateBusinessModal'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { useBusiness } from '@/context/BusinessContext'
import { formatDate } from '@/utils/formatDate'

const STATUS_STYLES = {
  active: 'border-white/25 bg-white/10 text-white',
  pending: 'border-white/15 bg-white/5 text-neutral-300',
  suspended: 'border-white/10 bg-white/[0.03] text-neutral-400',
  rejected: 'border-white/10 bg-white/[0.03] text-neutral-400',
}

const MODULE_CATALOG = {
  pos_core: {
    title: 'POS checkout',
    description: 'Fast counter sales, receipts, and returns.',
    icon: CreditCard,
  },
  inventory_basic: {
    title: 'Inventory',
    description: 'Stock levels, suppliers, and low-stock alerts.',
    icon: Boxes,
  },
  barcode_scanner: {
    title: 'Barcode & SKU Scanner',
    description: 'Scan products for faster checkout and stock updates.',
    icon: ScanLine,
  },
  expiry_dates: {
    title: 'Medicine & Expiry Alerts',
    description: 'Track perishable and medicine expiry dates before stock expires.',
    icon: CalendarDays,
  },
  expenses: {
    title: 'Expense & Cash Flow',
    description: 'Record operating expenses and follow your cash flow.',
    icon: Banknote,
  },
  tables_dining: {
    title: 'Table Management',
    description: 'Organize dining tables, sections, and dine-in orders.',
    icon: LayoutGrid,
  },
}

function titleCase(value) {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function DashboardPage() {
  const { logout } = useAuth()
  const { myBusinesses, activeBusiness, userRole, loading } = useBusiness()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [createOpen, setCreateOpen] = useState(false)
  const [enabledFeatures, setEnabledFeatures] = useState([])
  const [featuresLoading, setFeaturesLoading] = useState(false)
  const [featuresError, setFeaturesError] = useState('')

  const firstName = (profile?.full_name || 'there').split(' ')[0]
  const workspaceStatus = activeBusiness?.status || 'none'
  const modulesUnlocked = workspaceStatus === 'active'

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

  const loadEnabledFeatures = useCallback(() => {
    const businessId = activeBusiness?.id

    if (!businessId) {
      setEnabledFeatures([])
      setFeaturesLoading(false)
      return undefined
    }

    let active = true
    setFeaturesLoading(true)
    setFeaturesError('')

    api
      .get(`/businesses/${businessId}/features`)
      .then(({ data }) => {
        if (active) {
          setEnabledFeatures(
            Array.isArray(data?.features) ? data.features : []
          )
        }
      })
      .catch((err) => {
        if (active) {
          setFeaturesError(
            err.response?.data?.detail || 'Could not load workspace modules.'
          )
        }
      })
      .finally(() => {
        if (active) setFeaturesLoading(false)
      })

    return () => {
      active = false
    }
  }, [activeBusiness?.id])

  useEffect(() => loadEnabledFeatures(), [loadEnabledFeatures])

  useEffect(() => {
    const handleFocus = () => loadEnabledFeatures()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loadEnabledFeatures])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const bottomItems = [
    { label: 'Home', icon: Home, to: '/' },
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
      label: 'Workspace',
      icon: Store,
      active: activeTab === 'workspace',
      onClick: () => {
        setActiveTab('workspace')
        scrollToSection('workspace-section')
      },
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
    },
  ]

  const modules = useMemo(() => {
    if (!modulesUnlocked) return []

    return enabledFeatures
      .filter((key) => Boolean(MODULE_CATALOG[key]))
      .map((key) => ({ key, ...MODULE_CATALOG[key] }))
  }, [enabledFeatures, modulesUnlocked])

  return (
    <div className="min-h-screen bg-[#07090b] text-white">
      <Navbar onOpenCreate={() => setCreateOpen(true)} />
      <BottomTabBar items={bottomItems} />

      <main className="mx-auto max-w-7xl px-5 pb-28 pt-24 md:pb-16 md:pt-32">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300">
              Workspace overview
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Welcome, {firstName}
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Here is the current state of your BizCore workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-shimmer active:scale-[0.98] inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
          >
            <Plus className="h-4 w-4" />
            New workspace
          </button>
        </header>

        {error && (
          <div role="alert" className="notice mb-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {workspaceStatus === 'pending' && (
          <section className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-neutral-200">
                <Clock3 className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-neutral-100">
                  Application pending review
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                  Your workspace is waiting for platform approval. Modules unlock
                  automatically once approved.
                </p>
              </div>
            </div>
          </section>
        )}

        {(workspaceStatus === 'suspended' || workspaceStatus === 'rejected') && (
          <section className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-neutral-200">
                <AlertCircle className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-neutral-100">
                  Workspace access restricted
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                  This workspace is {workspaceStatus}. Contact platform support
                  for assistance.
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <section
            id="workspace-section"
            className="card p-6 lg:col-span-2"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-neutral-300" />
                <h2 className="text-lg font-bold text-white">
                  Your workspace
                </h2>
              </div>
              {activeBusiness && (
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${
                    STATUS_STYLES[workspaceStatus] || STATUS_STYLES.rejected
                  }`}
                >
                  {titleCase(workspaceStatus)}
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-10 text-center text-sm text-neutral-400">
                Loading workspace...
              </div>
            ) : !activeBusiness ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
                <Store className="mx-auto h-6 w-6 text-neutral-200" />
                <p className="mt-3 text-sm font-semibold text-white">
                  No workspace yet
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Register your first store to start your application.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="btn-shimmer mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-neutral-200"
                >
                  Register your store
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-white">
                      {activeBusiness.name}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      /{activeBusiness.slug} · {activeBusiness.industry}
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-neutral-200">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        modulesUnlocked ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                    {modulesUnlocked ? 'Operational' : 'Awaiting review'}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ['Status', titleCase(workspaceStatus)],
                    ['Your role', titleCase(userRole)],
                    ['Currency', activeBusiness.currency],
                    ['Workspaces', myBusinesses.length],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <p className="text-[11px] text-neutral-400">
                        {label}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-white">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <div className="space-y-6">
            <section className="card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-neutral-300" />
                <h2 className="text-lg font-bold text-white">
                  Quick actions
                </h2>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-left text-sm font-semibold text-neutral-100 transition hover:border-white/30 hover:bg-white/5"
                >
                  Register a store
                  <Plus className="h-4 w-4 text-neutral-200" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('workspace-section')}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-left text-sm font-semibold text-neutral-100 transition hover:border-white/30 hover:bg-white/5"
                >
                  Manage workspaces
                  <ArrowRight className="h-4 w-4 text-neutral-200" />
                </button>
                {profile?.is_superadmin && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="flex w-full items-center justify-between rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Admin console
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </section>

            <section className="card p-6">
              <div className="mb-4 flex items-center gap-2">
                <UserRound className="h-5 w-5 text-neutral-300" />
                <h2 className="text-lg font-bold text-white">
                  Account
                </h2>
              </div>
              <dl className="space-y-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-neutral-400">Name</dt>
                  <dd className="truncate font-semibold text-white">
                    {profile?.full_name || '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-neutral-400">Email</dt>
                  <dd className="truncate font-semibold text-white">
                    {profile?.email || '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-neutral-400">Role</dt>
                  <dd className="font-semibold text-white">
                    {profile?.is_superadmin ? 'Superadmin' : 'Business owner'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-neutral-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Member since
                  </dt>
                  <dd className="font-semibold text-white">
                    {formatDate(profile?.created_at)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Modules
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                {!modulesUnlocked
                  ? 'Modules unlock after your workspace is approved.'
                  : featuresLoading
                    ? 'Loading your workspace modules...'
                    : featuresError
                      ? 'Could not load your workspace modules.'
                      : 'Modules enabled for this workspace.'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-neutral-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-neutral-200" />
              {modulesUnlocked ? 'Workspace active' : 'Approval required'}
            </span>
          </div>

          {modulesUnlocked && featuresLoading ? (
            <div className="card flex items-center justify-center gap-2 p-10 text-sm text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading modules...
            </div>
          ) : modulesUnlocked && featuresError ? (
            <div className="notice">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{featuresError}</span>
            </div>
          ) : modules.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {modules.map((module) => {
                const Icon = module.icon
                return (
                  <article
                    key={module.key}
                    className="card p-5 transition hover:border-white/30"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-neutral-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
                        Enabled
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-white">
                      {module.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                      {module.description}
                    </p>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="text-sm font-semibold text-white">
                {modulesUnlocked ? 'No modules enabled' : 'Approval required'}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-neutral-400">
                {modulesUnlocked
                  ? 'An administrator has not enabled any modules for this workspace yet.'
                  : 'Your modules will appear here once your workspace is approved.'}
              </p>
            </div>
          )}
        </section>

        <section className="card mt-6 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-neutral-300" />
            <h2 className="text-lg font-bold text-white">
              Recent activity
            </h2>
          </div>
          <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
            <p className="text-sm font-semibold text-white">
              No activity yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-400">
              Sales, stock movements, and staff actions will show up here once
              the workspace modules are live.
            </p>
          </div>
        </section>
      </main>

      <CreateBusinessModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  )
}
