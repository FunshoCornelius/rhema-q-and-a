import { createServerFn } from '@tanstack/react-start'
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from './auth'
import {
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from './cookies'

type AdminPayload = { role: string; campusId?: string; level?: string }

// Resolves the current session from cookies.
// Returns the payload if valid, null if not.
// Silently refreshes the access token if it is expired but the refresh token is still valid.
const resolveSession = async (): Promise<AdminPayload | null> => {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken)
    if (payload) return payload as AdminPayload
  }

  if (refreshToken) {
    const payload = await verifyRefreshToken(refreshToken)
    if (payload) {
      const { iat, exp, ...claims } = payload as any
      const newAccessToken = await signAccessToken(claims)
      setAuthCookies(newAccessToken, refreshToken)
      return claims as AdminPayload
    }
  }

  clearAuthCookies()
  return null
}

// ── Admin guard ───────────────────────────────────────────────────────────────
// Returns adminInfo on success, null on failure.
// The route's beforeLoad throws the redirect based on the return value.

export const getAdminSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await resolveSession()
    if (!session || session.role !== 'admin') return null
    return {
      campusId: session.campusId!,
      level: session.level!,
      role: session.role,
    }
  },
)

// ── Super admin guard ─────────────────────────────────────────────────────────

export const getSuperAdminSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await resolveSession()
    if (!session || session.role !== 'super') return null
    return { role: session.role }
  },
)

// ── Logout ────────────────────────────────────────────────────────────────────

export const logoutAdmin = createServerFn({ method: 'POST' }).handler(
  async () => {
    clearAuthCookies()
    return { ok: true }
  },
)

export const logoutSuperAdmin = createServerFn({ method: 'POST' }).handler(
  async () => {
    clearAuthCookies()
    return { ok: true }
  },
)
