export function getCurrentUser() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const token = localStorage.getItem('access_token')

    if (!token) {
      return null
    }

    const userData = localStorage.getItem('user')

    if (userData) {
      return JSON.parse(userData)
    }

    return null
  } catch (error) {
    console.error('Unable to read current user:', error)
    return null
  }
}
