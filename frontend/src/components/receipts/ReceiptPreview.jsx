import { formatNLe, formatReceiptDateTime } from '@/utils/money'
import { getReceiptConfig, PAYMENT_LABELS } from '@/utils/receipt'
import { resolveUploadUrl } from '@/utils/upload'

export function createSampleReceipt(businessName, cashierName) {
  return {
    id: 0,
    reference_no: 'REC-0001',
    business_name: businessName || 'Your Business',
    cashier_name: cashierName || 'Cashier',
    items: [
      {
        product_name: 'Royal Rice (25kg Bag)',
        quantity: 1,
        unit_price: 480,
        subtotal: 480,
      },
      {
        product_name: 'Peak Powdered Milk (400g)',
        quantity: 2,
        unit_price: 65,
        subtotal: 130,
      },
    ],
    subtotal: 610,
    total: 610,
    payment_method: 'orange_money',
    customer_phone: '076000000',
    created_at: new Date().toISOString(),
  }
}

function MetaRow({ label, value }) {
  if (!value) return null

  return (
    <div className="receipt-meta-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

export default function ReceiptPreview({ receipt, settings }) {
  const config = getReceiptConfig(settings || receipt?.settings)
  const data = receipt || createSampleReceipt()
  const logoUrl = resolveUploadUrl(config.logo_url)

  return (
    <div className={`receipt-paper paper-${config.paper_size}`}>
      {config.show_logo && logoUrl && (
        <img
          src={logoUrl}
          alt="Business logo"
          style={{ width: `${config.logo_width}px` }}
          className="mx-auto mb-3 h-auto max-w-full object-contain"
        />
      )}

      {config.show_header && config.header_text && (
        <p className="receipt-header">{config.header_text}</p>
      )}

      {config.show_business_name && (
        <p className="receipt-business">{config.business_name || data.business_name}</p>
      )}

      {config.show_address && config.address_line && (
        <p className="receipt-muted">{config.address_line}</p>
      )}
      {config.show_phone &&
        (config.phone_line || config.business_phone) && (
          <p className="receipt-muted">
            {config.phone_line || config.business_phone}
          </p>
        )}
      {config.show_email && config.email_line && (
        <p className="receipt-muted">{config.email_line}</p>
      )}
      {config.show_website && config.website_line && (
        <p className="receipt-muted">{config.website_line}</p>
      )}

      {(config.show_reference || config.show_datetime) && (
        <div className="receipt-rule">
          {config.show_reference && <p>{data.reference_no}</p>}
          {config.show_datetime && (
            <p className="receipt-muted">
              {formatReceiptDateTime(data.created_at)}
            </p>
          )}
        </div>
      )}

      {config.show_items && (
        <div className="receipt-rule">
          {(data.items || []).map((item, index) => (
            <div key={`${item.product_name}-${index}`} className="receipt-item">
              <div>
                <p className="receipt-item-name">{item.product_name}</p>
                <p className="receipt-muted">
                  {item.quantity} x {formatNLe(item.unit_price)}
                </p>
              </div>
              <p className="receipt-item-total">{formatNLe(item.subtotal)}</p>
            </div>
          ))}
        </div>
      )}

      {(config.show_subtotal || config.show_total) && (
        <div className="receipt-rule">
          {config.show_subtotal && (
            <div className="receipt-meta-row">
              <span>Subtotal</span>
              <span>{formatNLe(data.subtotal)}</span>
            </div>
          )}
          {config.show_total && (
            <div className="receipt-total">
              <span>Total paid</span>
              <span>{formatNLe(data.total)}</span>
            </div>
          )}
        </div>
      )}

      {(config.show_cashier ||
        config.show_payment_method ||
        (config.show_customer_phone && data.customer_phone)) && (
        <div className="receipt-rule">
          {config.show_cashier && (
            <MetaRow label="Cashier" value={data.cashier_name} />
          )}
          {config.show_payment_method && (
            <MetaRow
              label="Payment"
              value={PAYMENT_LABELS[data.payment_method] || data.payment_method}
            />
          )}
          {config.show_customer_phone && data.customer_phone && (
            <MetaRow label="Phone" value={data.customer_phone} />
          )}
        </div>
      )}

      {config.show_footer && config.footer_text && (
        <div className="receipt-rule">
          <p className="receipt-footer">{config.footer_text}</p>
        </div>
      )}

      {config.show_powered_by && (
        <div className="receipt-rule">
          <p className="receipt-muted">Powered by BizCore</p>
        </div>
      )}
    </div>
  )
}
