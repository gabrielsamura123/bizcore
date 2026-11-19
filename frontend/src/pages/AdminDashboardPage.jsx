import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  RotateCcw,
  ScrollText,
  Search,
  Settings2,
  ShieldAlert,
  UsersRound,
  X,
  Zap,
} from 'lucide-react'
import api from '@/api/axios'
import BizCoreIcon from '@/components/BizCoreIcon'
import ManageFeaturesModal from '@/components/ManageFeaturesModal'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/utils/formatDate'

const STATUS_STYLES = {
  active: 'border-white/25 bg-white/10 text-white',
  pending: 'border-white/15 bg-white/5 text-neutral-300',
  suspended: 'border-white/10 bg-white/[0.03] text-neutral-400',
  rejected: 'border-white/10 bg-white/[0.03] text-neutral-400',
}

const TONE_STYLES = {
  neutral: 'border-white/10 bg-white/[0.03]',
  attention:
    'border-white/25 bg-white/[0.06] shadow-[0_0_30px_rgba(255,255,255,0.06)]',
  active: 'border-white/20 bg-white/[0.05]',
  restricted: 'border-white/10 bg-white/[0.02]',
}

const NAV_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  {
    id: 'businesses',
    icon: Building2,
    label: 'Businesses',
    hint: 'Tenant Fleet',
  },
  { id: 'users', icon: UsersRound, label: 'Platform Users' },
  { id: 'audit', icon: ScrollText, label: 'Audit Logs' },
]

function titleCase(value) {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function adjustStats(current, previousStatus, nextStatus) {
  const next = { ...current }
  const keyFor = (status) =>
    ({
      pending: 'pending_businesses',
      active: 'active_businesses',
      suspended: 'suspended_businesses',
    })[status]

  const previousKey = keyFor(previousStatus)
  const nextKey = keyFor(nextStatus)

  if (previousKey) {
    next[previousKey] = Math.max(0, Number(next[previousKey] || 0) - 1)
  }
  if (nextKey) {
    next[nextKey] = Number(next[nextKey] || 0) + 1
  }

  return next
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total_businesses: 0,
    pending_businesses: 0,
    active_businesses: 0,
    suspended_businesses: 0,
    total_users: 0,
  })
  const [businesses, setBusinesses] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [actionId, setActionId] = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('overview')
  const [featureBusiness, setFeatureBusiness] = useState(null)
  const [featureModalOpen, setFeatureModalOpen] = useState(false)

  const loadPlatformData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsResponse, businessesResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/businesses'),
      ])
      setStats(statsResponse.data)
      setBusinesses(
        Array.isArray(businessesResponse.data) ? businessesResponse.data : []
      )
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load platform data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlatformData()
  }, [loadPlatformData])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  const filteredBusinesses = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return businesses
    return businesses.filter((business) =>
      [business.name, business.owner_name, business.phone, business.owner_email]
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [businesses, search])

  const pendingBusinesses = useMemo(
    () => filteredBusinesses.filter((business) => business.status === 'pending'),
    [filteredBusinesses]
  )

  const metrics = [
    {
      label: 'Total Businesses',
      value: stats.total_businesses,
      icon: Building2,
      tone: 'neutral',
      note: 'Registered tenants',
    },
    {
      label: 'Pending Approvals',
      value: stats.pending_businesses,
      icon: Zap,
      tone: 'attention',
      note: stats.pending_businesses > 0 ? 'Needs your review' : 'All caught up',
      pulse: stats.pending_businesses > 0,
    },
    {
      label: 'Active Workspaces',
      value: stats.active_businesses,
      icon: CheckCircle2,
      tone: 'active',
      note: 'Operational stores',
    },
    {
      label: 'Suspended Accounts',
      value: stats.suspended_businesses,
      icon: ShieldAlert,
      tone: 'restricted',
      note: 'Access restricted',
    },
  ]

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleNav = (item) => {
    setActiveNav(item.id)
    setMobileOpen(false)

    if (item.id === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (item.id === 'businesses') {
      scrollToSection('tenant-directory')
      return
    }

    setToast(`${item.label} module is not enabled in this phase`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleAction = async (business, action) => {
    setActionId(business.id)
    setError('')

    try {
      const { data } = await api.patch(
        `/admin/businesses/${business.id}/${action}`
      )
      const nextStatus = data.business.status
      const isQueueAction =
        business.status === 'pending' &&
        (action === 'approve' || action === 'reject')

      if (isQueueAction) {
        setRemovingId(business.id)
        await new Promise((resolve) => setTimeout(resolve, 280))
      }

      setBusinesses((current) =>
        current.map((item) =>
          item.id === business.id
            ? {
                ...item,
                ...data.business,
                owner_name: item.owner_name,
                owner_email: item.owner_email,
              }
            : item
        )
      )
      setStats((current) => adjustStats(current, business.status, nextStatus))
      setToast(data.message || 'Workspace updated successfully')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update this workspace.')
    } finally {
      setActionId(null)
      setRemovingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#07090b] text-neutral-100">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#0c0f12] transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <BizCoreIcon className="h-8 w-8 shrink-0" />
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">BizCore</p>
              <span className="mt-1 inline-flex rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-100">
                Admin Console
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav
          className={`flex-1 space-y-1 overflow-y-auto py-5 ${
            sidebarCollapsed ? 'px-3' : 'px-4'
          }`}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item)}
                title={item.label}
                className={`flex w-full items-center rounded-xl border text-sm transition-all ${
                  sidebarCollapsed
                    ? 'justify-center px-2 py-3'
                    : 'gap-3 px-3 py-2.5'
                } ${
                  activeNav === item.id
                    ? 'border-white/20 bg-white/10 text-neutral-100'
                    : 'border-transparent text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.hint && (
                      <span className="ml-auto text-[10px] text-neutral-500">
                        {item.hint}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-white">
              {(user?.full_name || 'GS')
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join('')}
            </span>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {user?.full_name || 'Loading...'}
                </p>
                <p className="text-[11px] text-neutral-500">Superadmin</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-neutral-300 transition hover:border-white/25 hover:bg-white/10 hover:text-white ${
              sidebarCollapsed ? 'px-2 py-2.5' : 'px-3 py-2.5'
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSidebarCollapsed((value) => !value)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#11151a] text-neutral-400 transition hover:text-white lg:flex"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07090b]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-neutral-300 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-200">
                  Platform administration
                </p>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-white">
                  Platform Administration
                </h1>
                <p className="mt-1 hidden text-sm text-neutral-400 sm:block">
                  Tenant fleet governance and business approvals across Sierra
                  Leone.
                </p>
              </div>
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search businesses by name, owner, or phone..."
                aria-label="Search businesses by name, owner, or phone"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-white/40 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(255,255,255,0.08)]"
              />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2.5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-neutral-100"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-neutral-400">
              Loading platform control center...
            </div>
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                  const Icon = metric.icon
                  return (
                    <article
                      key={metric.label}
                      className={`relative rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 ${TONE_STYLES[metric.tone]}`}
                    >
                      {metric.pulse && (
                        <span className="absolute right-5 top-5 h-2.5 w-2.5 animate-pulse rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.35)]" />
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                          {metric.label}
                        </p>
                        <Icon className="h-4 w-4 text-neutral-300" />
                      </div>
                      <p className="mt-4 text-3xl font-bold tracking-tight text-white">
                        {metric.value}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {metric.note}
                      </p>
                    </article>
                  )
                })}
              </section>

              <section id="pending-applications" className="mt-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-neutral-200" />
                    <h2 className="text-lg font-bold text-white">
                      Applications Awaiting Approval
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-neutral-100">
                    {pendingBusinesses.length} queued
                  </span>
                </div>

                {pendingBusinesses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                    <CheckCircle2 className="mx-auto h-6 w-6 text-neutral-200" />
                    <p className="mt-3 text-sm font-semibold text-white">
                      No pending applications
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      New business registrations will appear here for review.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {pendingBusinesses.map((business) => (
                      <article
                        key={business.id}
                        className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-300 ${
                          removingId === business.id
                            ? 'scale-95 opacity-0'
                            : 'scale-100 opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-white">
                              {business.name}
                            </h3>
                            <span className="mt-1 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-neutral-300">
                              {business.industry}
                            </span>
                          </div>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-neutral-200">
                            <Clock3 className="h-4 w-4" />
                          </span>
                        </div>

                        <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {business.address || 'Location not provided'}
                        </p>

                        <dl className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-black/20 p-4 text-xs">
                          <div>
                            <dt className="text-neutral-500">Owner</dt>
                            <dd className="mt-0.5 font-semibold text-white">
                              {business.owner_name}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-neutral-500">Phone</dt>
                            <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-white">
                              <Phone className="h-3 w-3 text-neutral-500" />
                              {business.phone || '—'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-neutral-500">Applied date</dt>
                            <dd className="mt-0.5 font-semibold text-white">
                              {formatDate(business.created_at)}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={actionId === business.id}
                            onClick={() => handleAction(business, 'approve')}
                            className="btn-shimmer active:scale-[0.98] inline-flex flex-1 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Approve Workspace
                          </button>
                          <button
                            type="button"
                            disabled={actionId === business.id}
                            onClick={() => handleAction(business, 'reject')}
                            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-neutral-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section id="tenant-directory" className="mt-8">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-neutral-300" />
                      <div>
                        <h2 className="text-base font-bold text-white">
                          Tenant Fleet Directory
                        </h2>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          Every registered workspace on the platform.
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-300">
                      {filteredBusinesses.length} tenants
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                      <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-neutral-500">
                        <tr>
                          <th className="px-5 py-3 font-semibold">
                            Business Name
                          </th>
                          <th className="px-5 py-3 font-semibold">Industry</th>
                          <th className="px-5 py-3 font-semibold">
                            Owner Details
                          </th>
                          <th className="px-5 py-3 font-semibold">
                            Registered Date
                          </th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                          <th className="px-5 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredBusinesses.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-5 py-10 text-center text-neutral-500"
                            >
                              No businesses match your search.
                            </td>
                          </tr>
                        ) : (
                          filteredBusinesses.map((business) => (
                            <tr
                              key={business.id}
                              className="transition hover:bg-white/[0.03]"
                            >
                              <td className="px-5 py-4">
                                <p className="font-semibold text-white">
                                  {business.name}
                                </p>
                                <p className="mt-0.5 text-xs text-neutral-500">
                                  /{business.slug}
                                </p>
                              </td>
                              <td className="px-5 py-4 text-neutral-300">
                                {business.industry}
                              </td>
                              <td className="px-5 py-4">
                                <p className="font-semibold text-white">
                                  {business.owner_name}
                                </p>
                                <p className="mt-0.5 text-xs text-neutral-500">
                                  {business.owner_email}
                                </p>
                              </td>
                              <td className="px-5 py-4 text-neutral-400">
                                {formatDate(business.created_at)}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                    STATUS_STYLES[business.status] ||
                                    STATUS_STYLES.rejected
                                  }`}
                                >
                                  {titleCase(business.status)}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFeatureBusiness(business)
                                      setFeatureModalOpen(true)
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-neutral-100 transition hover:bg-white/20"
                                  >
                                    <Settings2 className="h-3.5 w-3.5" />
                                    Features
                                  </button>
                                  {business.status === 'active' && (
                                    <button
                                      type="button"
                                      disabled={actionId === business.id}
                                      onClick={() =>
                                        handleAction(business, 'suspend')
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition hover:border-white/25 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Suspend
                                    </button>
                                  )}
                                  {(business.status === 'suspended' ||
                                    business.status === 'rejected') && (
                                    <button
                                      type="button"
                                      disabled={actionId === business.id}
                                      onClick={() =>
                                        handleAction(business, 'reactivate')
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-neutral-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      <RotateCcw className="h-3.5 w-3.5" />
                                      Reactivate
                                    </button>
                                  )}
                                  {business.status === 'pending' && (
                                    <span className="text-xs text-neutral-500">
                                      Awaiting approval
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      <ManageFeaturesModal
        open={featureModalOpen}
        business={featureBusiness}
        onClose={() => {
          setFeatureModalOpen(false)
          setFeatureBusiness(null)
        }}
        onUpdated={(message) => setToast(message)}
      />

      {toast && (
        <div className="fixed bottom-5 right-5 z-[110] flex max-w-sm items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-neutral-100 shadow-2xl backdrop-blur-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast}
        </div>
      )}
    </div>
  )
}
