export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem('rmsjToken')
}

function decodeBase64Url(base64Url: string) {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const padding = base64.length % 4
  if (padding === 2) base64 += '=='
  if (padding === 3) base64 += '='
  return atob(base64)
}

export function parseJwt(token: string): Record<string, unknown> {
  const parts = token.split('.')
  if (parts.length < 2) {
    throw new Error('Invalid token')
  }
  const payload = decodeBase64Url(parts[1])
  return JSON.parse(payload)
}

export function getCurrentUser() {
  const token = getToken()
  if (!token) return null

  try {
    const payload = parseJwt(token)
    return {
      username: payload.username as string | undefined,
      role: payload.role as string | undefined,
    }
  } catch {
    return null
  }
}
