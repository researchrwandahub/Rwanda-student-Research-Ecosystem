import React from 'react'
import Header from './Header'
import Footer from './Footer'

export default function ApplicationShell({
  name,
  description,
  nav: _nav,
  children,
}: {
  name: string
  description?: string
  nav?: Array<[string, string]>
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
            RSRE Workspace
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-950">{name}</h1>
          {description && (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </section>
      <main>{children}</main>
      <Footer />
    </div>
  )
}
