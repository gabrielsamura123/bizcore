import { Link } from 'react-router-dom'

export default function BottomTabBar({ items }) {
  return (
    <nav
      className="liquid-glass fixed inset-x-3 bottom-4 z-50 grid grid-cols-6 gap-1 rounded-2xl px-2 py-2 md:hidden"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const Icon = item.icon

        const content = (
          <>
            <span
              className={`flex h-9 w-full items-center justify-center rounded-xl transition-colors ${
                item.active
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                  : 'text-neutral-600 dark:text-neutral-300'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="mt-1 text-center text-[10px] font-medium leading-none text-neutral-600 dark:text-neutral-300">
              {item.label}
            </span>
          </>
        )

        const className =
          'relative z-10 flex flex-col items-center justify-center rounded-xl py-0.5'

        if (item.to) {
          return (
            <Link
              key={item.label}
              to={item.to}
              className={className}
              onClick={item.onClick}
              aria-current={item.active ? 'page' : undefined}
            >
              {content}
            </Link>
          )
        }

        if (item.href) {
          return (
            <a
              key={item.label}
              href={item.href}
              className={className}
              onClick={item.onClick}
              aria-current={item.active ? 'page' : undefined}
            >
              {content}
            </a>
          )
        }

        return (
          <button
            key={item.label}
            type="button"
            className={className}
            onClick={item.onClick}
          >
            {content}
          </button>
        )
      })}
    </nav>
  )
}
