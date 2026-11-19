import { useEffect, useRef, useState } from 'react'
import { Building2, Check, ChevronDown, Plus } from 'lucide-react'
import { useBusiness } from '@/context/BusinessContext'

const STATUS_STYLES = {
  pending: 'border-white/15 bg-white/5 text-neutral-300',
  active: 'border-white/25 bg-white/10 text-white',
  suspended: 'border-white/10 bg-white/[0.03] text-neutral-400',
  rejected: 'border-white/10 bg-white/[0.03] text-neutral-400',
}

function titleCase(value) {
  if (!value) return 'Member'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function WorkspaceSwitcher({ onOpenCreate }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const { myBusinesses, activeBusiness, setActiveBusiness } = useBusiness()

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex max-w-[240px] items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-neutral-200 backdrop-blur transition hover:bg-white/10"
      >
        <Building2 className="h-4 w-4 shrink-0" />
        <span className="truncate">
          {activeBusiness ? activeBusiness.name : 'Select workspace'}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-white/10 bg-black/60 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Your workspaces
          </p>

          {myBusinesses.length === 0 ? (
            <p className="px-3 pb-3 text-xs text-neutral-400">
              No workspaces yet. Register your first store to get started.
            </p>
          ) : (
            <div className="space-y-1">
              {myBusinesses.map((item) => {
                const selected = activeBusiness?.id === item.business.id
                return (
                  <button
                    key={item.business.id}
                    type="button"
                    onClick={() => {
                      setActiveBusiness(item.business)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      selected
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-white">
                          {item.business.name}
                        </span>
                        {selected && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-neutral-200" />
                        )}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-neutral-200">
                          {titleCase(item.role)}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            STATUS_STYLES[item.business.status] ||
                            STATUS_STYLES.rejected
                          }`}
                        >
                          {titleCase(item.business.status)}
                        </span>
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="my-2 h-px bg-white/10" />

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onOpenCreate()
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-neutral-200 transition hover:bg-white/5"
          >
            <Plus className="h-4 w-4 text-neutral-200" />
            Register New Business
          </button>
        </div>
      )}
    </div>
  )
}
