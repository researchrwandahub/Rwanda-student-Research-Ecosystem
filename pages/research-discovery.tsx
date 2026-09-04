import React, { useEffect, useMemo, useState } from 'react'
import ApplicationShell from '../components/ApplicationShell'
import api from '../utils/api'

type RecordItem = {
  source: string
  id: string | number
  title: string
  authors?: string[]
  year?: number | null
  journal?: string | null
  doi?: string | null
  pmid?: string | null
  url?: string | null
  open_access?: boolean | null
  citations?: number
  specialty?: string | null
}

export default function Discovery() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [source, setSource] = useState('all')
  const [year, setYear] = useState('')
  const [oa, setOa] = useState('all')
  const [results, setResults] = useState<RecordItem[]>([])
  const [localResults, setLocalResults] = useState<RecordItem[]>([])
  const [status, setStatus] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const savedQuery = localStorage.getItem('rsre_discovery_saved_search') || ''
      setSaved(Boolean(savedQuery))
      if (savedQuery) setQuery(savedQuery)
    } catch (_) {}
  }, [])

  async function search(e?: React.FormEvent) {
    e?.preventDefault()
    const q = query.trim()
    if (q.length < 2) {
      setError('Enter at least two characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = { q, rows: '15', source }
      if (year) params.year = year
      if (oa !== 'all') params.oa = oa
      const response = await api.get('/research-discovery/', { params })
      setResults(response.data.results || [])
      setLocalResults(response.data.local_results || [])
      setStatus(response.data.source_status || {})
      setSubmitted(q)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Discovery is temporarily unavailable. Please try again.')
      setResults([])
      setLocalResults([])
    } finally {
      setLoading(false)
    }
  }

  const years = useMemo(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: 12 }, (_, i) => current - i)
  }, [])

  const total = results.length + localResults.length

  return (
    <ApplicationShell
      name="Research Discovery"
      description="Search local RSRE records and trusted scholarly indexes. Check the original record before citing."
      nav={[
        ['/research-discovery', 'Discover'],
        ['/research-analytics', 'Analytics'],
        ['/research-academy', 'Academy'],
        ['/research-opportunities', 'Opportunities'],
        ['/research-passport', 'Passport'],
      ]}
    >
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-slate-950 p-7 text-white shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Evidence discovery</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Search beyond one database.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Search Local RSRE, PubMed, Europe PMC, OpenAlex and Crossref in one place. Each result keeps its source visible so you can verify the original record before using it.
            </p>
          </div>

          <form onSubmit={search} className="mt-8 grid gap-3 lg:grid-cols-[1fr_auto]">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="rounded-2xl border border-slate-700 bg-white px-5 py-4 text-slate-950 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Try: malaria Rwanda, maternal mortality, antimicrobial resistance..."
            />
            <div className="flex gap-2">
              <button disabled={loading} className="flex-1 rounded-2xl bg-emerald-400 px-7 py-4 font-black text-slate-950 disabled:opacity-60">
                {loading ? 'Searching…' : 'Search research'}
              </button>
              <button type="button" onClick={() => { const next=!saved; setSaved(next); if(next) localStorage.setItem('rsre_discovery_saved_search', query.trim()); else localStorage.removeItem('rsre_discovery_saved_search') }} className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm font-black text-white">
                {saved ? 'Saved ✓' : 'Save search'}
              </button>
            </div>
          </form>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <select value={source} onChange={e => setSource(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm">
              <option value="all">All sources</option>
              <option value="rsjh">Local RSRE only</option>
              <option value="pubmed">PubMed / NCBI</option>
              <option value="openalex">OpenAlex</option>
              <option value="crossref">Crossref</option>
              <option value="europepmc">Europe PMC</option>
            </select>
            <select value={year} onChange={e => setYear(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm">
              <option value="">Any year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={oa} onChange={e => setOa(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm">
              <option value="all">Any access</option>
              <option value="true">Open access</option>
              <option value="false">Closed access (confirmed)</option>
            </select>
          </div>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Rwanda-focused search ideas">
            {['malaria Rwanda', 'digital health Rwanda', 'maternal health Rwanda', 'community health workers Rwanda', 'health information systems Rwanda', 'implementation research Rwanda'].map(term => (
              <button key={term} type="button" onClick={() => setQuery(term)} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-emerald-400 hover:text-white">{term}</button>
            ))}
          </div>
        </section>

        {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

        {submitted && !loading && (
          <section className="mt-7 grid gap-4 md:grid-cols-3">
            <InsightCard title="What exists" value={total.toString()} detail="records in this discovery run" />
            <InsightCard title="Local signal" value={localResults.length.toString()} detail="Local RSRE records matching your query" />
            <InsightCard title="Next move" value="Explore gaps" detail="Use the evidence to refine a research question" />
          </section>
        )}

        {submitted && !loading && (
          <section className="mt-7 flex flex-col justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">Search results</div>
              <h3 className="mt-1 text-xl font-black text-slate-950">“{submitted}”</h3>
            </div>
            <div className="text-sm font-bold text-slate-500">{total} records found</div>
          </section>
        )}

        {submitted && localResults.length > 0 && (
          <section className="mt-6">
            <SectionHeading title="Local RSRE research" subtitle="Published research from RSRE's journal and publication component." />
            <div className="grid gap-4">
              {localResults.map(item => <ResearchCard key={`rsjh-${item.id}`} item={item} />)}
            </div>
          </section>
        )}

        {submitted && results.length > 0 && (
          <section className="mt-8">
            <SectionHeading title="Global scholarly literature" subtitle="Metadata retrieved from external scholarly indexes. Always verify the original record before citing." />
            <div className="grid gap-4">
              {results.map((item, index) => <ResearchCard key={`${item.source}-${item.doi || item.id}-${index}`} item={item} />)}
            </div>
          </section>
        )}

        {submitted && !loading && total === 0 && (
          <section className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <h3 className="mt-3 text-xl font-black">No matching records</h3>
            <p className="mt-2 text-sm text-slate-500">Try broader keywords, remove a filter, or continue your search with an external source.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <ExternalSearch href={externalSearch('https://scholar.google.com/scholar?q=', submitted)} label="Search Google Scholar" />
              <ExternalSearch href={externalSearch('https://www.researchgate.net/search/publication?q=', submitted)} label="Search ResearchGate" />
              <ExternalSearch href={externalSearch('https://pubmed.ncbi.nlm.nih.gov/?term=', submitted)} label="Search PubMed" />
              <ExternalSearch href={externalSearch('https://europepmc.org/search?query=', submitted)} label="Search Europe PMC" />
            </div>
          </section>
        )}

        {submitted && !loading && (
          <section className="mt-8 rounded-3xl bg-slate-950 p-6 text-white">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Research pathway</div>
            <div className="mt-3 grid gap-4 md:grid-cols-4">
              <PathwayStep n="01" title="Discover" text="Map what is already known." />
              <PathwayStep n="02" title="Compare" text="Look for Rwanda and local evidence." />
              <PathwayStep n="03" title="Find a gap" text="Identify unanswered or under-studied questions." />
              <PathwayStep n="04" title="Build" text="Move a stronger idea into the Incubator." />
            </div>
          </section>
        )}
        {submitted && !loading && total > 0 && <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="text-xs font-black uppercase tracking-wider text-slate-500">External discovery pathways</div><p className="mt-2 text-sm text-slate-600">Google Scholar and ResearchGate are external search services. RSRE does not scrape or index them directly.</p><div className="mt-4 flex flex-wrap gap-2"><ExternalSearch href={externalSearch('https://scholar.google.com/scholar?q=', submitted)} label="Search Google Scholar" /><ExternalSearch href={externalSearch('https://www.researchgate.net/search/publication?q=', submitted)} label="Search ResearchGate" /></div></section>}

        {submitted && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">Source status</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(status).map(([name, value]) => (
                <span key={name} className={`rounded-full px-3 py-1 text-xs font-bold ${value === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {name}: {value}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </ApplicationShell>
  )
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-2xl font-black text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

function InsightCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="text-xs font-black uppercase tracking-wider text-slate-400">{title}</div>
      <div className="mt-2 text-3xl font-black text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{detail}</div>
    </article>
  )
}

function PathwayStep({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-black text-emerald-300">{n}</div>
      <div className="mt-2 font-black">{title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-300">{text}</div>
    </div>
  )
}

function ResearchCard({ item }: { item: RecordItem }) {
  const link = item.url || (item.doi ? `https://doi.org/${item.doi}` : '#')
  const external = /^https?:\/\//i.test(link)
  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{item.source}</span>
        {item.open_access && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Open access</span>}
        {item.open_access === null && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">Access unknown</span>}
        {item.year && <span className="text-xs font-bold text-slate-400">{item.year}</span>}
      </div>
      <h4 className="mt-3 text-lg font-black leading-7 text-slate-950">{item.title}</h4>
      <p className="mt-2 text-sm text-slate-500">{item.authors?.slice(0, 4).join(', ') || 'Author metadata unavailable'}</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
        {item.journal && <span>{item.journal}</span>}
        {typeof item.citations === 'number' && <span>{item.citations.toLocaleString()} citations</span>}
        {item.specialty && <span>{item.specialty}</span>}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {item.doi && <span className="max-w-full truncate rounded-lg bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600">DOI: {item.doi}</span>}
        {item.pmid && <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600">PMID: {item.pmid}</span>}
        {link !== '#' && (
          <a href={link} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white">
            {external ? 'Open source ↗' : 'Open local article'}
          </a>
        )}
      </div>
    </article>
  )
}

function externalSearch(prefix: string, query: string) { return `${prefix}${encodeURIComponent(query)}` }
function ExternalSearch({ href, label }: { href: string; label: string }) { return <a href={href} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-black text-slate-800 hover:border-emerald-500">{label} ↗</a> }
