import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  ReceiptText,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import api from '@/api/axios'
import ReceiptPreview, { createSampleReceipt } from '@/components/receipts/ReceiptPreview'
import { useAuth } from '@/context/AuthContext'
import { useBusiness } from '@/context/BusinessContext'
import {
  DEFAULT_RECEIPT_SETTINGS,
  getReceiptConfig,
} from '@/utils/receipt'
import { resolveUploadUrl } from '@/utils/upload'

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-neutral-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
          checked
            ? 'border-white/50 bg-white'
            : 'border-white/15 bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
            checked ? 'left-[22px] bg-black' : 'left-0.5 bg-neutral-300'
          }`}
        />
      </button>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder, multiline = false }) {
  const shared = {
    value: value || '',
    onChange: (event) => onChange(event.target.value || null),
    placeholder,
    className: 'input py-2.5',
  }

  return (
    <label className="block">
      <span className="label">{label}</span>
      {multiline ? (
        <textarea {...shared} rows={2} className="input resize-none py-2.5" />
      ) : (
        <input {...shared} />
      )}
    </label>
  )
}

export default function ReceiptSettingsPage() {
  const { activeBusiness, userRole, loading: businessLoading } = useBusiness()
  const { user } = useAuth()
  const fileRef = useRef(null)
  const [form, setForm] = useState(() => getReceiptConfig(null))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!activeBusiness?.id) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError('')

    api
      .get(`/businesses/${activeBusiness.id}/receipt-settings`)
      .then(({ data }) => {
        if (!active) return
        const settings = getReceiptConfig(data)
        setForm({
          ...settings,
          address_line: settings.address_line ?? activeBusiness.address ?? null,
          phone_line: settings.phone_line ?? activeBusiness.phone ?? null,
        })
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.detail || 'Could not load receipt settings.'
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [activeBusiness?.id, activeBusiness?.address, activeBusiness?.phone])

  const previewReceipt = useMemo(
    () => createSampleReceipt(activeBusiness?.name, user?.full_name),
    [activeBusiness?.name, user?.full_name]
  )

  const previewSettings = useMemo(
    () => ({
      ...form,
      business_name: activeBusiness?.name || form.business_name,
      business_phone: activeBusiness?.phone || form.business_phone,
    }),
    [form, activeBusiness?.name, activeBusiness?.phone]
  )

  const update = (field, value) => {
    setSuccess('')
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async () => {
    if (!activeBusiness?.id) return

    setSaving(true)
    setError('')
    setSuccess('')

    const payload = {
      header_text: form.header_text?.trim() || null,
      footer_text: form.footer_text?.trim() || null,
      address_line: form.address_line?.trim() || null,
      phone_line: form.phone_line?.trim() || null,
      email_line: form.email_line?.trim() || null,
      website_line: form.website_line?.trim() || null,
      logo_width: Number(form.logo_width) || 96,
      paper_size: form.paper_size,
      show_logo: form.show_logo,
      show_header: form.show_header,
      show_business_name: form.show_business_name,
      show_address: form.show_address,
      show_phone: form.show_phone,
      show_email: form.show_email,
      show_website: form.show_website,
      show_reference: form.show_reference,
      show_datetime: form.show_datetime,
      show_cashier: form.show_cashier,
      show_payment_method: form.show_payment_method,
      show_customer_phone: form.show_customer_phone,
      show_items: form.show_items,
      show_subtotal: form.show_subtotal,
      show_total: form.show_total,
      show_footer: form.show_footer,
      show_powered_by: form.show_powered_by,
    }

    try {
      const { data } = await api.put(
        `/businesses/${activeBusiness.id}/receipt-settings`,
        payload
      )
      setForm(getReceiptConfig(data))
      setSuccess('Receipt layout saved. New sales will use this design.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save receipt settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !activeBusiness?.id) return

    setUploading(true)
    setError('')
    setSuccess('')

    const data = new FormData()
    data.append('file', file)

    try {
      const response = await api.post(
        `/businesses/${activeBusiness.id}/receipt-settings/logo`,
        data,
        { headers: { 'Content-Type': undefined } }
      )
      setForm((current) => ({
        ...current,
        ...getReceiptConfig(response.data),
      }))
      setSuccess('Logo uploaded. Save to keep the rest of your layout changes.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not upload logo.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleLogoRemove = async () => {
    if (!activeBusiness?.id) return

    setUploading(true)
    setError('')

    try {
      const { data } = await api.delete(
        `/businesses/${activeBusiness.id}/receipt-settings/logo`
      )
      setForm((current) => ({ ...current, ...getReceiptConfig(data) }))
      setSuccess('Logo removed from receipts.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not remove logo.')
    } finally {
      setUploading(false)
    }
  }

  const handleRestoreDefaults = () => {
    setForm((current) => ({
      ...getReceiptConfig(DEFAULT_RECEIPT_SETTINGS),
      business_name: activeBusiness?.name || '',
      address_line: activeBusiness?.address ?? null,
      phone_line: activeBusiness?.phone ?? null,
      logo_url: current.logo_url,
      logo_path: current.logo_path,
      logo_width: current.logo_width,
    }))
    setSuccess('')
  }

  if (userRole !== 'owner') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090b] px-5 text-center text-white">
        <div className="card max-w-md p-8">
          <ReceiptText className="mx-auto h-7 w-7 text-neutral-300" />
          <h1 className="mt-4 text-lg font-bold">Owner access required</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Only the workspace owner can change receipt branding and layout.
          </p>
          <Link to="/dashboard" className="btn-primary mt-6 text-xs">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07090b] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 px-5 py-4 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="rounded-lg p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Store settings
              </p>
              <h1 className="text-lg font-bold text-white">Receipt Designer</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-shimmer inline-flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/20 px-4 py-2.5 text-xs font-bold text-emerald-100 transition hover:bg-emerald-400/30 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save layout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-5">
        {error && (
          <div role="alert" className="notice mb-5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="notice mb-5 border-emerald-400/30 bg-emerald-400/10 text-emerald-100">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {businessLoading || loading ? (
          <div className="card flex items-center justify-center gap-2 p-12 text-sm text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading receipt settings...
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-5">
              <section className="card p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-5 w-5 text-neutral-300" />
                    <div>
                      <h2 className="text-base font-bold text-white">Branding</h2>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        Logo, contact details, and paper size.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRestoreDefaults}
                    className="btn-secondary text-xs"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Defaults
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                        {form.logo_url ? (
                          <img
                            src={resolveUploadUrl(form.logo_url)}
                            alt="Receipt logo"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <ImagePlus className="h-6 w-6 text-neutral-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                          Receipt logo
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                          PNG, JPEG, or WEBP up to 2MB. It appears above the
                          business name when enabled.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={uploading}
                            onClick={() => fileRef.current?.click()}
                            className="btn-secondary text-xs"
                          >
                            <Upload className="h-4 w-4" />
                            Upload logo
                          </button>
                          {form.logo_url && (
                            <button
                              type="button"
                              disabled={uploading}
                              onClick={handleLogoRemove}
                              className="btn-secondary text-xs text-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <TextField
                    label="Header text"
                    value={form.header_text}
                    onChange={(value) => update('header_text', value)}
                    placeholder="Welcome to our store"
                  />
                  <TextField
                    label="Footer text"
                    value={form.footer_text}
                    onChange={(value) => update('footer_text', value)}
                    placeholder="Thank you for shopping with us"
                  />
                  <TextField
                    label="Address"
                    value={form.address_line}
                    onChange={(value) => update('address_line', value)}
                    placeholder="12 Main Road, Freetown"
                  />
                  <TextField
                    label="Phone"
                    value={form.phone_line}
                    onChange={(value) => update('phone_line', value)}
                    placeholder="076000000"
                  />
                  <TextField
                    label="Email"
                    value={form.email_line}
                    onChange={(value) => update('email_line', value)}
                    placeholder="hello@business.sl"
                  />
                  <TextField
                    label="Website"
                    value={form.website_line}
                    onChange={(value) => update('website_line', value)}
                    placeholder="www.business.sl"
                  />

                  <label className="block">
                    <span className="label">Paper size</span>
                    <select
                      value={form.paper_size}
                      onChange={(event) => update('paper_size', event.target.value)}
                      className="input py-2.5"
                    >
                      <option value="58mm">58mm thermal</option>
                      <option value="80mm">80mm thermal</option>
                      <option value="a4">A4 sheet</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="label">
                      Logo width: {form.logo_width}px
                    </span>
                    <input
                      type="range"
                      min="48"
                      max="240"
                      value={form.logo_width}
                      onChange={(event) =>
                        update('logo_width', Number(event.target.value))
                      }
                      className="mt-3 w-full accent-white"
                    />
                  </label>
                </div>
              </section>

              <section className="card p-5">
                <div className="mb-5">
                  <h2 className="text-base font-bold text-white">
                    Receipt contents
                  </h2>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Switch anything on or off. The preview updates instantly.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="label mb-2">Header & business details</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <ToggleRow
                        label="Logo"
                        checked={form.show_logo}
                        onChange={(value) => update('show_logo', value)}
                      />
                      <ToggleRow
                        label="Header text"
                        checked={form.show_header}
                        onChange={(value) => update('show_header', value)}
                      />
                      <ToggleRow
                        label="Business name"
                        checked={form.show_business_name}
                        onChange={(value) => update('show_business_name', value)}
                      />
                      <ToggleRow
                        label="Address"
                        checked={form.show_address}
                        onChange={(value) => update('show_address', value)}
                      />
                      <ToggleRow
                        label="Phone"
                        checked={form.show_phone}
                        onChange={(value) => update('show_phone', value)}
                      />
                      <ToggleRow
                        label="Email"
                        checked={form.show_email}
                        onChange={(value) => update('show_email', value)}
                      />
                      <ToggleRow
                        label="Website"
                        checked={form.show_website}
                        onChange={(value) => update('show_website', value)}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="label mb-2">Sale details</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <ToggleRow
                        label="Receipt number"
                        checked={form.show_reference}
                        onChange={(value) => update('show_reference', value)}
                      />
                      <ToggleRow
                        label="Date and time"
                        checked={form.show_datetime}
                        onChange={(value) => update('show_datetime', value)}
                      />
                      <ToggleRow
                        label="Item list"
                        checked={form.show_items}
                        onChange={(value) => update('show_items', value)}
                      />
                      <ToggleRow
                        label="Subtotal"
                        checked={form.show_subtotal}
                        onChange={(value) => update('show_subtotal', value)}
                      />
                      <ToggleRow
                        label="Total paid"
                        checked={form.show_total}
                        onChange={(value) => update('show_total', value)}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="label mb-2">Footer details</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <ToggleRow
                        label="Cashier name"
                        checked={form.show_cashier}
                        onChange={(value) => update('show_cashier', value)}
                      />
                      <ToggleRow
                        label="Payment method"
                        checked={form.show_payment_method}
                        onChange={(value) => update('show_payment_method', value)}
                      />
                      <ToggleRow
                        label="Customer phone"
                        checked={form.show_customer_phone}
                        onChange={(value) => update('show_customer_phone', value)}
                      />
                      <ToggleRow
                        label="Footer message"
                        checked={form.show_footer}
                        onChange={(value) => update('show_footer', value)}
                      />
                      <ToggleRow
                        label="Powered by BizCore"
                        checked={form.show_powered_by}
                        onChange={(value) => update('show_powered_by', value)}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="card sticky top-24 h-fit p-5">
              <div className="mb-4 flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-neutral-300" />
                <div>
                  <h2 className="text-base font-bold text-white">Live preview</h2>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    This is what prints after checkout.
                  </p>
                </div>
              </div>
              <div className="flex justify-center rounded-2xl bg-black/40 p-4">
                <ReceiptPreview
                  receipt={previewReceipt}
                  settings={previewSettings}
                />
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
