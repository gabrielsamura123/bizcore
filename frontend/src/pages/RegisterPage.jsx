import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'
import AuthShowcase from '@/components/auth/AuthShowcase'
import LiquidInput from '@/components/auth/LiquidInput'
import Logo from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [entered, setEntered] = useState(false)
  const fullNameRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const { register } = useAuth()
  const navigate = useNavigate()
  const passwordValid = password.length >= 6

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName || !email || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (!passwordValid) {
      setError('Password must be at least 6 characters long.')
      passwordRef.current?.focus()
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
    <div className="grid min-h-screen grid-cols-1 bg-[#07090b] text-white md:grid-cols-12">
      <div className="relative flex min-h-screen items-center justify-center px-5 py-16 sm:px-8 md:col-span-7 md:order-1">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-liquid-breathe absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-white/[0.06] blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md" data-aos="fade-up">
          <div className="mb-10 md:hidden">
            <Logo />
          </div>

          <div
            className={`rounded-2xl border border-white/10 bg-black/50 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all duration-700 ease-out sm:p-10 ${
              entered ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Register your Business
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Set up your store workspace and start selling with BizCore.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-neutral-300">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
              <span>Instant Setup</span>
              <span className="h-1 w-1 rounded-full bg-neutral-500" />
              <span>Super Admin Verified Platform</span>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-7 flex items-start gap-2.5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-neutral-100 backdrop-blur-xl"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mt-7 flex items-start gap-2.5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-neutral-100 backdrop-blur-xl"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <LiquidInput
                id="full_name"
                label="Full name"
                icon={UserRound}
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                inputRef={fullNameRef}
              />

              <LiquidInput
                id="email"
                label="Email address"
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder="you@business.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                inputRef={emailRef}
              />

              <LiquidInput
                id="password"
                label="Password"
                icon={LockKeyhole}
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                inputRef={passwordRef}
                footer={
                  <div className="mt-2">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
passwordValid
                             ? 'bg-white'
                             : 'bg-white/20'
                        }`}
                        style={{
                          width: `${Math.min((password.length / 6) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p
                      className={`mt-1.5 text-xs transition-colors duration-300 ${
passwordValid
                           ? 'text-neutral-200'
                           : 'text-neutral-500'
                      }`}
                    >
                      {passwordValid
                        ? '6+ characters ready'
                        : `${password.length}/6 characters`}
                    </p>
                  </div>
                }
              />

              <button
                type="submit"
                className="btn-shimmer active:scale-[0.98] inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-white/5 transition-all hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
              >
                <span className="inline-flex items-center gap-2">
                  {submitting ? 'Creating workspace...' : 'Create Business Workspace'}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-neutral-400">
              Already registered?{' '}
              <Link
                to="/login"
                className="font-semibold text-white underline underline-offset-4 transition hover:text-neutral-300"
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

      <AuthShowcase />
    </div>
  )
}
