import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Loader2,
  Minus,
  PackageOpen,
  Plus,
  Printer,
  ReceiptText,
  Search,
  ShoppingCart,
  Smartphone,
  Trash2,
} from 'lucide-react'
import api from '@/api/axios'
import ReceiptPreview from '@/components/receipts/ReceiptPreview'
import { useAuth } from '@/context/AuthContext'
import { useBusiness } from '@/context/BusinessContext'
import { formatNLe } from '@/utils/money'

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'orange_money', label: 'Orange Money', icon: Smartphone },
  { value: 'africell_money', label: 'Africell Money', icon: Smartphone },
]

function ReceiptModal({ receipt, onNewSale }) {
  if (!receipt) return null

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="receipt-print relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-neutral-900/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-6">
        <div className="receipt-actions mb-4 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
            Payment complete
          </p>
          <p className="text-xs text-neutral-500">{receipt.reference_no}</p>
        </div>

        <ReceiptPreview receipt={receipt} />

        <div className="receipt-actions mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary flex-1 text-xs"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
          <button
            type="button"
            onClick={onNewSale}
            className="btn-primary flex-1 text-xs"
          >
            New Sale
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PosTerminalPage() {
  const { activeBusiness, userRole, loading: businessLoading } = useBusiness()
  const { user } = useAuth()
  const searchRef = useRef(null)
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerPhone, setCustomerPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)

  const fetchProducts = useCallback(async () => {
    if (!activeBusiness?.id) return
    setLoading(true)
    try {
      const { data } = await api.get(`/businesses/${activeBusiness.id}/products`)
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load products.')
    } finally {
      setLoading(false)
    }
  }, [activeBusiness?.id])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  const categories = useMemo(
    () => ['All', ...new Set(products.map((product) => product.category))],
    [products]
  )

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory =
        category === 'All' || product.category === category
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.sku || '').toLowerCase().includes(term)
      return matchesCategory && matchesSearch
    })
  }, [products, category, search])

  const cartItems = useMemo(() => Object.values(cart), [cart])
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      ),
    [cartItems]
  )

  const addToCart = (product) => {
    setError('')
    setCart((current) => {
      const existing = current[product.id]
      if (existing && existing.quantity >= product.stock_quantity) return current
      return {
        ...current,
        [product.id]: {
          product,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      }
    })
  }

  const changeQuantity = (productId, delta) => {
    setCart((current) => {
      const item = current[productId]
      if (!item) return current
      const quantity = item.quantity + delta
      if (quantity <= 0) {
        const next = { ...current }
        delete next[productId]
        return next
      }
      if (quantity > item.product.stock_quantity) return current
      return {
        ...current,
        [productId]: { ...item, quantity },
      }
    })
  }

  const removeFromCart = (productId) => {
    setCart((current) => {
      const next = { ...current }
      delete next[productId]
      return next
    })
  }

  const handleCheckout = async () => {
    if (!cartItems.length || !activeBusiness?.id) return

    setCheckingOut(true)
    setError('')

    try {
      const { data } = await api.post(
        `/businesses/${activeBusiness.id}/sales/checkout`,
        {
          items: cartItems.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
          payment_method: paymentMethod,
          customer_phone: customerPhone.trim() || null,
        }
      )
      setReceipt(data)
      setCart({})
      setCustomerPhone('')
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not complete this sale.')
    } finally {
      setCheckingOut(false)
    }
  }

  if (!activeBusiness) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090b] px-5 text-center text-white">
        <div>
          <p className="text-lg font-bold">No active workspace</p>
          <Link to="/dashboard" className="btn-primary mt-5 text-xs">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07090b] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 px-5 py-4 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
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
                POS Terminal
              </p>
              <h1 className="text-lg font-bold text-white">
                {activeBusiness.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-neutral-400 sm:block">
              {user?.full_name || 'Cashier'}
            </span>
            {userRole === 'owner' && (
              <Link to="/receipt-settings" className="btn-secondary text-xs">
                <ReceiptText className="h-4 w-4" />
                Receipt
              </Link>
            )}
            <Link to="/inventory" className="btn-secondary text-xs">
              Inventory
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="card min-h-[calc(100vh-120px)] p-5">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              ref={searchRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products by name or SKU..."
              className="input py-4 pl-11 text-base"
            />
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  category === item
                    ? 'border-white/40 bg-white text-black'
                    : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/25 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {businessLoading || loading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-sm text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading products...
            </div>
          ) : filteredProducts.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const out = product.stock_quantity === 0
                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={out}
                    onClick={() => addToCart(product)}
                    className={`flex min-h-[140px] flex-col justify-between rounded-2xl border p-4 text-left transition ${
                      out
                        ? 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50'
                        : 'border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-neutral-500">
                        {product.category}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm font-bold text-white">
                        {product.name}
                      </p>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-2">
                      <p className="text-sm font-bold text-white">
                        {formatNLe(product.price)}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {out ? 'Out of stock' : `${product.stock_quantity} left`}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <PackageOpen className="h-7 w-7 text-neutral-300" />
              <p className="mt-3 text-sm font-semibold text-white">
                No products found
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Try another search or add stock in Inventory.
              </p>
            </div>
          )}
        </section>

        <aside className="card sticky top-24 flex max-h-[calc(100vh-120px)] flex-col p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
            <ShoppingCart className="h-5 w-5 text-neutral-300" />
            <h2 className="text-lg font-bold text-white">Current Sale</h2>
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-neutral-200">
              {cartItems.length}
            </span>
          </div>

          {error && (
            <div role="alert" className="notice mb-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {cartItems.length ? (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {item.product.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="rounded-md p-1 text-neutral-500 transition hover:bg-white/10 hover:text-white"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.product.id, -1)}
                        className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-neutral-200 transition hover:bg-white/10"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.product.id, 1)}
                        className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-neutral-200 transition hover:bg-white/10"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {formatNLe(
                        Number(item.product.price) * item.quantity
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingCart className="h-7 w-7 text-neutral-300" />
                <p className="mt-3 text-sm font-semibold text-white">
                  Cart is empty
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Click a product to add it to this sale.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-sm text-neutral-400">
              <span>Subtotal</span>
              <span className="font-semibold text-white">
                {formatNLe(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold text-white">
              <span>Total</span>
              <span>{formatNLe(subtotal)}</span>
            </div>

            <div>
              <p className="label">Payment Method</p>
              <div className="grid gap-2">
                {PAYMENT_OPTIONS.map((option) => {
                  const OptionIcon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPaymentMethod(option.value)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                        paymentMethod === option.value
                          ? 'border-white/40 bg-white/10 text-white'
                          : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/25'
                      }`}
                    >
                      <OptionIcon className="h-4 w-4 text-neutral-300" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {paymentMethod !== 'cash' && (
              <div>
                <label htmlFor="customer-phone" className="label">
                  Customer Phone (optional)
                </label>
                <input
                  id="customer-phone"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="076000000"
                  className="input py-2.5"
                />
              </div>
            )}

            <button
              type="button"
              disabled={!cartItems.length || checkingOut}
              onClick={handleCheckout}
              className="btn-shimmer inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/25 px-4 py-4 text-sm font-bold text-emerald-50 backdrop-blur transition hover:bg-emerald-400/35 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checkingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              {checkingOut
                ? 'Completing sale...'
                : `Complete Sale (${formatNLe(subtotal)})`}
            </button>
          </div>
        </aside>
      </main>

      <ReceiptModal
        receipt={receipt}
        onNewSale={() => {
          setReceipt(null)
          searchRef.current?.focus()
        }}
      />
    </div>
  )
}
