import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ArrowRight } from 'lucide-react'
import AuthShell from '@/components/layout/AuthShell'
import { authService } from '@/services/auth'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } })

  const onSubmit = async (values) => {
    setLoading(true)
    setResetToken(null)
    try {
      const { data } = await authService.forgotPassword(values.email)
      if (data.reset_token) {
        setResetToken(data.reset_token)
        toast.success('Reset token generated')
      } else {
        toast.success(data.message)
      }
    } catch {
      toast.error('Unable to process the request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we will issue a reset token."
      footer={
        <Link to="/login" className="font-medium text-violet-300 hover:text-white">
          Back to sign in
        </Link>
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

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Continue'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      {resetToken && (
        <div className="glass mt-6 rounded-xl p-4">
          <p className="text-xs text-slate-400">
            Email delivery is not connected yet. Use this token to reset your password:
          </p>
          <p className="mt-2 break-all rounded-lg bg-black/40 p-3 font-mono text-[11px] text-violet-200">
            {resetToken}
          </p>
          <Link
            to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
            className="btn-ghost mt-3 w-full py-2.5"
          >
            Reset password
          </Link>
        </div>
      )}
    </AuthShell>
  )
}
