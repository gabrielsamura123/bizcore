import { ChevronRight, Sparkles, X } from 'lucide-react'

function initials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export default function QuickAccountSwitcher({
  accounts,
  selectedEmail,
  onSelect,
  onRemove,
  onUseDifferent,
}) {
  if (!accounts?.length) return null

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-300">
            Quick sign in
          </p>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
          {accounts.length} saved
        </span>
      </div>

      <div className="space-y-2">
        {accounts.map((account) => {
          const selected = selectedEmail === account.email

          return (
            <div
              key={account.email}
              className={`flex items-center gap-1 rounded-xl border p-2 transition-all duration-300 ${
                selected
                  ? 'border-white/30 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.06)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(account)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                  {initials(account.name)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-white">
                    {account.name}
                  </span>
                  <span className="block truncate text-[11px] text-neutral-500">
                    {account.email}
                  </span>
                </span>

                <span className="hidden shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-neutral-300 sm:inline-flex">
                  {account.role}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-neutral-500" />
              </button>

              <button
                type="button"
                onClick={() => onRemove(account.email)}
                className="shrink-0 rounded-lg p-2 text-neutral-500 transition hover:bg-white/10 hover:text-white"
                aria-label={`Remove ${account.email}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onUseDifferent}
        className="mt-3 text-xs font-semibold text-neutral-400 underline underline-offset-4 transition hover:text-white"
      >
        Use a different account
      </button>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] text-neutral-500">or sign in manually</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
    </section>
  )
}
