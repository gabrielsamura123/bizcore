import { Link } from 'react-router-dom'
import BizCoreIcon from '@/components/BizCoreIcon'

export default function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5">
      <BizCoreIcon className="h-9 w-9" />
      <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
        Biz<span className="text-neutral-500 dark:text-neutral-300">Core</span>
      </span>
    </Link>
  )
}
