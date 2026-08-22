import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import api, { absoluteUrl } from './utils/api'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)

  async function refresh() {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('rmsjToken')
    if (!token) {
      setUser(null)
      setUnread(0)
      return
    }
    try {
      const [profileRes, notesRes] = await Promise.all([
        api.get('/profile/'),
        api.get('/notifications/'),
      ])
      setUser(profileRes.data)
      localStorage.setItem('rmsjUser', JSON.stringify(profileRes.data))
      const notes = Array.isArray(notesRes.data) ? notesRes.data : (notesRes.data?.results || [])
      setUnread(notes.filter((n) => !n.is_read).length)
    } catch (e) {
      const cached = localStorage.getItem('rmsjUser')
      setUser(cached ? JSON.parse(cached) : null)
    }
  }

  useEffect(() => {
    refresh()
    const onChange = () => refresh()
    window.addEventListener('rmsj-auth-changed', onChange)
    return () => window.removeEventListener('rmsj-auth-changed', onChange)
  }, [])

  const role = user?.role || ''
  const dashboard = role === 'administrator' ? '/dashboard/admin' : role === 'editor_in_chief' ? '/dashboard/editor-in-chief' : role === 'editor' ? '/dashboard/editor' : role === 'reviewer' ? '/dashboard/reviewer' : '/dashboard/author'

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[78px] flex items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <img src="/logo.png" alt="RSJH" className="h-11 w-11 object-contain shrink-0" />
          <div className="min-w-0 hidden sm:block">
            <div className="font-black text-slate-950 leading-tight">RSJH</div>
            <div className="text-xs text-slate-500 truncate">Rwanda Student Journal for Health</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-sm font-bold text-slate-700">
          <Link href="/articles" className="hover:text-blue-700">Articles</Link>
          <Link href="/research-hub" className="hover:text-blue-700">Research Hub</Link>
          <Link href="/research-opportunities" className="hover:text-blue-700">Opportunities</Link>
          <Link href="/editorial-board" className="hover:text-blue-700">Editorial Board</Link>
          <Link href="/about" className="hover:text-blue-700">About</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/notifications" className="relative rounded-xl px-3 py-2 hover:bg-slate-100" aria-label="Notifications">
                <span className="text-xl">🔔</span>
                {unread > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
              </Link>
              <Link href="/profile" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100">
                <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200 ring-2 ring-white shadow">
                  {user.profile_picture ? <img src={absoluteUrl(user.profile_picture)} alt="Profile" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center font-black text-slate-500">{(user.full_name || user.username || 'U').charAt(0).toUpperCase()}</div>}
                </div>
                <span className="hidden md:block max-w-32 truncate text-sm font-bold text-slate-800">{user.full_name || user.username}</span>
              </Link>
              <Link href={dashboard} className="hidden sm:inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800">Dashboard</Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hidden sm:inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50">Sign in</Link>
              <Link href="/auth/register" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700">Get started</Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="lg:hidden rounded-xl border border-slate-200 px-3 py-2 text-lg">☰</button>
        </div>
      </div>
      {open && <div className="lg:hidden border-t border-slate-200 bg-white"><div className="max-w-7xl mx-auto px-4 py-4 grid gap-2 text-sm font-bold"><Link href="/articles" onClick={()=>setOpen(false)}>Articles</Link><Link href="/research-hub" onClick={()=>setOpen(false)}>Research Hub</Link><Link href="/research-opportunities" onClick={()=>setOpen(false)}>Opportunities</Link><Link href="/editorial-board" onClick={()=>setOpen(false)}>Editorial Board</Link><Link href="/archive" className="hover:text-blue-700">Archive</Link><Link href="/about" onClick={()=>setOpen(false)}>About</Link>{user && <Link href={dashboard} onClick={()=>setOpen(false)}>Dashboard</Link>}</div></div>}
    </header>
  )
}
