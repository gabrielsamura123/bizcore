import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ReceiptText,
} from 'lucide-react'
import api from '@/api/axios'
import ReceiptModal from '@/components/receipts/ReceiptModal'
import { formatReceiptDateTime } from '@/utils/money'
import { formatNLe } from '@/utils/money'
import { PAYMENT_LABELS } from '@/utils/receipt'

const PAYMENT_STYLES = {
  cash: 'border-emerald-300/25 bg-emerald-400/10 text-emerald-200',
  orange_money: 'border-amber-300/25 bg-amber-400/10 text-amber-200',
  africell_money: 'border-sky-300/25 bg-sky-400/10 text-sky-200',
}

function PaymentBadge({ method }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        PAYMENT_STYLES[method] || 'border-white/10 bg-white/5 text-neutral-300'
      }`}
    >
      {PAYMENT_LABELS[method] || method}
    </span>
  )
}

export default function SalesHistory({ businessId }) {
  const [sales, setSales] = useState([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [receiptLoading, setReceiptLoading] = useState(false)
  const [receiptError, setReceiptError] = useState('')

  useEffect(() => {
    setPage(1)
  }, [businessId])

  const loadSales = useCallback(() => {
    if (!businessId) return undefined

    let active = true
    setLoading(true)
    setError('')

    api
      .get(`/businesses/${businessId}/sales`, {
        params: { page, page_size: 10 },
      })
      .then(({ data }) => {
        if (!active) return
        setSales(Array.isArray(data?.items) ? data.items : [])
        setPagination({
          total: Number(data?.total || 0),
          total_pages: Number(data?.total_pages || 1),
        })
      })
      .catch((err) => {
        if (!active) return
        setError(
          err.response?.data?.detail || 'Could not load sales history.'
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [businessId, page])

  useEffect(() => loadSales(), [loadSales])

  const openReceipt = async (saleId) => {
    setReceipt(null)
    setReceiptError('')
    setReceiptLoading(true)
    try {
      const { data } = await api.get(
        `/businesses/${businessId}/sales/${saleId}`
      )
      setReceipt(data)
    } catch (err) {
      setReceiptError(
        err.response?.data?.detail || 'Could not load this receipt.'
      )
    } finally {
      setReceiptLoading(false)
    }
  }

  const closeReceipt = () => {
    setReceipt(null)
    setReceiptError('')
    setReceiptLoading(false)
  }

  return (
    <section className="card p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-5 w-5 text-neutral-300" />
          <div>
            <h2 className="text-lg font-bold text-white">Sales History</h2>
            <p className="mt-1 text-xs text-neutral-400">
              {pagination.total} transaction
              {pagination.total === 1 ? '' : 's'} recorded
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-neutral-300">
          Page {page} of {pagination.total_pages}
        </span>
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
              <th className="px-3 pb-1 font-semibold">Reference</th>
              <th className="px-3 pb-1 font-semibold">Date & Time</th>
              <th className="px-3 pb-1 font-semibold">Cashier</th>
              <th className="px-3 pb-1 font-semibold">Payment</th>
              <th className="px-3 pb-1 font-semibold">Items</th>
              <th className="px-3 pb-1 text-right font-semibold">Total</th>
              <th className="px-3 pb-1 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center">
                  <span className="inline-flex items-center gap-2 text-xs text-neutral-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading sales...
                  </span>
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center">
                  <p className="text-sm font-semibold text-white">
                    No sales yet
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Completed transactions will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="bg-white/[0.03] transition hover:bg-white/[0.06]"
                >
                  <td className="rounded-l-xl px-3 py-3 font-mono text-xs font-semibold text-white">
                    {sale.reference_no}
                  </td>
                  <td className="px-3 py-3 text-xs text-neutral-300">
                    {formatReceiptDateTime(sale.created_at)}
                  </td>
                  <td className="px-3 py-3 text-xs font-semibold text-neutral-200">
                    {sale.cashier_name}
                  </td>
                  <td className="px-3 py-3">
                    <PaymentBadge method={sale.payment_method} />
                  </td>
                  <td className="px-3 py-3 text-xs text-neutral-300">
                    {sale.item_count}
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-white">
                    {formatNLe(sale.total)}
                  </td>
                  <td className="rounded-r-xl px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openReceipt(sale.id)}
                      className="btn-secondary px-3 py-2 text-[11px]"
                    >
                      <ReceiptText className="h-3.5 w-3.5" />
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.total_pages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="btn-secondary px-3 py-2 text-xs disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-xs text-neutral-400">
            {pagination.total} total
          </span>
          <button
            type="button"
            disabled={page >= pagination.total_pages}
            onClick={() =>
              setPage((current) =>
                Math.min(pagination.total_pages, current + 1)
              )
            }
            className="btn-secondary px-3 py-2 text-xs disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <ReceiptModal
        receipt={receipt}
        loading={receiptLoading}
        error={receiptError}
        onClose={closeReceipt}
      />
    </section>
  )
}
