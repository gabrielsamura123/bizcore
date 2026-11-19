import { Banknote, Building2, WifiOff } from 'lucide-react'
import Logo from '@/components/Logo'

const benefits = [
  {
    icon: Building2,
    title: 'Multi-Tenant Isolation',
    description: 'Each shop stays 100% private.',
  },
  {
    icon: Banknote,
    title: 'NLe & Mobile Money Ready',
    description: 'Redenominated currency, Orange and Africell friendly.',
  },
  {
    icon: WifiOff,
    title: 'Offline Continuity',
    description: 'Built for low-bandwidth trading and weak connections.',
  },
]

export default function AuthShowcase() {
  return (
    <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-white/10 bg-neutral-950 px-10 py-10 lg:col-span-5 lg:flex xl:px-14">
      <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-slate-500/10 blur-3xl" />

      <div className="relative z-10">
        <Logo />
      </div>

      <div className="relative z-10 my-auto max-w-md">
        <h2
          data-aos="fade-up"
          className="text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl"
        >
          The modern operating system for commerce in Sierra Leone.
        </h2>

        <div
          data-aos="fade-up"
          data-aos-delay="120"
          className="liquid-glass mt-10 rounded-2xl p-5 shadow-2xl shadow-black/40"
        >
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Why BizCore
          </p>
          <ul className="space-y-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <li key={benefit.title} className="flex gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {benefit.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <p className="relative z-10 text-sm text-neutral-500">
        Trusted by retail, supermarkets &amp; pharmacies.
      </p>
    </aside>
  )
}
