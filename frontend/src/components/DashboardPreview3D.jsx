import { useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Boxes,
  TrendingUp,
} from 'lucide-react'
import BizCoreIcon from '@/components/BizCoreIcon'

const stats = [
  { label: 'Sales today', value: 'NLe 1,284.00', change: '+14.2%', icon: TrendingUp },
  { label: 'Transactions', value: '42', change: '+8', icon: ArrowUpRight },
  { label: 'Stock items', value: '318', change: '12 low', icon: Boxes },
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
        className="relative rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl will-change-transform transition-transform duration-150 ease-out [transform-style:preserve-3d] dark:border-white/10 dark:bg-neutral-900/40 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_24px_70px_rgba(0,0,0,0.55)] sm:p-6"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="mb-5 flex items-center justify-between border-b border-neutral-200/80 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <BizCoreIcon className="h-8 w-8" />
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                BizCore
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-300">
                Today · Live overview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-medium text-white dark:bg-white dark:text-neutral-900">
            <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-neutral-900" />
            Live
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-neutral-200/70 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5"
                style={{ transform: `translateZ(${18 + index * 6}px)` }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <Icon className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
                  <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">
                    {stat.change}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-300">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-sm font-bold text-neutral-900 dark:text-white sm:text-base">
                  {stat.value}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
          <div
            className="rounded-xl border border-neutral-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5 sm:col-span-3"
            style={{ transform: 'translateZ(34px)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                <Banknote className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                Cash flow meter
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-300">
                This month
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
              <div className="h-full w-[72%] rounded-full bg-neutral-900 dark:bg-white" />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-neutral-500 dark:text-neutral-300">
              <span>NLe 8,400 collected</span>
              <span>72% of target</span>
            </div>
          </div>

          <div
            className="rounded-xl border border-neutral-200/70 bg-neutral-50/80 p-4 dark:border-white/10 dark:bg-white/5 sm:col-span-2"
            style={{ transform: 'translateZ(42px)' }}
          >
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-100">
              <AlertTriangle className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              Stock alerts
            </div>
            <ul className="space-y-2 text-[11px] text-neutral-600 dark:text-neutral-300">
              <li className="flex justify-between">
                <span>Indomie (carton)</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  4 left
                </span>
              </li>
              <li className="flex justify-between">
                <span>Mobile airtime</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  7 left
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-200/80 pt-4 dark:border-white/10"
          style={{ transform: 'translateZ(24px)' }}
        >
          <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-300">
            Mobile money ready
          </span>
          <span className="rounded-full border border-neutral-300 bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-neutral-700 dark:border-white/15 dark:bg-white/5 dark:text-neutral-200">
            Orange Money
          </span>
          <span className="rounded-full border border-neutral-300 bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-neutral-700 dark:border-white/15 dark:bg-white/5 dark:text-neutral-200">
            Africell Money
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-8 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-[50%] bg-black/10 blur-2xl dark:bg-white/5" />
    </div>
  )
}
