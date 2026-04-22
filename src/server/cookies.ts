import {
  setCookie,
  getCookie,
  deleteCookie,
} from '@tanstack/react-start/server'

const IS_PROD = process.env.NODE_ENV === 'production'

const BASE_OPTS = {
  httpOnly: true,
  path: '/' as const,
  sameSite: 'strict' as const,
  secure: IS_PROD,
}

export const setAuthCookies = (accessToken: string, refreshToken: string) => {
  setCookie('access_token', accessToken, {
    ...BASE_OPTS,
    maxAge: 60 * 15, // 15 minutes
  })
  setCookie('refresh_token', refreshToken, {
    ...BASE_OPTS,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export const getAccessToken = () => getCookie('access_token')
export const getRefreshToken = () => getCookie('refresh_token')

export const clearAuthCookies = () => {
  deleteCookie('access_token', { path: '/' })
  deleteCookie('refresh_token', { path: '/' })
}
