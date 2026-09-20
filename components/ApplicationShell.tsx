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
    <div className="min-h-screen bg-parchment">
      <Header />
      <section className="border-b border-graphite-200 bg-white">
        <div className="rsre-page py-6">
          <div className="rsre-kicker">RSRE Workspace</div>
          <h1 className="rsjh-title mt-2 text-3xl">{name}</h1>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-graphite-600">
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
