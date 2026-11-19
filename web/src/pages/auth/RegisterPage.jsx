import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ArrowRight } from 'lucide-react'
import AuthShell from '@/components/layout/AuthShell'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((state) => state.setTokens)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { full_name: '', email: '', password: '' },
  })

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      await authService.register(values)
      const { data } = await authService.login(values.email, values.password)
      setTokens(data)
      toast.success('Workspace created')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Start with a private space for your business."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-medium text-violet-300 hover:text-white">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label" htmlFor="full_name">
            Full name
          </label>
          <input
            id="full_name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className="field"
            {...register('full_name', { required: 'Full name is required' })}
          />
          {errors.full_name && (
            <p className="mt-2 text-xs text-rose-300">{errors.full_name.message}</p>
          )}
        </div>

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
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className="field"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Use at least 6 characters' },
            })}
          />
          {errors.password && (
            <p className="mt-2 text-xs text-rose-300">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthShell>
  )
}
