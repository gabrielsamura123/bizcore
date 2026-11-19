import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  Boxes,
  CalendarDays,
  CreditCard,
  LayoutGrid,
  Loader2,
  LockKeyhole,
  ScanLine,
  Settings2,
  X,
} from 'lucide-react'
import api from '@/api/axios'

const CATEGORY_ORDER = ['Sales', 'Inventory', 'Specialized', 'Finance']

const FEATURE_ICONS = {
  pos_core: CreditCard,
  inventory_basic: Boxes,
  barcode_scanner: ScanLine,
  expenses: Banknote,
  expiry_dates: CalendarDays,
  tables_dining: LayoutGrid,
}

export default function ManageFeaturesModal({
  open,
  business,
  onClose,
  onUpdated,
}) {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [togglingKey, setTogglingKey] = useState(null)

  useEffect(() => {
    if (!open || !business?.id) return undefined

    let active = true
    setLoading(true)
    setError('')

    api
      .get(`/admin/businesses/${business.id}/features`)
      .then(({ data }) => {
        if (active) setFeatures(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.detail || 'Could not load tenant modules.'
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [open, business?.id])

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const groups = useMemo(() => {
    const ordered = CATEGORY_ORDER.map((category) => ({
      category,
      items: features
        .filter((feature) => feature.category === category)
        .sort((left, right) => left.name.localeCompare(right.name)),
    }))

    const known = new Set(CATEGORY_ORDER)
    const extras = features.filter((feature) => !known.has(feature.category))
    if (extras.length) {
      ordered.push({
        category: 'Other',
        items: extras.sort((left, right) => left.name.localeCompare(right.name)),
      })
    }

    return ordered.filter((group) => group.items.length > 0)
  }, [features])

  const toggleFeature = async (feature) => {
    if (feature.is_core || togglingKey) return

    const nextValue = !feature.is_enabled
    const previousValue = feature.is_enabled
    setTogglingKey(feature.key)
    setError('')
    setFeatures((current) =>
      current.map((item) =>
        item.key === feature.key ? { ...item, is_enabled: nextValue } : item
      )
    )

    try {
      const { data } = await api.post(
        `/admin/businesses/${business.id}/features/toggle`,
        { feature_key: feature.key, is_enabled: nextValue }
      )
      setFeatures((current) =>
        current.map((item) =>
          item.key === feature.key
            ? { ...item, is_enabled: data.is_enabled }
            : item
        )
      )
      onUpdated?.(data.message)
    } catch (err) {
      setFeatures((current) =>
        current.map((item) =>
          item.key === feature.key
            ? { ...item, is_enabled: previousValue }
            : item
        )
      )
      setError(err.response?.data?.detail || 'Could not update this module.')
    } finally {
      setTogglingKey(null)
    }
  }

  if (!open || !business) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close module manager"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-features-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-black/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-200">
              <Settings2 className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="manage-features-title"
                className="text-lg font-bold text-white"
              >
                Manage Modules — {business.name}
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                Enable or restrict functionality for this tenant.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading modules...
            </div>
          ) : error ? (
            <div className="notice">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-7">
              {groups.map((group) => (
                <section key={group.category}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      {group.category}
                    </h3>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
                      {group.items.length} modules
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.items.map((feature) => {
                      const Icon = FEATURE_ICONS[feature.key] || Settings2
                      const locked = feature.is_core || Boolean(togglingKey)

                      return (
                        <div
                          key={feature.key}
                          className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20"
                        >
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-300">
                            <Icon className="h-4 w-4" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold text-white">
                                {feature.name}
                              </h4>
                              {feature.is_core && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-neutral-300">
                                  <LockKeyhole className="h-3 w-3" />
                                  Core
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                              {feature.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={feature.is_enabled}
                            aria-label={`${feature.is_enabled ? 'Disable' : 'Enable'} ${feature.name}`}
                            disabled={locked}
                            onClick={() => toggleFeature(feature)}
                            className={`relative mt-1 h-6 w-11 shrink-0 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                              feature.is_enabled
                                ? 'border-white/40 bg-white'
                                : 'border-white/15 bg-white/10'
                            }`}
                          >
                            <span
                              className={`absolute left-1 top-1 h-4 w-4 rounded-full shadow transition-all duration-300 ${
                                feature.is_enabled
                                  ? 'translate-x-5 bg-black'
                                  : 'translate-x-0 bg-neutral-300'
                              }`}
                            />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-4">
          <p className="flex items-center gap-2 text-[11px] text-neutral-500">
            <LockKeyhole className="h-3.5 w-3.5" />
            Core modules are always on and cannot be disabled.
          </p>
        </div>
      </aside>
    </div>
  )
}
