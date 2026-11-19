import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function LiquidInput({
  id,
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  inputRef,
  footer,
}) {
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <label
        className="mb-2 block text-sm font-medium text-neutral-300"
        htmlFor={id}
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${
            focused ? 'text-white' : 'text-neutral-500'
          }`}
        />

        <input
          id={id}
          ref={inputRef}
          type={isPassword && visible ? 'text' : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none backdrop-blur-xl transition-all duration-300 ${
            focused
              ? 'scale-[1.005] border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.08)]'
              : 'border-white/10'
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => {
              setVisible((current) => !current)
              inputRef?.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-125 hover:text-white active:scale-95"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {footer}
    </div>
  )
}
