import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'

export type UserRole = 'administrator' | 'editor_in_chief' | 'editor' | 'reviewer' | 'author' | 'reader'
const dashboardFor = (role: UserRole) => `/dashboard/${role === 'reviewer' ? 'reviewer' : ['editor','editor_in_chief'].includes(role) ? 'editor' : role === 'administrator' ? 'admin' : role}`

export default function ProtectedRoute({ roles, children }: { roles: UserRole[], children: ReactNode }) {
  const router = useRouter(); const [allowed, setAllowed] = useState(false)
  const rolesKey = roles.join(',')
  useEffect(() => {
    api.get('/profile/').then(({ data }) => {
      if (roles.includes(data.role)) setAllowed(true)
      else void router.replace(dashboardFor(data.role))
    }).catch(() => { void router.replace('/auth/login') })
  }, [rolesKey, router])
  return allowed ? <>{children}</> : <div className="page-shell py-12 text-slate-600">Loading your secure workspace…</div>
}
