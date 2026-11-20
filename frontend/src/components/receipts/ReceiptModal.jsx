import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Download,
  Loader2,
  Printer,
  ReceiptText,
  X,
} from 'lucide-react'
import { formatNLe, formatReceiptDateTime } from '@/utils/money'
import { PAYMENT_LABELS } from '@/utils/receipt'
import { downloadReceiptPdf } from '@/utils/receiptPdf'

const DIVIDER = '-------------------------------------------'

function humanizeField(name) {
  return name.replace(/_/g, ' ')
}

function formatAttributes(item, labels) {
  const attributes = item.custom_attributes || {}
  return Object.entries(attributes)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([name, value]) => `${labels[name] || humanizeField(name)}: ${value}`)
}

function ThermalReceipt({ receipt }) {
  const settings = receipt.settings || {}
  const labels = settings.custom_field_labels || {}
  const businessName =
    settings.business_name || receipt.business_name || 'BizCore SL'
  const industry = settings.business_industry || ''
  const address = settings.business_address || settings.address_line || ''
  const phone = settings.business_phone || settings.phone_line || ''
  const payment = (
    PAYMENT_LABELS[receipt.payment_method] || receipt.payment_method || 'cash'
  ).toUpperCase()

  return (
    <div id="thermal-receipt-printable" className="thermal-receipt">
      <img
        src="/bizcore-icon.svg"
        alt="BizCore SL logo"
        className="thermal-logo"
      />
      <p className="thermal-business">{businessName}</p>
      {industry && <p className="thermal-center">{industry}</p>}
      {address && <p className="thermal-center">{address}</p>}
      {phone && <p className="thermal-center">{phone}</p>}

      <p className="thermal-divider">{DIVIDER}</p>
      <div className="thermal-meta">
        <span>REF</span>
        <span>{receipt.reference_no}</span>
      </div>
      <div className="thermal-meta">
        <span>DATE &amp; TIME</span>
        <span>{formatReceiptDateTime(receipt.created_at)}</span>
      </div>
      <div className="thermal-meta">
        <span>CASHIER</span>
        <span>{receipt.cashier_name || 'Cashier'}</span>
      </div>
      <p className="thermal-divider">{DIVIDER}</p>

      <div className="thermal-items">
        {(receipt.items || []).map((item, index) => {
          const attributes = formatAttributes(item, labels)
          return (
            <div key={`${item.product_name}-${index}`} className="thermal-item">
              <div className="thermal-item-line">
                <span className="thermal-item-name">
                  {item.quantity} x {item.product_name}
                </span>
                <span className="thermal-dots" />
                <span className="thermal-item-price">
                  {formatNLe(item.subtotal)}
                </span>
              </div>
              {attributes.length > 0 && (
                <p className="thermal-attributes">{attributes.join(' | ')}</p>
              )}
            </div>
          )
        })}
      </div>

      <p className="thermal-divider">{DIVIDER}</p>
      <div className="thermal-meta">
        <span>Subtotal</span>
        <span>{formatNLe(receipt.subtotal)}</span>
      </div>
      <div className="thermal-total">
        <span>TOTAL</span>
        <span>{formatNLe(receipt.total)}</span>
      </div>
      <div className="thermal-meta">
        <span>Payment Method</span>
        <span>{payment}</span>
      </div>
      {receipt.customer_phone && (
        <div className="thermal-meta">
          <span>Phone</span>
          <span>{receipt.customer_phone}</span>
        </div>
      )}

      <p className="thermal-divider">{DIVIDER}</p>
      <p className="thermal-footer">Thank you for your business!</p>
      <p className="thermal-center">Powered by BizCore SL</p>
    </div>
  )
}

export default function ReceiptModal({
  receipt,
  loading,
  error,
  onClose,
  onNewSale,
}) {
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    setDownloadError('')
  }, [receipt])

  if (!receipt && !loading && !error) return null

  const handleDownload = async () => {
    if (!receipt || downloading) return
    setDownloading(true)
    setDownloadError('')
    try {
      await downloadReceiptPdf(receipt)
    } catch (err) {
      setDownloadError(err.message || 'Could not download this receipt.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close receipt"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div className="receipt-modal-shell relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-neutral-900/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-6">
        <div className="receipt-actions mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-neutral-300" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Receipt preview
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

        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading receipt...
          </div>
        )}

        {error && !loading && (
          <div className="notice">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {downloadError && (
          <div role="alert" className="notice mt-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}

        {receipt && !loading && <ThermalReceipt receipt={receipt} />}

        {receipt && !loading && (
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
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary flex-1 text-xs disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloading ? 'Preparing PDF...' : 'Download PDF'}
            </button>
          </div>
        )}

        {!onNewSale && !loading && (
          <div className="receipt-actions mt-2">
            <button type="button" onClick={onClose} className="btn-secondary w-full text-xs">
              Done
            </button>
          </div>
        )}

        {onNewSale && !loading && (
          <div className="receipt-actions mt-2">
            <button
              type="button"
              onClick={onNewSale}
              className="btn-secondary w-full text-xs"
            >
              New Sale
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
