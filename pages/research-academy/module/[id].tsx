import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock3, FileText, LockKeyhole, PlayCircle, Target, Trophy } from 'lucide-react'
import ApplicationShell from '../../../components/ApplicationShell'
import api from '../../../utils/api'

type Lesson = {
  id: number
  order: number
  title: string
  lesson_type: string
  body: string
  video_url?: string
  resource_urls?: string[]
  estimated_minutes?: number
  required?: boolean
  completed?: boolean
  content_quality?: { level: string; characters: number; words: number; minimum_characters: number }
}

type ModuleData = {
  pathway_name?: string
  id: number
  level: number
  title: string
  slug: string
  summary: string
  objectives?: string[]
  estimated_minutes?: number
  estimated_learning_minutes?: number
  lessons: Lesson[]
  quiz?: any
  completed?: boolean
  completed_lesson_count?: number
  required_lesson_count?: number
  resources?: any[]
}

function formatDuration(minutes: number) {
  if (!minutes) return 'Self-paced'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins ? `${hours}h ${mins}m` : `${hours}h`
}

function renderBody(body: string) {
  return (body || '')
    .trim()
    .split(/\n\s*\n/)
    .map((block, index) => {
      const clean = block.trim()
      if (!clean) return null
      if (/^(summary|key ideas|worked example|practice task|check your understanding|learning objectives|why this matters|common mistake|reflection)$/i.test(clean)) {
        return <h3 key={index} className="mt-8 text-lg font-black text-ink first:mt-0">{clean}</h3>
      }
      return <p key={index} className="mt-5 max-w-3xl text-[1.02rem] leading-8 text-graphite-700">{clean}</p>
    })
}

export default function ModulePage() {
  const router = useRouter()
  const id = router.query.id
  const [data, setData] = useState<ModuleData | null>(null)
  const [certs, setCerts] = useState<any>({ modules: [], levels: [], pathways: [] })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [activeLesson, setActiveLesson] = useState(0)
  const [savingLesson, setSavingLesson] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    if (!id) return
    try {
      const [moduleResponse, certResponse] = await Promise.all([
        api.get(`/academy/modules/${id}/`),
        api.get('/academy/certificates/').catch(() => ({ data: { modules: [], levels: [], pathways: [] } })),
      ])
      setData(moduleResponse.data)
      setCerts(certResponse.data)
      const firstOpen = (moduleResponse.data.lessons || []).findIndex((lesson: Lesson) => !lesson.completed)
      setActiveLesson(firstOpen >= 0 ? firstOpen : 0)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'This module is unavailable.')
    }
  }

  useEffect(() => { load() }, [id])

  const lessons = data?.lessons || []
  const currentLesson = lessons[activeLesson] || lessons[0]
  const requiredLessons = lessons.filter((lesson) => lesson.required !== false)
  const completedLessons = requiredLessons.filter((lesson) => lesson.completed).length
  const learningProgress = requiredLessons.length ? Math.round((completedLessons / requiredLessons.length) * 100) : 0
  const allLessonsDone = requiredLessons.length > 0 && completedLessons === requiredLessons.length
  const moduleCertificate = useMemo(
    () => (certs.modules || []).find((c: any) => Number(c.module) === Number(data?.id)),
    [certs.modules, data?.id]
  )

  async function completeLesson(lessonId: number) {
    setSavingLesson(true)
    try {
      await api.post(`/academy/lessons/${lessonId}/complete/`)
      setMessage('Progress saved. You can continue with the next lesson.')
      await load()
    } catch (e: any) {
      setMessage(e?.response?.data?.detail || 'We could not save your progress.')
    } finally {
      setSavingLesson(false)
    }
  }

  async function submitQuiz() {
    if (!data?.quiz) return
    const missing = (data.quiz.questions || []).filter((q: any) => !(answers[String(q.id)] || []).length)
    if (missing.length) {
      setMessage(`Answer all ${missing.length} remaining assessment question${missing.length === 1 ? '' : 's'} before submitting.`)
      return
    }
    setSubmitting(true)
    try {
      const response = await api.post(`/academy/quizzes/${data.quiz.id}/submit/`, { answers })
      setMessage(response.data.passed
        ? `Assessment passed at ${response.data.score}%. Your achievement record has been updated.`
        : `You scored ${response.data.score}%. Review the lessons and try the assessment again.`)
      await load()
    } catch (e: any) {
      setMessage(e?.response?.data?.detail || 'We could not submit the assessment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (error) return <ApplicationShell name="Research Academy" description="Learning module"><main className="rsre-page py-16"><div className="rsre-panel max-w-3xl p-8"><h2 className="text-2xl font-black">This module is locked</h2><p className="mt-3 text-graphite-600">{error}</p><Link href="/research-academy" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 font-black text-white">Back to Academy <ArrowRight size={16} /></Link></div></main></ApplicationShell>
  if (!data) return <ApplicationShell name="Research Academy" description="Learning module"><main className="rsre-page py-16"><div className="rsre-panel p-8 text-graphite-500">Loading your learning workspace…</div></main></ApplicationShell>

  return <ApplicationShell name="Research Academy" description="A structured research-learning workspace.">
    <main className="rsre-page pb-28 pt-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/research-academy" className="inline-flex items-center gap-2 text-sm font-black text-graphite-600 hover:text-ink"><ArrowLeft size={16} /> Academy curriculum</Link>
        <div className="text-sm font-bold text-graphite-500">Level {data.level} · {lessons.length} lessons</div>
      </div>

      <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-graphite-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_320px]">
          <div className="border-b border-graphite-200 p-7 md:p-9 lg:border-b-0 lg:border-r">
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.16em] text-canopy-700">
              <span>Learning module</span><span className="text-graphite-300">/</span><span>{data.pathway_name || `Level ${data.level}`}</span>
            </div>
            <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-ink md:text-5xl">{data.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-graphite-600 md:text-lg">{data.summary}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-parchment-panel px-3.5 py-2 text-xs font-black text-graphite-700"><Clock3 size={14} /> {formatDuration(data.estimated_learning_minutes || data.estimated_minutes || 0)} learning time</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-parchment-panel px-3.5 py-2 text-xs font-black text-graphite-700"><BookOpen size={14} /> {lessons.length} lessons</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-parchment-panel px-3.5 py-2 text-xs font-black text-graphite-700"><FileText size={14} /> {data.resources?.length || 0} resources</span>
              {data.quiz && <span className="inline-flex items-center gap-2 rounded-full bg-gold-50 px-3.5 py-2 text-xs font-black text-gold-700"><Target size={14} /> Assessment {data.quiz.pass_mark}%</span>}
            </div>
          </div>
          <aside className="p-6 md:p-7">
            <div className="text-xs font-black uppercase tracking-[0.15em] text-graphite-500">Your progress</div>
            <div className="mt-2 flex items-end justify-between gap-4"><div className="text-4xl font-black text-ink">{learningProgress}%</div><div className="text-right text-xs font-bold text-graphite-500">{completedLessons}/{requiredLessons.length} required lessons</div></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-parchment-panel"><div className="h-full rounded-full bg-canopy-600 transition-all" style={{ width: `${learningProgress}%` }} /></div>
            <div className="mt-6 space-y-2 text-sm text-graphite-600"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-canopy-600" size={17} /><span>Learn from the lessons before the assessment.</span></div><div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-canopy-600" size={17} /><span>Use the examples and activities to apply the idea.</span></div><div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-canopy-600" size={17} /><span>Pass the assessment to unlock module achievement.</span></div></div>
          </aside>
        </div>
      </section>

      {data.objectives?.length ? <section className="mt-6 rounded-[1.5rem] border border-graphite-200 bg-parchment-panel p-6 md:p-7">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-graphite-500"><Target size={15} /> What you should be able to do</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">{data.objectives.map((objective) => <div key={objective} className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-graphite-200"><Check size={17} className="mt-0.5 shrink-0 text-canopy-600" /><span className="text-sm font-semibold leading-6 text-graphite-700">{objective}</span></div>)}</div>
      </section> : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit lg:sticky lg:top-6">
          <div className="rounded-[1.5rem] border border-graphite-200 bg-white p-4 shadow-sm">
            <div className="px-2 pb-3 text-xs font-black uppercase tracking-[0.16em] text-graphite-500">Module outline</div>
            <div className="space-y-1">{lessons.map((lesson, index) => <button key={lesson.id} type="button" onClick={() => setActiveLesson(index)} className={`w-full rounded-xl px-3 py-3 text-left transition ${activeLesson === index ? 'bg-ink text-white' : 'hover:bg-parchment-panel'}`}>
              <div className="flex gap-3"><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${activeLesson === index ? 'bg-white/10' : lesson.completed ? 'bg-canopy-50 text-canopy-700' : 'bg-parchment-panel text-graphite-500'}`}>{lesson.completed ? '✓' : lesson.order}</span><span className="min-w-0"><span className="block text-sm font-black">{lesson.title}</span><span className={`mt-0.5 block text-[11px] font-bold ${activeLesson === index ? 'text-graphite-300' : 'text-graphite-400'}`}>{formatDuration(lesson.estimated_minutes || 0)}{lesson.required === false ? ' · Optional' : ''}</span></span></div>
            </button>)}</div>
            <div className="mt-4 border-t border-graphite-100 pt-4 text-xs leading-5 text-graphite-500">The outline stays with you while you learn. You can return to any lesson you have already opened.</div>
          </div>
        </aside>

        <div className="min-w-0">
          {currentLesson && <article className="rounded-[1.5rem] border border-graphite-200 bg-white shadow-sm">
            <header className="border-b border-graphite-200 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-canopy-700"><span>Lesson {currentLesson.order}</span><span className="text-graphite-300">•</span><span>{currentLesson.lesson_type === 'activity' ? 'Practical activity' : currentLesson.lesson_type === 'video' ? 'Video lesson' : 'Core lesson'}</span></div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-ink md:text-4xl">{currentLesson.title}</h2>
              <div className="mt-4 flex flex-wrap gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-parchment-panel px-3 py-1.5 text-xs font-black text-graphite-600"><Clock3 size={13} /> {formatDuration(currentLesson.estimated_minutes || 0)}</span>{currentLesson.required !== false && <span className="rounded-full bg-canopy-50 px-3 py-1.5 text-xs font-black text-canopy-700">Required</span>}{currentLesson.completed && <span className="rounded-full bg-canopy-50 px-3 py-1.5 text-xs font-black text-canopy-700">Completed</span>}</div>
            </header>
            <div className="p-6 md:p-8">{renderBody(currentLesson.body)}
              {currentLesson.video_url && <a href={currentLesson.video_url} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-xl border border-graphite-200 px-4 py-3 text-sm font-black text-graphite-800 hover:bg-parchment-panel"><PlayCircle size={17} /> Open supporting video</a>}
              {currentLesson.resource_urls?.length ? <div className="mt-8 rounded-2xl bg-parchment-panel p-5"><div className="text-sm font-black text-ink">Supporting resources</div><div className="mt-3 space-y-2">{currentLesson.resource_urls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="block break-all text-sm font-semibold text-canopy-700 hover:underline">{url}</a>)}</div></div> : null}
              <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-graphite-200 pt-6">
                <button type="button" disabled={savingLesson || currentLesson.completed} onClick={() => completeLesson(currentLesson.id)} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black ${currentLesson.completed ? 'bg-canopy-50 text-canopy-700' : 'bg-canopy-600 text-white hover:bg-canopy-700'} disabled:cursor-not-allowed disabled:opacity-70`}>{currentLesson.completed ? <CheckCircle2 size={17} /> : <Check size={17} />}{currentLesson.completed ? 'Lesson completed' : savingLesson ? 'Saving…' : 'Mark lesson complete'}</button>
                <div className="flex gap-2"><button type="button" disabled={activeLesson === 0} onClick={() => setActiveLesson((v) => Math.max(0, v - 1))} className="rounded-xl border border-graphite-200 px-4 py-3 text-sm font-black text-graphite-700 disabled:opacity-40">Previous</button><button type="button" disabled={activeLesson >= lessons.length - 1} onClick={() => setActiveLesson((v) => Math.min(lessons.length - 1, v + 1))} className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-black text-white disabled:opacity-40">Next <ArrowRight size={16} /></button></div>
              </div>
            </div>
          </article>}

          {data.quiz && <section className={`mt-6 rounded-[1.5rem] border p-6 md:p-8 ${allLessonsDone ? 'border-gold-300/60 bg-white' : 'border-graphite-200 bg-parchment-panel'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-gold-700"><Target size={15} /> Module assessment</div><h2 className="mt-2 text-2xl font-black text-ink">{data.quiz.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600">Pass mark: {data.quiz.pass_mark}%. All required lessons must be completed before the assessment is used as evidence of module completion.</p></div>{!allLessonsDone && <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-graphite-500 ring-1 ring-graphite-200"><LockKeyhole size={14} /> Complete lessons first</span>}</div>
            <div className="mt-7 space-y-5">{(data.quiz.questions || []).map((q: any) => <div key={q.id} className={`rounded-2xl border bg-white p-5 ${allLessonsDone ? 'border-graphite-200' : 'border-graphite-200 opacity-75'}`}><div className="font-black leading-6 text-ink">{q.order}. {q.prompt}</div><div className="mt-4 grid gap-2">{q.choices.map((choice: any) => <label key={choice.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-graphite-200 p-3.5 hover:bg-parchment-panel"><input type="radio" name={`q-${q.id}`} disabled={!allLessonsDone} checked={(answers[String(q.id)] || [])[0] === String(choice.id)} onChange={() => setAnswers((current) => ({ ...current, [q.id]: [String(choice.id)] }))} className="mt-1" /><span className="text-sm font-semibold leading-6 text-graphite-700">{choice.text}</span></label>)}</div></div>)}</div>
            <button type="button" disabled={!allLessonsDone || submitting} onClick={submitQuiz} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gold-700 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Submitting…' : 'Submit assessment'} <ArrowRight size={16} /></button>
          </section>}

          <section className="mt-6 rounded-[1.5rem] border border-graphite-200 bg-ink p-6 text-white md:p-8">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-canopy-300"><Trophy size={15} /> Evidence of learning</div>
            <h2 className="mt-2 text-2xl font-black">Finish the work, then keep the record.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-parchment/70">RSRE separates learning progress from credentials. Completing lessons is one part of the journey; assessment performance determines whether the module achievement can be issued.</p>
            <div className="mt-6 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-white/5 p-4"><div className="text-xs font-black uppercase tracking-wider text-graphite-400">Lessons</div><div className="mt-1 text-2xl font-black">{completedLessons}/{requiredLessons.length}</div></div><div className="rounded-2xl bg-white/5 p-4"><div className="text-xs font-black uppercase tracking-wider text-graphite-400">Assessment</div><div className="mt-1 text-2xl font-black">{data.quiz ? `${data.quiz.pass_mark}% pass` : 'Not attached'}</div></div><div className="rounded-2xl bg-white/5 p-4"><div className="text-xs font-black uppercase tracking-wider text-graphite-400">Credential</div><div className="mt-1 text-2xl font-black">{moduleCertificate ? 'Issued' : 'Not yet earned'}</div></div></div>
            <div className="mt-6 flex flex-wrap gap-3">{moduleCertificate && <Link href={`/research-academy/certificate/${moduleCertificate.certificate_id}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-ink">View certificate <ArrowRight size={15} /></Link>}<Link href="/research-academy/certificates" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-black text-white">My credentials <ArrowRight size={15} /></Link></div>
          </section>
        </div>
      </section>
      {message && <div className="sticky bottom-20 z-20 mt-6 rounded-2xl bg-ink px-5 py-4 text-center text-sm font-bold text-white shadow-xl">{message}</div>}
    </main>
  </ApplicationShell>
}
