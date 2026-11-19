import { Link } from 'react-router-dom'
import { ArrowRight, Boxes, ShieldCheck, Sparkles, Users } from 'lucide-react'
import Backdrop from '@/components/ui/Backdrop'
import Brand from '@/components/ui/Brand'
import LiquidOrb from '@/components/three/LiquidOrb'

const features = [
  {
    icon: Boxes,
    title: 'Point of sale',
    text: 'A fast, focused checkout experience built for busy counters.',
  },
  {
    icon: ShieldCheck,
    title: 'Private workspaces',
    text: 'Every business gets its own isolated data and access rules.',
  },
  {
    icon: Users,
    title: 'Staff & roles',
    text: 'Give cashiers and managers exactly the access they need.',
  },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060b]">
      <Backdrop />

      <div className="relative mx-auto max-w-7xl px-6">
        <header className="flex items-center justify-between py-8">
          <Brand />
          <nav className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost px-4 py-2.5">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary px-4 py-2.5">
              Get started
            </Link>
          </nav>
        </header>

        <main>
          <section className="grid items-center gap-12 pb-24 pt-10 lg:grid-cols-2 lg:pb-32 lg:pt-16">
            <div>
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium tracking-wide text-slate-300">
                <Sparkles size={14} className="text-violet-300" />
                Multi-tenant SaaS POS platform
              </span>

              <h1 className="mt-8 text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Run every business.
                <br />
                <span className="text-gradient">From one place.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                Supermarket, pharmacy, or retail chain — each workspace gets its own
                POS, inventory, staff and financial tools on one secure platform.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link to="/register" className="btn-primary">
                  Start your workspace
                  <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-slate-500">
                <span>JWT secured</span>
                <span>Role-based access</span>
                <span>Isolated by design</span>
              </div>
            </div>

            <div className="relative h-[26rem] lg:h-[38rem]">
              <LiquidOrb className="absolute inset-0" />
              <div className="glass absolute bottom-8 right-2 hidden rounded-2xl px-5 py-4 sm:block">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Workspaces
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  Isolated <span className="text-gradient">by default</span>
                </p>
              </div>
            </div>
          </section>

          <section className="pb-28">
            <div className="grid gap-5 md:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="glass glass-hover group rounded-2xl p-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/25 to-cyan-500/10 text-violet-200">
                    <Icon size={20} />
                  </span>
                  <h2 className="mt-5 text-lg font-semibold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer className="flex flex-col gap-2 border-t border-white/5 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>BizCore — one platform, every business.</span>
          <span>Built for modern operations.</span>
        </footer>
      </div>
    </div>
  )
}
