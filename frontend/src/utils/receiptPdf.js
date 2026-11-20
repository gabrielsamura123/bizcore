import { jsPDF } from 'jspdf'
import { formatNLe, formatReceiptDateTime } from './money'
import { PAYMENT_LABELS } from './receipt'

const PAGE_WIDTH = 80
const MARGIN = 5
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const DIVIDER = '-'.repeat(43)

function labelForField(name, labels) {
  if (labels[name]) return labels[name]
  return name.replace(/_/g, ' ')
}

function formatItemAttributes(item, labels) {
  const attributes = item.custom_attributes || {}
  return Object.entries(attributes)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([name, value]) => `${labelForField(name, labels)}: ${value}`)
}

async function loadBizcoreLogo() {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, 64, 64)
        resolve(canvas.toDataURL('image/png'))
      } catch (error) {
        reject(error)
      }
    }
    image.onerror = reject
    image.src = '/bizcore-icon.svg'
  })
}

function writeLogo(doc, logo, y) {
  if (logo) {
    doc.addImage(logo, 'PNG', PAGE_WIDTH / 2 - 5, y, 10, 10)
    return
  }

  doc.setFillColor(0, 0, 0)
  doc.roundedRect(PAGE_WIDTH / 2 - 5, y, 10, 10, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('B', PAGE_WIDTH / 2, y + 6.5, { align: 'center' })
  doc.setTextColor(0, 0, 0)
}

export async function downloadReceiptPdf(receipt) {
  if (!receipt) return

  const doc = new jsPDF({
    unit: 'mm',
    format: [PAGE_WIDTH, 297],
    compress: true,
  })
  const settings = receipt.settings || {}
  const labels = settings.custom_field_labels || {}
  const businessName = settings.business_name || receipt.business_name || 'BizCore SL'
  const industry = settings.business_industry || ''
  const address = settings.business_address || settings.address_line || ''
  const phone = settings.business_phone || settings.phone_line || ''
  const paymentLabel = (
    PAYMENT_LABELS[receipt.payment_method] || receipt.payment_method || 'Cash'
  ).toUpperCase()

  let logo = null
  try {
    logo = await loadBizcoreLogo()
  } catch {
    logo = null
  }

  doc.setProperties({
    title: `Receipt ${receipt.reference_no}`,
    subject: 'BizCore SL transaction receipt',
    creator: 'BizCore SL',
  })

  let y = 6
  writeLogo(doc, logo, y)
  y += 13

  doc.setFont('courier', 'bold')
  doc.setFontSize(11)
  doc.text(String(businessName).toUpperCase(), PAGE_WIDTH / 2, y, {
    align: 'center',
    maxWidth: CONTENT_WIDTH,
  })
  y += 6

  doc.setFont('courier', 'normal')
  doc.setFontSize(7.5)
  for (const line of [industry, address, phone].filter(Boolean)) {
    const lines = doc.splitTextToSize(String(line), CONTENT_WIDTH)
    doc.text(lines, PAGE_WIDTH / 2, y, { align: 'center' })
    y += lines.length * 3.2
  }

  doc.setFont('courier', 'bold')
  doc.setFontSize(8)
  doc.text(`REF: ${receipt.reference_no}`, MARGIN, y + 4)
  doc.setFont('courier', 'normal')
  doc.text(`Date: ${formatReceiptDateTime(receipt.created_at)}`, MARGIN, y + 8)
  doc.text(`Cashier: ${receipt.cashier_name || 'Cashier'}`, MARGIN, y + 12)
  y += 18

  doc.text(DIVIDER, MARGIN, y)
  y += 5

  for (const item of receipt.items || []) {
    const itemName = `${item.quantity} x ${item.product_name}`
    const itemTotal = formatNLe(item.subtotal)
    const nameLines = doc.splitTextToSize(itemName, CONTENT_WIDTH - 22)

    doc.setFont('courier', 'bold')
    doc.setFontSize(8)
    doc.text(nameLines, MARGIN, y)
    doc.text(itemTotal, PAGE_WIDTH - MARGIN, y, { align: 'right' })
    y += nameLines.length * 3.6

    doc.setFont('courier', 'normal')
    doc.setFontSize(6.6)
    doc.text(`Unit: ${formatNLe(item.unit_price)}`, MARGIN, y)
    y += 3.2

    for (const attribute of formatItemAttributes(item, labels)) {
      const attributeLines = doc.splitTextToSize(attribute, CONTENT_WIDTH)
      doc.text(attributeLines, MARGIN, y)
      y += attributeLines.length * 3
    }

    y += 2
    if (y > 265) {
      doc.addPage()
      y = 10
    }
  }

  doc.setFontSize(8)
  doc.text(DIVIDER, MARGIN, y)
  y += 5

  doc.setFont('courier', 'normal')
  doc.text('Subtotal', MARGIN, y)
  doc.text(formatNLe(receipt.subtotal), PAGE_WIDTH - MARGIN, y, { align: 'right' })
  y += 6

  doc.setFont('courier', 'bold')
  doc.setFontSize(9)
  doc.text('TOTAL', MARGIN, y)
  doc.text(formatNLe(receipt.total), PAGE_WIDTH - MARGIN, y, { align: 'right' })
  y += 7

  doc.setFont('courier', 'normal')
  doc.setFontSize(7.5)
  doc.text(`Payment: ${paymentLabel}`, MARGIN, y)
  if (receipt.customer_phone) {
    y += 4
    doc.text(`Phone: ${receipt.customer_phone}`, MARGIN, y)
  }
  y += 7

  doc.text(DIVIDER, MARGIN, y)
  y += 6
  doc.setFont('courier', 'bold')
  doc.setFontSize(8)
  doc.text('Thank you for your business!', PAGE_WIDTH / 2, y, { align: 'center' })
  y += 5
  doc.setFont('courier', 'normal')
  doc.setFontSize(7)
  doc.text('Powered by BizCore SL', PAGE_WIDTH / 2, y, { align: 'center' })

  doc.save(`Receipt-${receipt.reference_no}.pdf`)
}
