import { useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Boxes,
  TrendingUp,
} from 'lucide-react'
import BizCoreIcon from '@/components/BizCoreIcon'

const highlights = [
  {
    label: 'Sales',
    detail: 'Recorded automatically',
    icon: TrendingUp,
  },
  {
    label: 'Transactions',
    detail: 'Every payment captured',
    icon: ArrowUpRight,
  },
  {
    label: 'Stock',
    detail: 'Live low-stock alerts',
    icon: Boxes,
  },
]

export default function DashboardPreview3D() {
  const [tilt, setTilt] = useState({ x: 7, y: -12 })
  const cardRef = useRef(null)

  const handleMove = (event) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    setTilt({
      x: (0.5 - py) * 16,
      y: (px - 0.5) * 20,
    })
  }

  const handleLeave = () => setTilt({ x: 7, y: -12 })

  return (
    <div
      className="relative mx-auto w-full max-w-3xl [perspective:1200px]"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div
        ref={cardRef}
        className="relative rounded-2xl border border-white/10 bg-black/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl will-change-transform transition-transform duration-150 ease-out [transform-style:preserve-3d] sm:p-6"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <BizCoreIcon className="h-8 w-8" />
            <div>
              <p className="text-sm font-bold text-white">BizCore</p>
              <p className="text-[10px] text-neutral-400">
                Workspace overview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-black">
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            Live
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon
            return (
              <div
                key={highlight.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                style={{ transform: `translateZ(${18 + index * 6}px)` }}
              >
                <Icon className="mb-2 h-4 w-4 text-neutral-300" />
                <p className="text-[10px] text-neutral-500">
                  {highlight.label}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-white">
                  {highlight.detail}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
          <div
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-3"
            style={{ transform: 'translateZ(34px)' }}
          >
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-neutral-100">
              <Banknote className="h-4 w-4 text-neutral-300" />
              Cash flow
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Track cash and mobile money from one calm workspace.
            </p>
          </div>

          <div
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2"
            style={{ transform: 'translateZ(42px)' }}
          >
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-neutral-100">
              <AlertTriangle className="h-4 w-4 text-neutral-300" />
              Stock alerts
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Know what needs restocking before you run out.
            </p>
          </div>
        </div>

        <div
          className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4"
          style={{ transform: 'translateZ(24px)' }}
        >
          <span className="text-[10px] font-medium text-neutral-500">
            Mobile money ready
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-neutral-200">
            Orange Money
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-neutral-200">
            Africell Money
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-8 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-[50%] bg-white/[0.03] blur-2xl" />
    </div>
  )
}
