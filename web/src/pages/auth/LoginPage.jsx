import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ArrowRight } from 'lucide-react'
import AuthShell from '@/components/layout/AuthShell'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setTokens = useAuthStore((state) => state.setTokens)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } })

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const { data } = await authService.login(values.email, values.password)
      setTokens(data)
      toast.success('Welcome back')
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your BizCore workspace."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-violet-300 hover:text-white">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@business.com"
            className="field"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && (
            <p className="mt-2 text-xs text-rose-300">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label mb-0" htmlFor="password">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-violet-300 hover:text-white"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            className="field"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && (
            <p className="mt-2 text-xs text-rose-300">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthShell>
  )
}
