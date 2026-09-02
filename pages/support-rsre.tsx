import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import api from '../utils/api'

type PaymentSettings = {
  organisation_name: string
  support_message: string
  currency: string
  mtn_enabled: boolean
  mtn_display_number: string
  bank_enabled: boolean
  bank_name: string
  bank_account_name: string
  bank_account_number: string
  bank_branch: string
  support_whatsapp_number: string
}

const initialForm = {
  payer_name: '', payer_email: '', payer_phone: '', amount: '',
  method: 'mtn_momo', purpose: 'General RSRE support', reference: '',
}

export default function SupportRSRE() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [form, setForm] = useState(initialForm)
  const [proof, setProof] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/payments/settings/')
      .then((response) => setSettings(response.data))
      .catch(() => setError('Support payment instructions are temporarily unavailable. Please contact RSRE Support.'))
      .finally(() => setLoading(false))
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')
    try {
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => payload.append(key, value))
      if (proof) payload.append('proof', proof)
      const response = await api.post('/payments/', payload)
      setMessage(`Your contribution reference was received and is pending manual confirmation. Status: ${response.data.status}.`)
      setForm(initialForm)
      setProof(null)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not submit the contribution. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const configuredWhatsapp = settings?.support_whatsapp_number?.trim() || ''
  const whatsapp = /^\+[1-9]\d{7,14}$/.test(configuredWhatsapp)
    ? `https://wa.me/${configuredWhatsapp.slice(1)}`
    : ''

  return <Layout>
    <main className="bg-slate-50">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="max-w-4xl">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Support RSRE</div>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">Support Research Support and Research Ecosystem (RSRE).</h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">Contributions help sustain research training, learning resources, collaboration, student research capacity, publication support and evidence-to-action activities.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            ['🎓', 'Research access', 'Help learners and researchers access training, tools and research-development resources.'],
            ['🧪', 'Research development', 'Support projects, mentorship, collaboration and responsible research practice.'],
            ['🌍', 'Open publication', 'Help sustain the infrastructure around RSJH while keeping the journal free for students.'],
          ].map(([icon, title, text]) => <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="text-3xl">{icon}</div><h2 className="mt-4 text-xl font-black">{title}</h2><p className="mt-2 leading-7 text-slate-600">{text}</p></div>)}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">Manual contribution options</h2>
            <p className="mt-3 leading-7 text-slate-600">{settings?.support_message || 'Payment confirmation is manual until an official payment API is available.'}</p>
            {loading ? <p className="mt-6 text-sm text-slate-500">Loading configured instructions…</p> : settings && <div className="mt-6 space-y-4 text-sm">
              {settings.mtn_enabled && <div className="rounded-2xl bg-amber-50 p-4"><strong>MTN MoMo</strong><p className="mt-1 text-slate-700">Send your contribution to: {settings.mtn_display_number || 'Contact RSRE Support for the configured number.'}</p></div>}
              {settings.bank_enabled && <div className="rounded-2xl bg-blue-50 p-4"><strong>Direct bank payment</strong><p className="mt-1 text-slate-700">{settings.bank_name} · {settings.bank_account_name} · {settings.bank_account_number}{settings.bank_branch ? ` · ${settings.bank_branch}` : ''}</p></div>}
              {!settings.mtn_enabled && !settings.bank_enabled && <div className="rounded-2xl bg-slate-50 p-4 text-slate-700">Direct payment instructions are available from RSRE Support.</div>}
              {whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex rounded-xl bg-emerald-600 px-4 py-3 font-black text-white">Ask RSRE Support on WhatsApp</a>}
            </div>}
          </div>

          <form onSubmit={submit} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 shadow-sm">
            <h2 className="text-2xl font-black">Record a contribution</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Submitting this form records a pending contribution. It does not mean payment has been confirmed.</p>
            <div className="mt-6 grid gap-4">
              <input required value={form.payer_name} onChange={e => setForm({...form, payer_name: e.target.value})} placeholder="Your name" className="rounded-xl border border-slate-200 bg-white px-4 py-3" />
              <input type="email" value={form.payer_email} onChange={e => setForm({...form, payer_email: e.target.value})} placeholder="Email (optional)" className="rounded-xl border border-slate-200 bg-white px-4 py-3" />
              <input value={form.payer_phone} onChange={e => setForm({...form, payer_phone: e.target.value})} placeholder="Phone (optional)" className="rounded-xl border border-slate-200 bg-white px-4 py-3" />
              <div className="grid gap-4 sm:grid-cols-2">
                <input required type="number" min="1" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder={`Amount (${settings?.currency || 'RWF'})`} className="rounded-xl border border-slate-200 bg-white px-4 py-3" />
                <select value={form.method} onChange={e => setForm({...form, method: e.target.value})} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  {settings?.mtn_enabled && <option value="mtn_momo">MTN MoMo</option>}
                  {settings?.bank_enabled && <option value="bank_transfer">Direct bank payment</option>}
                  {!settings?.mtn_enabled && !settings?.bank_enabled && <option value="mtn_momo">Contact RSRE Support</option>}
                </select>
              </div>
              <input value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} placeholder="Transaction/reference number (if available)" className="rounded-xl border border-slate-200 bg-white px-4 py-3" />
              <label className="grid gap-2 text-sm font-bold text-slate-700">Payment proof (optional)<input type="file" accept="image/*,.pdf" onChange={e => setProof(e.target.files?.[0] || null)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal" /></label>
              <button disabled={submitting || loading} className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white disabled:opacity-50">{submitting ? 'Submitting…' : 'Submit for confirmation'}</button>
              {message && <div role="status" className="rounded-xl bg-white p-4 text-sm font-bold text-emerald-800">{message}</div>}
              {error && <div role="alert" className="rounded-xl bg-rose-100 p-4 text-sm font-bold text-rose-800">{error}</div>}
            </div>
          </form>
        </div>
        <div className="mt-8 rounded-3xl border border-emerald-200 bg-white p-7"><strong>RSJH is free.</strong> Support never buys publication, acceptance, reviewer assignment or editorial preference. <Link href="/contact" className="font-bold text-emerald-700">Contact RSRE Support</Link>.</div>
      </section>
    </main>
  </Layout>
}
