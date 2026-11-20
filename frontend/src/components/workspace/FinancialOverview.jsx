import { Link } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  Boxes,
  CreditCard,
  Loader2,
  Plus,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { formatNLe } from '@/utils/money'
import { PAYMENT_LABELS } from '@/utils/receipt'

function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {label}
          </p>
          <p className="mt-3 text-xl font-bold tracking-tight text-white">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">{detail}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-200">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  )
}

function PaymentSplit({ breakdown }) {
  const methods = ['cash', 'orange_money', 'africell_money'].map((method) => ({
    method,
    amount: Number(breakdown?.[method] || 0),
  }))
  const total = methods.reduce((sum, item) => sum + item.amount, 0)

  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-neutral-300" />
        <div>
          <h2 className="text-base font-bold text-white">
            Payment Method Split
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            How today's sales were paid
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {methods.map(({ method, amount }) => {
          const width = total > 0 ? Math.max(3, (amount / total) * 100) : 0
          return (
            <div key={method}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-neutral-200">
                  {PAYMENT_LABELS[method]}
                </span>
                <span className="font-bold text-white">
                  {formatNLe(amount)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-white/60"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function FinancialOverview({
  summary,
  loading = false,
  error = '',
  showFinancials = false,
  canLogExpense = false,
  canManageInventory = false,
  canDesignReceipt = false,
  onLogExpense,
}) {
  return (
    <div className="mb-6 space-y-4">
      {showFinancials && (
        <>
          {loading && !summary ? (
            <div className="card flex items-center justify-center gap-2 p-10 text-sm text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading financial summary...
            </div>
          ) : error && !summary ? (
            <div className="notice">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Today's Revenue"
                  value={formatNLe(summary?.gross_revenue || 0)}
                  detail={`${summary?.sales_count || 0} transactions`}
                  icon={TrendingUp}
                />
                <StatCard
                  label="Net Profit"
                  value={formatNLe(summary?.net_profit || 0)}
                  detail="Gross profit minus expenses"
                  icon={Banknote}
                />
                <StatCard
                  label="Total Expenses"
                  value={formatNLe(summary?.total_expenses || 0)}
                  detail="Recorded today"
                  icon={Banknote}
                />
                <StatCard
                  label="Low Stock Alerts"
                  value={String(summary?.low_stock_count || 0)}
                  detail="Items at or below threshold"
                  icon={AlertTriangle}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <PaymentSplit breakdown={summary?.payment_breakdown} />
                </div>
                <section className="card p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-neutral-300" />
                    <h2 className="text-base font-bold text-white">
                      Top Selling Items
                    </h2>
                  </div>
                  {(summary?.top_selling_products || []).length === 0 ? (
                    <p className="py-6 text-center text-xs text-neutral-400">
                      No sales recorded today yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {summary.top_selling_products.map((product, index) => (
                        <div
                          key={product.product_name}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[11px] font-bold text-neutral-200">
                              {index + 1}
                            </span>
                            <span className="truncate text-xs font-semibold text-white">
                              {product.product_name}
                            </span>
                          </div>
                          <span className="shrink-0 text-xs font-bold text-neutral-200">
                            {product.quantity_sold} sold
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </>
      )}

      <section className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-neutral-300" />
          <h2 className="text-base font-bold text-white">Quick actions</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/pos"
            className="btn-shimmer inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/20 px-5 py-3.5 text-sm font-bold text-emerald-100 backdrop-blur transition hover:bg-emerald-400/30"
          >
            <ShoppingCart className="h-4 w-4" />
            Open POS Terminal
          </Link>
          {canLogExpense && (
            <button
              type="button"
              onClick={onLogExpense}
              className="btn-secondary flex-1 text-sm font-bold"
            >
              <Plus className="h-4 w-4" />
              Log Expense
            </button>
          )}
          {canManageInventory && (
            <Link
              to="/inventory"
              className="btn-secondary flex-1 text-sm font-bold"
            >
              <Boxes className="h-4 w-4" />
              Inventory
            </Link>
          )}
          {canDesignReceipt && (
            <Link
              to="/receipt-settings"
              className="btn-secondary flex-1 text-sm font-bold"
            >
              <ReceiptText className="h-4 w-4" />
              Design Receipt
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
