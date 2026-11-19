import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ArrowRight } from 'lucide-react'
import AuthShell from '@/components/layout/AuthShell'
import { authService } from '@/services/auth'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { token: searchParams.get('token') || '', password: '' },
  })

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      await authService.resetPassword(values.token, values.password)
      toast.success('Password updated. Sign in with your new password.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="Paste your reset token and choose a new password."
      footer={
        <Link to="/login" className="font-medium text-violet-300 hover:text-white">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label" htmlFor="token">
            Reset token
          </label>
          <textarea
            id="token"
            rows={3}
            className="field resize-none font-mono text-[11px]"
            placeholder="Paste your reset token"
            {...register('token', { required: 'Reset token is required' })}
          />
          {errors.token && (
            <p className="mt-2 text-xs text-rose-300">{errors.token.message}</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className="field"
            {...register('password', {
              required: 'New password is required',
              minLength: { value: 6, message: 'Use at least 6 characters' },
            })}
          />
          {errors.password && (
            <p className="mt-2 text-xs text-rose-300">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthShell>
  )
}
