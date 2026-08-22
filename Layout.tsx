import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { getCurrentUser } from './lib/auth'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [currentUser, setCurrentUser] = useState<{ username?: string; role?: string } | null>(null)

  useEffect(() => {
    setCurrentUser(getCurrentUser())
  }, [])

  return (
    <div>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="page-shell flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-3 text-slate-900">
              <img src="/logo.png" alt="RSJH logo" className="h-12 w-12 rounded-3xl object-contain shadow-soft" />
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-slate-500">RWANDA MEDICAL STUDENT JOURNAL</p>
                <p className="text-lg font-semibold text-slate-900">RSJH</p>
              </div>
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/articles" className="hover:text-slate-900">Articles</Link>
            <Link href="/about" className="hover:text-slate-900">About</Link>
            {currentUser ? (
              <>
                <Link href="/submit" className="hover:text-slate-900">Submit</Link>
                <Link href="/review" className="hover:text-slate-900">Review</Link>
                <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-600">
                  {currentUser.role || 'member'}
                </span>
              </>
            ) : (
              <Link href="/auth/login" className="call-to-action">Login</Link>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="bg-slate-950 text-slate-300 py-10 mt-16">
        <div className="page-shell grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">RSJH</p>
            <p className="mt-3 text-sm leading-6">A trusted digital platform for Rwandan medical students, researchers, and healthcare professionals.</p>
          </div>
          <div>
            <p className="font-semibold text-white">Site</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Home</li>
              <li>Articles</li>
              <li>About</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Contact</p>
            <p className="mt-3 text-sm">Contact the RSJH editorial office for publication and platform enquiries.</p>
          </div>
        </div>
        <div className="page-shell mt-8 text-center text-slate-400 text-sm">
          Rwanda Student Journal for Health
        </div>
      </footer>
    </div>
  )
}
