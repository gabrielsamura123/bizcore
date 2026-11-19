import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Loader2,
  LockKeyhole,
  Mail,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react'
import api from '@/api/axios'

const ROLE_OPTIONS = [
  {
    value: 'manager',
    label: 'Manager',
    description: 'View staff and inventory, review sales, approve voids.',
  },
  {
    value: 'cashier',
    label: 'Cashier',
    description: 'POS and checkout access only.',
  },
  {
    value: 'inventory',
    label: 'Inventory Clerk',
    description: 'Stock and product management only.',
  },
]

export default function AddMemberModal({
  open,
  businessId,
  canCreateManager,
  onClose,
  onCreated,
}) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('cashier')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    setFullName('')
    setEmail('')
    setPassword('')
    setRole('cashier')
    setError('')
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const roles = canCreateManager
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((option) => option.value !== 'manager')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { data } = await api.post(`/businesses/${businessId}/members`, {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
      })
      onCreated(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not add this team member.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close add member dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-member-title"
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900/90 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-200">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="add-member-title"
                className="text-lg font-bold text-white"
              >
                Add Team Member
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                Create staff access for this store workspace.
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

        {error && (
          <div role="alert" className="notice mb-5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="member-name" className="label">
              Full Name
            </label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="member-name"
                className="input pl-10"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Alhaji Bangura"
                minLength={2}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="member-email" className="label">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="member-email"
                type="email"
                className="input pl-10"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="cashier1@lumleyfresh.sl"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="member-password" className="label">
              Temporary Password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="member-password"
                type="password"
                className="input pl-10"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </div>
          </div>

          <fieldset>
            <legend className="label">Role</legend>
            <div className="space-y-2">
              {roles.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    role === option.value
                      ? 'border-white/35 bg-white/10'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="member-role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => setRole(option.value)}
                    className="mt-1 h-4 w-4 accent-white"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-neutral-400">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-4 py-2.5 text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-shimmer inline-flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/20 px-4 py-2.5 text-xs font-semibold text-emerald-100 backdrop-blur transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {submitting ? 'Adding...' : 'Add member'}
          </button>
        </div>
      </form>
    </div>
  )
}
