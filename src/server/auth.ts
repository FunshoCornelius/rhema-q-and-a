import { SignJWT, jwtVerify } from 'jose'

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error(
      'AUTH_SECRET is not set. Generate one with `openssl rand -base64 32` and add it to .env',
    )
  }
  return new TextEncoder().encode(secret)
}

export const signToken = async (payload: any) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getAuthSecret())
}

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret())
    return payload
  } catch (error) {
    return null
  }
}

export const verifyAdminAccess = async (
  token: string | undefined | null,
  campusId: string,
  level: string,
) => {
  if (!token) return false

  const payload = await verifyToken(token)
  if (!payload) return false

  if (payload.role === 'super') {
    return true
  }

  if (
    payload.role === 'admin' &&
    payload.campusId === campusId &&
    payload.level === level
  ) {
    return true
  }

  return false
}
