import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Building2,
  ChevronDown,
  LayoutGrid,
  MapPin,
  Phone,
  X,
} from 'lucide-react'
import api from '@/api/axios'
import LiquidInput from '@/components/auth/LiquidInput'
import { useBusiness } from '@/context/BusinessContext'

const INDUSTRIES = [
  'Supermarket',
  'Pharmacy',
  'Boutique',
  'Restaurant',
  'Electronics',
  'General Retail',
]

export default function CreateBusinessModal({ open, onClose }) {
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('Supermarket')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const nameRef = useRef(null)
  const { fetchMyBusinesses, setActiveBusiness } = useBusiness()

  useEffect(() => {
    if (!open) return undefined

    setName('')
    setIndustry('Supermarket')
    setPhone('')
    setAddress('')
    setError('')
    const frame = requestAnimationFrame(() => nameRef.current?.focus())
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (name.trim().length < 2) {
      setError('Please enter a business name with at least 2 characters.')
      nameRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      const { data } = await api.post('/businesses/', {
        name: name.trim(),
        industry,
        phone: phone.trim() || null,
        address: address.trim() || null,
        currency: 'NLe',
      })
      const items = await fetchMyBusinesses()
      const created = items.find((item) => item.business.id === data.id)
      setActiveBusiness(created?.business || data)
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(
        Array.isArray(detail)
          ? detail.map((item) => item.msg).join(' ')
          : detail || 'Could not register this business. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-business-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-black/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2
              id="create-business-title"
              className="text-xl font-bold tracking-tight text-white"
            >
              Register New Business
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Your workspace starts in pending review.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-neutral-100"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <LiquidInput
            id="business_name"
            label="Business Name"
            icon={Building2}
            type="text"
            placeholder="Your business name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            inputRef={nameRef}
          />

          <div>
            <label
              className="mb-2 block text-sm font-medium text-neutral-300"
              htmlFor="industry"
            >
              Industry
            </label>
            <div className="relative">
              <LayoutGrid className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <select
                id="industry"
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-10 text-sm text-white outline-none backdrop-blur-xl transition-all duration-300 focus:scale-[1.005] focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.08)]"
              >
                {INDUSTRIES.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-neutral-900 text-white"
                    style={{ backgroundColor: '#171717', color: '#ffffff' }}
                  >
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            </div>
          </div>

          <LiquidInput
            id="business_phone"
            label="Phone Number"
            icon={Phone}
            type="text"
            placeholder="+232 76 000 000"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />

          <LiquidInput
            id="business_address"
            label="Business Address"
            icon={MapPin}
            type="text"
            placeholder="24 Lumley Beach Road, Freetown"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Currency
            </label>
            <div className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300">
              NLe (New Leone)
            </div>
          </div>

          <button
            type="submit"
            className="btn-shimmer active:scale-[0.98] mt-2 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-white/5 transition-all hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            <span>{submitting ? 'Registering...' : 'Register Business'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
