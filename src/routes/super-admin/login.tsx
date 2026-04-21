import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { signToken } from '../../server/auth'

const loginSuperAdmin = (createServerFn({ method: 'POST' }) as any)
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }: { data: { password: string } }) => {
    const validPassword = process.env.SUPER_ADMIN_PASSWORD
    if (!validPassword) throw new Error('Server not configured correctly.')
    if (data.password !== validPassword) throw new Error('Invalid password')
    const token = await signToken({ role: 'super' })
    return { token }
  })

export const Route = createFileRoute('/super-admin/login')({
  component: SuperAdminLogin,
  head: () => ({ meta: [{ title: 'Super Admin — Rhema BTC' }, { name: 'robots', content: 'noindex, nofollow' }] }),
})

function SuperAdminLogin() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const res = await loginSuperAdmin({ data: { password } })
      localStorage.setItem('super-admin-token', res.token)
      navigate({ to: '/super-admin' })
    } catch (err: any) {
      setError(err.message || 'Invalid password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 mb-5">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L3 6v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6L11 2z" fill="white" />
              <path d="M8 11l2 2 4-4" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Super Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Restricted access — authorised personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400 text-center">
          Campus admin?{' '}
          <button
            type="button"
            onClick={() => navigate({ to: '/admin/login' })}
            className="text-blue-600 hover:underline"
          >
            Campus portal →
          </button>
        </p>
      </div>
    </div>
  )
}
