function formatValue(value) {
  if (value === null || value === undefined || value === '') return null
  const text = String(value)
  return text.length > 24 ? `${text.slice(0, 24)}...` : text
}

export default function CustomAttributePills({
  attributes,
  fields = [],
  max = 2,
  className = '',
}) {
  if (!attributes || typeof attributes !== 'object') return null

  const labels = Object.fromEntries(
    fields.map((field) => [field.field_name, field.field_label])
  )

  const entries = Object.entries(attributes)
    .map(([name, value]) => {
      const text = formatValue(value)
      if (!text) return null
      const label = labels[name] || name.replace(/_/g, ' ')
      return { name, label, text }
    })
    .filter(Boolean)

  if (!entries.length) return null

  const visible = entries.slice(0, max)
  const hidden = entries.length - visible.length

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {visible.map((item) => (
        <span
          key={item.name}
          title={`${item.label}: ${item.text}`}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-neutral-300"
        >
          <span className="truncate text-neutral-500">{item.label}:</span>
          <span className="truncate text-neutral-200">{item.text}</span>
        </span>
      ))}
      {hidden > 0 && (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
          +{hidden}
        </span>
      )}
    </div>
  )
}
