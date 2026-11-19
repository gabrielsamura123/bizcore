import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200/80 bg-white/70 text-neutral-700 backdrop-blur transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
