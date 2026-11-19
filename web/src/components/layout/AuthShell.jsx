import { Link } from 'react-router-dom'
import Backdrop from '@/components/ui/Backdrop'
import Brand from '@/components/ui/Brand'
import LiquidOrb from '@/components/three/LiquidOrb'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060b]">
      <Backdrop />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <Brand />
          <Link to="/" className="text-sm text-slate-400 transition hover:text-white">
            Back to home
          </Link>
        </header>

        <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-md">
            <div className="glass rounded-2xl p-8">
              <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{subtitle}</p>
              <div className="mt-8">{children}</div>
              {footer && (
                <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>
              )}
            </div>
          </div>

          <div className="relative hidden h-[32rem] lg:block">
            <LiquidOrb className="absolute inset-0" />
            <div className="absolute bottom-8 left-8 max-w-xs">
              <p className="text-3xl font-semibold leading-tight text-gradient">
                One platform. Every business.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                POS, inventory and your team — securely separated per workspace.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
