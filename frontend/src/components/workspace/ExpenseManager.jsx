import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  Loader2,
  Plus,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import api from '@/api/axios'
import LiquidInput from '@/components/auth/LiquidInput'
import { formatDate } from '@/utils/formatDate'
import { formatNLe } from '@/utils/money'

const CATEGORIES = [
  'Generator & Fuel',
  'Rent & Utilities',
  'Staff & Wages',
  'Transport & Delivery',
  'Maintenance',
  'General Supplies',
]

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export default function ExpenseManager({
  businessId,
  canDelete = false,
  showList = true,
  open = false,
  onOpenChange,
  onChanged,
}) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    amount: '',
    description: '',
    date: todayInputValue(),
  })

  const loadExpenses = useCallback(() => {
    if (!businessId) return undefined

    let active = true
    setLoading(true)
    setError('')

    api
      .get(`/businesses/${businessId}/expenses`)
      .then(({ data }) => {
        if (active) setExpenses(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.detail || 'Could not load expenses.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [businessId])

  useEffect(() => loadExpenses(), [loadExpenses])

  useEffect(() => {
    if (!open) return

    setForm({
      category: CATEGORIES[0],
      amount: '',
      description: '',
      date: todayInputValue(),
    })
    setFormError('')
  }, [open])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Enter an amount greater than zero.')
      return
    }
    if (form.description.trim().length < 2) {
      setFormError('Add a short description for this expense.')
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/businesses/${businessId}/expenses`, {
        category: form.category,
        amount,
        description: form.description.trim(),
        date: form.date,
      })
      loadExpenses()
      onChanged?.()
      onOpenChange?.(false)
    } catch (err) {
      setFormError(
        err.response?.data?.detail || 'Could not save this expense.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (expenseId) => {
    try {
      await api.delete(`/businesses/${businessId}/expenses/${expenseId}`)
      loadExpenses()
      onChanged?.()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete this expense.')
    }
  }

  const modal = open ? (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close expense dialog"
        onClick={() => onOpenChange?.(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-modal-title"
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900/95 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-200">
              <Banknote className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="expense-modal-title"
                className="text-lg font-bold text-white"
              >
                Log Store Expense
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                Operating costs are included in your profit calculation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {formError && (
          <div role="alert" className="notice mb-5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="expense-category"
              className="mb-2 block text-sm font-medium text-neutral-300"
            >
              Category
            </label>
            <select
              id="expense-category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white outline-none transition focus:border-white/30"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category} className="bg-neutral-900">
                  {category}
                </option>
              ))}
            </select>
          </div>

          <LiquidInput
            id="expense-amount"
            label="Amount (NLe)"
            icon={Banknote}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                amount: event.target.value,
              }))
            }
          />

          <LiquidInput
            id="expense-description"
            label="Description"
            icon={Banknote}
            type="text"
            placeholder="e.g. Airtime and internet"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />

          <div>
            <label
              htmlFor="expense-date"
              className="mb-2 block text-sm font-medium text-neutral-300"
            >
              Date
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="expense-date"
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3.5 text-sm text-white outline-none transition focus:border-white/30 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 text-xs disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Save Expense
          </button>
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            className="btn-secondary flex-1 text-xs"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  ) : null

  if (!showList) return modal

  return (
    <>
      <section className="card p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-neutral-300" />
            <div>
              <h2 className="text-lg font-bold text-white">Store Expenses</h2>
              <p className="mt-1 text-xs text-neutral-400">
                Fuel, rent, wages, transport, and operating supplies.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange?.(true)}
            className="btn-primary px-4 py-2.5 text-xs"
          >
            <Plus className="h-4 w-4" />
            Log Store Expense
          </button>
        </div>

        {error && (
          <div className="notice mb-5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-neutral-500">
                <th className="px-3 pb-1 font-semibold">Date</th>
                <th className="px-3 pb-1 font-semibold">Category</th>
                <th className="px-3 pb-1 font-semibold">Description</th>
                <th className="px-3 pb-1 font-semibold">Recorded By</th>
                <th className="px-3 pb-1 text-right font-semibold">Amount</th>
                <th className="px-3 pb-1 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center">
                    <span className="inline-flex items-center gap-2 text-xs text-neutral-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading expenses...
                    </span>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center">
                    <p className="text-sm font-semibold text-white">
                      No expenses logged
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Record an operating cost to keep profit accurate.
                    </p>
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="bg-white/[0.03] transition hover:bg-white/[0.06]"
                  >
                    <td className="rounded-l-xl px-3 py-3 text-xs text-neutral-300">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-neutral-200">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-white">
                      {expense.description}
                    </td>
                    <td className="px-3 py-3 text-xs text-neutral-300">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5 text-neutral-500" />
                        {expense.recorded_by}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-white">
                      {formatNLe(expense.amount)}
                    </td>
                    <td className="rounded-r-xl px-3 py-3 text-right">
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(expense.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-300 transition hover:border-white/25 hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      ) : (
                        <span className="text-[11px] text-neutral-500">
                          Owner only
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      {modal}
    </>
  )
}
