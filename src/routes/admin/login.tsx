import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { signAccessToken, signRefreshToken } from '../../server/auth'
import { setAuthCookies } from '../../server/cookies'
import { ConvexHttpClient } from 'convex/browser'
import bcrypt from 'bcryptjs'
import { Eye, EyeOff } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { LEVELS } from '../../config/campuses'

const loginAdmin = createServerFn({ method: 'POST' })
  .inputValidator((d: { campusId: string; level: string; password: string }) => d)
  .handler(async ({ data }) => {
    const convexUrl = process.env.VITE_CONVEX_URL
    if (!convexUrl) throw new Error('VITE_CONVEX_URL missing')

    const client = new ConvexHttpClient(convexUrl)
    const adminRecord = await client.query('admins:getAdmin' as any, {
      campusId: data.campusId,
      level: data.level,
    })

    if (!adminRecord) throw new Error('Invalid credentials')

    const match = await bcrypt.compare(data.password, adminRecord.passwordHash)
    if (!match) throw new Error('Invalid credentials')

    const claims = { role: 'admin', campusId: data.campusId, level: data.level }
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(claims),
      signRefreshToken(claims),
    ])

    setAuthCookies(accessToken, refreshToken)
    // Return success — redirect happens in the component
    return { ok: true }
  })

export const Route = createFileRoute('/admin/login')({
  component: AdminLogin,
  head: () => ({
    meta: [
      { title: 'Admin Sign In — Rhema BTC' },
      { name: 'description', content: 'Sign in to manage your campus Q&A session.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
})

function AdminLogin() {
  const campuses = useQuery(api.campuses.getCampuses) || []
  const [campusId, setCampusId] = useState('')
  const [level, setLevel] = useState(LEVELS[0]?.id || 'campus')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  if (campuses.length > 0 && !campusId) setCampusId(campuses[0].id)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campusId) { setError('Please select a campus.'); return }
    setIsLoading(true)
    setError(null)
    try {
      await loginAdmin({ data: { campusId, level, password } })
      navigate({ to: '/admin' })
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
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
          <h1 className="text-xl font-bold text-gray-900">Admin sign in</h1>
          <p className="text-sm text-gray-400 mt-1">Access your campus portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Campus</label>
            <select
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
            >
              {campuses.length === 0 ? (
                <option value="" disabled>Loading…</option>
              ) : (
                <>
                  <option value="" disabled>Select a campus</option>
                  {campuses.map((c: any) => (
                    <option key={c._id} value={c.id}>{c.name}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
            >
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

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
            disabled={isLoading || !campusId}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400 text-center">
          Need global settings?{' '}
          <button
            type="button"
            onClick={() => navigate({ to: '/super-admin/login' })}
            className="text-blue-600 hover:underline"
          >
            Super Admin Console
          </button>
        </p>
      </div>
    </div>
  )
}
