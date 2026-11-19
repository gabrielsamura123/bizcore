import { Link } from 'react-router-dom'

export default function Brand() {
  return (
    <Link to="/" className="group inline-flex items-center gap-3">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-violet-500/30 to-cyan-500/20 shadow-[0_8px_30px_-10px_rgba(139,92,246,0.9)] backdrop-blur-xl">
        <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 opacity-40 blur-md transition duration-300 group-hover:opacity-70" />
        <span className="relative text-sm font-black tracking-tight text-white">B</span>
      </span>
      <span className="text-lg font-semibold tracking-tight text-white">
        Biz<span className="text-gradient">Core</span>
      </span>
    </Link>
  )
}
