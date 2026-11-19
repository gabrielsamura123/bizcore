import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
} from 'lucide-react'
import AuthShowcase from '@/components/auth/AuthShowcase'
import LiquidInput from '@/components/auth/LiquidInput'
import QuickAccountSwitcher from '@/components/auth/QuickAccountSwitcher'
import Logo from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'
import {
  getSavedAccounts,
  removeSavedAccount,
  saveAccount,
} from '@/utils/savedAccounts'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [savedAccounts, setSavedAccounts] = useState(() => getSavedAccounts())
  const [selectedEmail, setSelectedEmail] = useState('')
  const [entered, setEntered] = useState(false)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleSelectSavedAccount = (account) => {
    setSelectedEmail(account.email)
    setEmail(account.email)
    setPassword('')
    setError('')

    const node = passwordRef.current
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.setTimeout(() => node.focus({ preventScroll: true }), 180)
    }
  }

  const handleUseDifferentAccount = () => {
    setSelectedEmail('')
    setEmail('')
    setPassword('')
    setError('')
    emailRef.current?.focus()
  }

  const handleRemoveSavedAccount = (savedEmail) => {
    setSavedAccounts(removeSavedAccount(savedEmail))
    if (selectedEmail === savedEmail) {
      setSelectedEmail('')
      setEmail('')
      setPassword('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both your email and password.')
      return
    }

    setSubmitting(true)
    try {
      const profile = await login(email, password)
      saveAccount({
        email: profile?.email || email,
        name: profile?.full_name || email.split('@')[0],
        role: profile?.is_superadmin ? 'Super Admin' : 'Owner',
      })
      navigate(profile?.is_superadmin ? '/admin' : '/dashboard', {
        replace: true,
      })
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please check your email and password.')
      } else {
        setError(
          err.response?.data?.detail || 'Unable to sign in right now. Try again.'
        )
      }
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
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Log in to access your business terminal and records.
            </p>

            <QuickAccountSwitcher
              accounts={savedAccounts}
              selectedEmail={selectedEmail}
              onSelect={handleSelectSavedAccount}
              onRemove={handleRemoveSavedAccount}
              onUseDifferent={handleUseDifferentAccount}
            />

            {error && (
              <div
                role="alert"
                className="mt-7 flex items-start gap-2.5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-neutral-100 backdrop-blur-xl"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <LiquidInput
                id="email"
                label="Email address"
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder="you@business.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setSelectedEmail('')
                }}
                inputRef={emailRef}
              />

              <LiquidInput
                id="password"
                label="Password"
                icon={LockKeyhole}
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                inputRef={passwordRef}
              />

              <button
                type="submit"
                className="btn-shimmer active:scale-[0.98] inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-white/5 transition-all hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
              >
                <span className="inline-flex items-center gap-2">
                  {submitting ? 'Signing in...' : 'Sign in to Terminal'}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-neutral-400">
              Need to register a new business?{' '}
              <Link
                to="/register"
                className="font-semibold text-white underline underline-offset-4 transition hover:text-neutral-300"
              >
                Get started
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
