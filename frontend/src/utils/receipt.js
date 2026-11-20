export const PAYMENT_LABELS = {
  cash: 'Cash',
  orange_money: 'Orange Money',
  africell_money: 'Africell Money',
}

export const DEFAULT_RECEIPT_SETTINGS = {
  business_name: '',
  business_phone: null,
  cashier_name: null,
  header_text: null,
  footer_text: null,
  address_line: null,
  phone_line: null,
  email_line: null,
  website_line: null,
  logo_url: null,
  logo_width: 96,
  paper_size: '80mm',
  show_logo: true,
  show_header: false,
  show_business_name: true,
  show_address: true,
  show_phone: true,
  show_email: false,
  show_website: false,
  show_reference: true,
  show_datetime: true,
  show_cashier: true,
  show_payment_method: true,
  show_customer_phone: true,
  show_items: true,
  show_subtotal: true,
  show_total: true,
  show_footer: false,
  show_powered_by: false,
}

export function getReceiptConfig(settings) {
  return { ...DEFAULT_RECEIPT_SETTINGS, ...(settings || {}) }
}
