import { useEffect, useState } from 'react'
import ApplicationShell from '../../components/ApplicationShell'
import api from '../../utils/api'

type DiagnosticQuestion = {
  prompt: string
  answer: string
  options: string[]
  originalIndex: number
}

export default function Diagnostic() {
  const [q, setQ] = useState<DiagnosticQuestion[]>([])
  const [title, setTitle] = useState('Research Academy Entry Assessment')
  const [ans, setAns] = useState<Record<number, string>>({})
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .get('/academy/diagnostic/')
      .then((r) => {
        const questions = (r.data.questions || []).map(
          (question: any, index: number) => ({
            ...question,
            originalIndex: index,
          })
        )
        setTitle(r.data.title || 'Research Academy Entry Assessment')
        setQ(questions.slice(0, Math.min(8, questions.length)))
      })
      .catch(() => {
        setResult({ error: 'Assessment could not be loaded. Please try again.' })
      })
      .finally(() => setLoading(false))
  }, [])

  async function submit() {
    if (submitting) return

    const missing = q.filter(
      (question) => !ans[question.originalIndex]
    )

    if (missing.length) {
      setResult({
        error: `Please answer all ${missing.length} remaining question${missing.length === 1 ? '' : 's'} before submitting.`,
      })
      return
    }

    setSubmitting(true)

    try {
      const r = await api.post('/academy/diagnostic/', { answers: ans })
      setResult(r.data)
    } catch (error: any) {
      setResult({
        error:
          error?.response?.data?.detail ||
          'Assessment could not be submitted. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ApplicationShell
      name="Research Academy"
      description="Optional beginner diagnostic for flexible entry."
      nav={[
        ['/research-academy', 'Academy Home'],
        ['/research-academy/dashboard', 'My Learning'],
        ['/research-academy/diagnostic', 'Entry Assessment'],
      ]}
    >
      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            Optional flexible entry
          </div>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            This is a simple starting-point check. It tests foundational
            research understanding — not advanced statistics, publication
            expertise or professional certification. You may skip it and start
            the Academy from Level 1.
          </p>
        </div>

        {loading ? (
          <div className="mt-6 rounded-3xl bg-white p-7 shadow-sm">
            Loading assessment…
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
              <div className="font-black text-slate-950">How it works</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Answer the basic questions using what you already know. The
                result recommends a sensible starting point. Your Academy
                modules still teach the concepts from the beginning.
              </p>
            </div>

            {q.map((x, displayIndex) => {
              const selected = ans[x.originalIndex]

              return (
                <div
                  key={x.originalIndex}
                  className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="font-black leading-6">
                    {displayIndex + 1}. {x.prompt}
                  </div>

                  <div className="mt-4 grid gap-3">
                    {(x.options || []).map((o) => {
                      const value = String(o).charAt(0)
                      const active = selected === value

                      return (
                        <button
                          key={o}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            setAns((current) => ({
                              ...current,
                              [x.originalIndex]: value,
                            }))
                          }
                          className={`w-full rounded-xl border p-4 text-left text-sm leading-6 transition ${
                            active
                              ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                              : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'
                          }`}
                        >
                          <span className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-black ${
                                active
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-slate-300 bg-white text-slate-500'
                              }`}
                            >
                              {active ? '✓' : value}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {o}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <button
              type="button"
              onClick={submit}
              disabled={submitting || q.length === 0}
              className="mt-6 rounded-xl bg-slate-950 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? 'Submitting…'
                : 'Submit entry assessment'}
            </button>

            {result && (
              <div
                className={`mt-6 rounded-3xl p-6 ${
                  result.error
                    ? 'bg-rose-50'
                    : 'bg-emerald-50'
                }`}
              >
                <div className="font-black">
                  {result.error
                    ? 'Assessment error'
                    : 'Recommended starting point'}
                </div>

                {result.error ? (
                  <div className="mt-2 text-sm text-rose-700">
                    {result.error}
                  </div>
                ) : (
                  <>
                    <div className="mt-2">
                      Score: {result.score}%
                    </div>
                    <div>
                      Suggested level: {result.recommended_level}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </ApplicationShell>
  )
}
