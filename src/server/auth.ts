import { SignJWT, jwtVerify } from 'jose'

const getSecret = (key: 'AUTH_SECRET' | 'REFRESH_SECRET') => {
  const val = process.env[key]
  if (!val) throw new Error(`${key} is not set in environment variables.`)
  return new TextEncoder().encode(val)
}

// Access token — short-lived (15 minutes)
export const signAccessToken = async (payload: Record<string, unknown>) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret('AUTH_SECRET'))

// Refresh token — long-lived (7 days)
export const signRefreshToken = async (payload: Record<string, unknown>) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret('REFRESH_SECRET'))

export const verifyAccessToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, getSecret('AUTH_SECRET'))
    return payload
  } catch {
    return null
  }
}

export const verifyRefreshToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, getSecret('REFRESH_SECRET'))
    return payload
  } catch {
    return null
  }
}
