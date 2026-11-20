import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Boxes,
  Braces,
  Loader2,
  PackagePlus,
  Pencil,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react'
import api from '@/api/axios'
import Navbar from '@/components/Navbar'
import CustomAttributePills from '@/components/products/CustomAttributePills'
import { useBusiness } from '@/context/BusinessContext'
import { formatNLe } from '@/utils/money'

function ProductModal({
  open,
  businessId,
  product,
  customFields,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    name: '',
    category: 'General',
    sku: '',
    price: '',
    cost_price: '',
    stock_quantity: '',
  })
  const [attributes, setAttributes] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isEditing = Boolean(product)

  useEffect(() => {
    if (!open) return undefined

    setForm({
      name: product?.name || '',
      category: product?.category || 'General',
      sku: product?.sku || '',
      price: product ? String(product.price) : '',
      cost_price: product ? String(product.cost_price ?? 0) : '',
      stock_quantity: product ? String(product.stock_quantity) : '',
    })
    setAttributes({ ...(product?.custom_attributes || {}) })
    setError('')
  }, [open, product])

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const updateAttribute = (field) => (event) =>
    setAttributes((current) => ({
      ...current,
      [field.field_name]: event.target.value,
    }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const nextAttributes = { ...(product?.custom_attributes || {}) }

      for (const field of customFields) {
        const rawValue = attributes[field.field_name]
        const isEmpty = rawValue === undefined || rawValue === null || rawValue === ''

        if (field.is_required && isEmpty) {
          throw new Error(`${field.field_label} is required.`)
        }

        if (isEmpty) {
          delete nextAttributes[field.field_name]
          continue
        }

        nextAttributes[field.field_name] =
          field.field_type === 'number' ? Number(rawValue) : String(rawValue).trim()
      }

      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || 'General',
        sku: form.sku.trim() || null,
        price: Number(form.price),
        cost_price: form.cost_price ? Number(form.cost_price) : 0,
        stock_quantity: Number(form.stock_quantity),
        custom_attributes: nextAttributes,
      }

      const { data } = isEditing
        ? await api.put(
            `/businesses/${businessId}/products/${product.id}`,
            payload
          )
        : await api.post(`/businesses/${businessId}/products`, payload)

      onSaved(data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Could not save this product.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close product dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900/90 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-200">
              {isEditing ? (
                <Pencil className="h-5 w-5" />
              ) : (
                <PackagePlus className="h-5 w-5" />
              )}
            </span>
            <div>
              <h2 id="product-modal-title" className="text-lg font-bold text-white">
                {isEditing ? 'Edit Product' : 'Add Product'}
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                {isEditing
                  ? 'Update product details and custom values.'
                  : 'Stock items for this store workspace.'}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="product-name" className="label">
              Product Name
            </label>
            <input
              id="product-name"
              className="input"
              value={form.name}
              onChange={update('name')}
              placeholder="Royal Rice (25kg Bag)"
              minLength={2}
              required
            />
          </div>
          <div>
            <label htmlFor="product-category" className="label">
              Category
            </label>
            <input
              id="product-category"
              className="input"
              value={form.category}
              onChange={update('category')}
              placeholder="Food & Grains"
            />
          </div>
          <div>
            <label htmlFor="product-sku" className="label">
              SKU
            </label>
            <input
              id="product-sku"
              className="input"
              value={form.sku}
              onChange={update('sku')}
              placeholder="RICE-25KG"
            />
          </div>
          <div>
            <label htmlFor="product-price" className="label">
              Sale Price (NLe)
            </label>
            <input
              id="product-price"
              type="number"
              step="0.01"
              min="0.01"
              className="input"
              value={form.price}
              onChange={update('price')}
              placeholder="480.00"
              required
            />
          </div>
          <div>
            <label htmlFor="product-cost" className="label">
              Cost Price (NLe)
            </label>
            <input
              id="product-cost"
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={form.cost_price}
              onChange={update('cost_price')}
              placeholder="420.00"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="product-stock" className="label">
              Stock Quantity
            </label>
            <input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              className="input"
              value={form.stock_quantity}
              onChange={update('stock_quantity')}
              placeholder="25"
              required
            />
          </div>

          {customFields.length > 0 && (
            <div className="sm:col-span-2 border-t border-white/10 pt-4">
              <div className="mb-4 flex items-center gap-2">
                <Braces className="h-4 w-4 text-neutral-300" />
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Industry Fields
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {customFields.map((field) => (
                  <div key={field.id}>
                    <label
                      htmlFor={`product-custom-${field.field_name}`}
                      className="label"
                    >
                      {field.field_label}
                      {field.is_required && (
                        <span className="ml-1 text-neutral-300">*</span>
                      )}
                    </label>
                    <input
                      id={`product-custom-${field.field_name}`}
                      className="input"
                      type={field.field_type === 'number' ? 'number' : 'text'}
                      step={field.field_type === 'number' ? 'any' : undefined}
                      value={attributes[field.field_name] ?? ''}
                      onChange={updateAttribute(field)}
                      placeholder={field.field_type === 'number' ? '0' : 'Enter value'}
                      required={field.is_required}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2.5 text-xs">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary px-4 py-2.5 text-xs"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEditing ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <PackagePlus className="h-4 w-4" />
            )}
            {submitting
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function InventoryPage() {
  const { activeBusiness, userRole, loading: businessLoading } = useBusiness()
  const [products, setProducts] = useState([])
  const [customFields, setCustomFields] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const canManageProducts = userRole === 'owner' || userRole === 'manager'

  useEffect(() => {
    if (!activeBusiness?.id) return undefined

    let active = true
    setLoading(true)
    setError('')

    const timer = setTimeout(() => {
      api
        .get(`/businesses/${activeBusiness.id}/products`, {
          params: search.trim() ? { search: search.trim() } : {},
        })
        .then(({ data }) => {
          if (active) setProducts(Array.isArray(data) ? data : [])
        })
        .catch((err) => {
          if (active) {
            setError(err.response?.data?.detail || 'Could not load inventory.')
          }
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, search.trim() ? 200 : 0)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [activeBusiness?.id, search])

  useEffect(() => {
    if (!activeBusiness?.id) return undefined

    let active = true
    api
      .get(`/businesses/${activeBusiness.id}/custom-fields`)
      .then(({ data }) => {
        if (active) setCustomFields(Array.isArray(data) ? data : [])
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [activeBusiness?.id])

  const stats = useMemo(
    () => ({
      products: products.length,
      units: products.reduce((sum, item) => sum + item.stock_quantity, 0),
      lowStock: products.filter(
        (item) => item.stock_quantity <= item.low_stock_threshold
      ).length,
    }),
    [products]
  )

  const handleSaved = useCallback((product) => {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id)
      return exists
        ? current.map((item) => (item.id === product.id ? product : item))
        : [product, ...current]
    })
    setModalOpen(false)
    setEditingProduct(null)
    setSearch('')
  }, [])

  const openAddModal = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#07090b] text-white">
      <Navbar onOpenCreate={() => {}} />
      <main className="mx-auto max-w-7xl px-5 pb-28 pt-24 md:pb-16 md:pt-32">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to workspace
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300">
              {activeBusiness?.name || 'Store workspace'}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Inventory
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Products, prices, and stock levels for this store.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/pos" className="btn-secondary text-xs">
              Open POS Terminal
            </Link>
            {canManageProducts && (
              <button
                type="button"
                onClick={openAddModal}
                className="btn-primary text-xs"
              >
                <PackagePlus className="h-4 w-4" />
                Add Product
              </button>
            )}
          </div>
        </div>

        {error && (
          <div role="alert" className="notice mb-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            ['Products', stats.products],
            ['Units in stock', stats.units],
            ['Low stock alerts', stats.lowStock],
          ].map(([label, value]) => (
            <div key={label} className="card p-5">
              <p className="text-[11px] uppercase tracking-wider text-neutral-500">
                {label}
              </p>
              <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        <section className="card overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-neutral-300" />
              <h2 className="text-lg font-bold text-white">Product Catalogue</h2>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or SKU..."
                className="input pl-10"
              />
            </div>
          </div>

          {businessLoading || loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading inventory...
            </div>
          ) : products.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold">SKU</th>
                    <th className="px-5 py-3 font-semibold">Price</th>
                    <th className="px-5 py-3 font-semibold">Stock</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    {canManageProducts && (
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => {
                    const out = product.stock_quantity === 0
                    const low =
                      !out &&
                      product.stock_quantity <= product.low_stock_threshold
                    return (
                      <tr key={product.id} className="transition hover:bg-white/[0.03]">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{product.name}</p>
                          <p className="mt-0.5 text-xs text-neutral-400">
                            {product.category}
                          </p>
                          <CustomAttributePills
                            attributes={product.custom_attributes}
                            fields={customFields}
                            className="mt-2"
                          />
                        </td>
                        <td className="px-5 py-4 text-xs text-neutral-400">
                          {product.sku || '—'}
                        </td>
                        <td className="px-5 py-4 font-semibold text-white">
                          {formatNLe(product.price)}
                        </td>
                        <td className="px-5 py-4 text-white">
                          {product.stock_quantity}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                              out
                                ? 'border-red-400/30 bg-red-400/10 text-red-200'
                                : low
                                  ? 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                                  : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                            }`}
                          >
                            {low || out ? (
                              <TriangleAlert className="h-3 w-3" />
                            ) : null}
                            {out ? 'Out of stock' : low ? 'Low stock' : 'In stock'}
                          </span>
                        </td>
                        {canManageProducts && (
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-neutral-300 transition hover:border-white/25 hover:text-white"
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Boxes className="mx-auto h-6 w-6 text-neutral-200" />
              <p className="mt-3 text-sm font-semibold text-white">
                No products found
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Add a product or try a different search.
              </p>
            </div>
          )}
        </section>
      </main>

      <ProductModal
        open={modalOpen}
        businessId={activeBusiness?.id}
        product={editingProduct}
        customFields={customFields}
        onClose={() => {
          setModalOpen(false)
          setEditingProduct(null)
        }}
        onSaved={handleSaved}
      />
    </div>
  )
}
