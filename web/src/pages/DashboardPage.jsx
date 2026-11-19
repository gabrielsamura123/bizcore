import { ArrowUpRight, CircleDashed, Package, Users, Wallet } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const stats = [
  { label: 'Total sales', value: '—', icon: Wallet },
  { label: 'Orders', value: '—', icon: ArrowUpRight },
  { label: 'Products', value: '—', icon: Package },
  { label: 'Team members', value: '—', icon: Users },
]

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="glass relative overflow-hidden rounded-2xl p-8">
        <div className="aurora aurora-violet -right-20 -top-24 h-64 w-64 opacity-60" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-violet-300">
            Your workspace
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            Your account is ready. Business modules will appear here as they are
            enabled.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <article key={label} className="glass glass-hover rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {label}
              </span>
              <Icon size={17} className="text-violet-300" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="glass rounded-2xl p-8">
        <div className="flex items-center gap-3">
          <CircleDashed size={20} className="text-cyan-300" />
          <h3 className="text-lg font-semibold text-white">Getting started</h3>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Inventory, POS and staff tools are next. This dashboard is the home base
          for everything you will build in your workspace.
        </p>
      </section>
    </div>
  )
}
