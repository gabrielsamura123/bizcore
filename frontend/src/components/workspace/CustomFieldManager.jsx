import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  Braces,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import api from '@/api/axios'

const EMPTY_FORM = {
  field_label: '',
  field_type: 'text',
  is_required: false,
}

export default function CustomFieldManager({
  businessId,
  canDelete = false,
  disabled = false,
}) {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadFields = useCallback(() => {
    if (!businessId) return undefined

    let active = true
    setLoading(true)
    setError('')

    api
      .get(`/businesses/${businessId}/custom-fields`)
      .then(({ data }) => {
        if (active) setFields(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.detail || 'Could not load custom fields.'
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [businessId])

  useEffect(() => loadFields(), [loadFields])

  useEffect(() => {
    if (!modalOpen) return
    setForm(EMPTY_FORM)
    setFormError('')
  }, [modalOpen])

  const handleCreate = async (event) => {
    event.preventDefault()
    setFormError('')

    if (form.field_label.trim().length < 2) {
      setFormError('Enter a label with at least 2 characters.')
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/businesses/${businessId}/custom-fields`, {
        field_label: form.field_label.trim(),
        field_type: form.field_type,
        is_required: form.is_required,
      })
      loadFields()
      setModalOpen(false)
    } catch (err) {
      setFormError(
        err.response?.data?.detail || 'Could not add this custom field.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (fieldId) => {
    try {
      await api.delete(`/businesses/${businessId}/custom-fields/${fieldId}`)
      loadFields()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete this field.')
    }
  }

  return (
    <section className="card mt-6 p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Braces className="h-5 w-5 text-neutral-300" />
          <div>
            <h3 className="text-base font-bold text-white">
              Product Custom Fields
            </h3>
            <p className="mt-1 text-xs text-neutral-400">
              Extend product records for this industry.
            </p>
          </div>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-secondary px-4 py-2.5 text-xs"
          >
            <Plus className="h-4 w-4" />
            Add Custom Field
          </button>
        )}
      </div>

      {error && (
        <div className="notice mb-5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading custom fields...
        </div>
      ) : fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
          <p className="text-sm font-semibold text-white">
            No custom fields yet
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Add fields like IMEI, batch number, or warranty period.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {field.field_label}
                </p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-neutral-500">
                  {field.field_name}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-400">
                    {field.field_type}
                  </span>
                  {field.is_required && (
                    <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                      Required
                    </span>
                  )}
                </div>
              </div>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(field.id)}
                  className="rounded-lg border border-white/10 p-2 text-neutral-400 transition hover:border-white/25 hover:text-white"
                  aria-label={`Delete ${field.field_label}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close custom field dialog"
            onClick={() => setModalOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <form
            onSubmit={handleCreate}
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-field-title"
            className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900/95 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-200">
                  <Braces className="h-5 w-5" />
                </span>
                <div>
                  <h2
                    id="custom-field-title"
                    className="text-lg font-bold text-white"
                  >
                    Add Custom Field
                  </h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    Field names are generated automatically from the label.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
                <label htmlFor="custom-label" className="label">
                  Field Label
                </label>
                <input
                  id="custom-label"
                  className="input"
                  value={form.field_label}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      field_label: event.target.value,
                    }))
                  }
                  placeholder="e.g. Warranty (Months)"
                  minLength={2}
                  required
                />
              </div>

              <div>
                <label htmlFor="custom-type" className="label">
                  Type
                </label>
                <select
                  id="custom-type"
                  className="input"
                  value={form.field_type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      field_type: event.target.value,
                    }))
                  }
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                </select>
              </div>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm font-semibold text-neutral-200">
                  Required field
                </span>
                <input
                  type="checkbox"
                  checked={form.is_required}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      is_required: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-white"
                />
              </label>
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
                Save Field
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-secondary flex-1 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
