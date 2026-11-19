import { useEffect, useState } from 'react'
import { Banknote, Building2, ShieldCheck, WifiOff } from 'lucide-react'
import Logo from '@/components/Logo'

const benefits = [
  {
    icon: Building2,
    title: 'Multi-tenant isolation',
    description: 'Every store keeps its own books, stock, and staff.',
  },
  {
    icon: Banknote,
    title: 'NLe & mobile money ready',
    description: 'Built for Sierra Leone retail and redomination.',
  },
  {
    icon: WifiOff,
    title: 'Offline continuity',
    description: 'Keeps trading through weak connections.',
  },
]

export default function AuthShowcase() {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const reveal = (delay) =>
    `transition-all duration-700 ease-out ${delay} ${
      entered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
    }`

  return (
    <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-l border-white/10 bg-[#07090b] px-8 py-10 text-neutral-100 md:col-span-5 md:flex xl:px-14">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" />

      <div className={`relative z-10 ${reveal('delay-100')}`}>
        <Logo />
      </div>

      <div className={`relative z-10 my-auto max-w-md ${reveal('delay-200')}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Built for Sierra Leone
        </p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
          The operating system for modern commerce.
        </h2>

        <div className="liquid-glass mt-8 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-neutral-300" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Why BizCore
            </p>
          </div>

          <ul className="mt-6 space-y-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <li key={benefit.title} className="flex gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-neutral-200">
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

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
          <p className="text-xs text-neutral-400">
            Secure platform access. No shared tenant data.
          </p>
        </div>
      </div>

      <p
        className={`relative z-10 text-sm text-neutral-500 ${reveal('delay-500')}`}
      >
        Trusted by retail, supermarkets &amp; pharmacies.
      </p>
    </aside>
  )
}
