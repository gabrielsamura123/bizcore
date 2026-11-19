import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'
import AuthShowcase from '@/components/auth/AuthShowcase'
import Logo from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'

const inputClass =
  'w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition-all focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName || !email || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setSubmitting(true)
    try {
      await register({ full_name: fullName, email, password })
      setSuccess('Business workspace created. Redirecting to login...')
      setTimeout(() => navigate('/login', { replace: true }), 900)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(
        Array.isArray(detail)
          ? detail.map((item) => item.msg).join(' ')
          : detail || 'Could not create your workspace. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dark grid min-h-screen grid-cols-1 bg-black text-white lg:grid-cols-12">
      <AuthShowcase />

      <div className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-8 lg:col-span-7">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-1/4 top-0 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-500/5 blur-3xl" />
        </div>

        <div data-aos="fade-up" className="relative z-10 w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-900/30 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Register your Business
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Set up your store workspace and start selling with BizCore.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-7 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-xl"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mt-7 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 backdrop-blur-xl"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300" htmlFor="full_name">
                  Full name
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="full_name"
                    type="text"
                    autoComplete="name"
                    className={`${inputClass} pl-10`}
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`${inputClass} pl-10`}
                    placeholder="you@business.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`${inputClass} pl-10 pr-11`}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 transition hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-neutral-500">
                  Minimum 6 characters.
                </p>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950 shadow-lg shadow-white/5 transition-all hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? 'Creating workspace...' : 'Create Business Workspace'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-neutral-400">
              Already registered?{' '}
              <Link
                to="/login"
                className="font-semibold text-white underline underline-offset-4 transition hover:text-emerald-300"
              >
                Log in here
              </Link>
            </p>
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
