import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FlaskConical,
  GraduationCap,
  Layers3,
  Lock,
  Play,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import ApplicationShell from '../../components/ApplicationShell'
import api from '../../utils/api'

type Module = {
  id: number
  order: number
  title: string
  summary?: string
  estimated_minutes?: number
  lessons?: any[]
  unlocked?: boolean
  completed?: boolean
  lesson_completed?: number
  lesson_total?: number
}

type Level = {
  id: number
  number: number
  name: string
  description?: string
  unlocked?: boolean
  completed?: boolean
  modules?: Module[]
}

type Pathway = {
  id: number
  name: string
  description?: string
  unlocked?: boolean
  completed?: boolean
  modules?: Module[]
}

const pathwayStages = [
  {
    number: '01',
    title: 'Starter',
    description: 'Research vocabulary, scientific thinking and integrity.',
    icon: BookOpen,
  },
  {
    number: '02',
    title: 'Foundations',
    description: 'Questions, study designs, ethics, evidence and statistics.',
    icon: Layers3,
  },
  {
    number: '03',
    title: 'Applied',
    description: 'Protocols, data, analysis and real research projects.',
    icon: FlaskConical,
  },
  {
    number: '04',
    title: 'Professional',
    description: 'Publication, peer review, leadership and mentoring.',
    icon: GraduationCap,
  },
]

function formatDuration(minutes = 60) {
  if (minutes < 60) return `${Math.max(1, minutes)} min`

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return mins ? `${hours}h ${mins}m` : `${hours}h`
}

function getModuleProgress(module: Module) {
  const total =
    module.lesson_total ??
    module.lessons?.length ??
    0

  const completed = module.lesson_completed ?? 0

  if (!total) return 0

  return Math.min(100, Math.round((completed / total) * 100))
}

export default function Academy({ initialData }: { initialData: any }) {
  const data = initialData || null
  const courses: any[] = []
  const loading = false
  const error = data ? "" : "The Research Academy is being prepared for launch."

const levels: Level[] = data?.levels || []
  const pathways: Pathway[] = data?.specialist_pathways || []

  const coreModules = useMemo(
    () => levels.flatMap((level) => level.modules || []),
    [levels]
  )

  const specialistModules = useMemo(
    () => pathways.flatMap((pathway) => pathway.modules || []),
    [pathways]
  )

  const allModules = [...coreModules, ...specialistModules]

  const lessonCount = allModules.reduce(
    (total, module) =>
      total +
      (module.lesson_total ??
        module.lessons?.length ??
        0),
    0
  )

  const completedModules = allModules.filter(
    (module) => module.completed
  ).length

  const overallProgress = allModules.length
    ? Math.round((completedModules / allModules.length) * 100)
    : 0

  const start = (id: number) => {
    if (typeof window === 'undefined') return

    if (!localStorage.getItem('rmsjToken')) {
      window.location.href = `/auth/login?next=/research-academy/module/${id}`
      return
    }

    window.location.href = `/research-academy/module/${id}`
  }

  return (
    <ApplicationShell
      name="Research Academy"
      description="Health research training and competency development."
      nav={[
        ['/research-academy', 'Academy Home'],
        ['/research-academy/dashboard', 'My Learning'],
        ['/research-academy/diagnostic', 'Entry Assessment'],
        ['/research-academy/certificates', 'Certificates'],
        ['/research-academy/questions', 'Questions'],
      ]}
    >
      <main className="min-h-screen bg-[#071018] text-white">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(42,151,126,0.22),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(53,110,168,0.2),transparent_32%)]" />

          <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
            <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  <Sparkles size={14} />
                  Research capacity
                </div>

                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Learn the craft of research.
                  <span className="block text-emerald-300">
                    Then put it into practice.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  Build practical health-research skills from your first
                  research question through evidence, methods, ethics,
                  analysis, publication and independent research practice.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/research-academy/diagnostic"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
                  >
                    <Target size={18} />
                    Take entry assessment
                  </Link>

                  <Link
                    href="/research-academy/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    <BookOpen size={18} />
                    My learning
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Your academy
                    </p>
                    <p className="mt-1 text-xl font-bold text-white">
                      Learning progress
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
                    <GraduationCap size={22} />
                  </div>
                </div>

                <div className="mt-7">
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-white">
                      {overallProgress}%
                    </span>
                    <span className="text-sm text-slate-400">
                      {completedModules}/{allModules.length || 0} modules
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/8 bg-black/10 p-4">
                    <div className="text-2xl font-black text-white">
                      {levels.length}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Learning levels
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/8 bg-black/10 p-4">
                    <div className="text-2xl font-black text-white">
                      {lessonCount}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Lessons
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-b border-white/10 bg-[#0a151f]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 sm:grid-cols-4 lg:grid-cols-5">
            {[
              [levels.length, 'Levels'],
              [pathways.length, 'Specialist pathways'],
              [coreModules.length, 'Core modules'],
              [lessonCount, 'Lessons'],
              [courses.length, 'Published courses'],
            ].map(([value, label]) => (
              <div
                key={String(label)}
                className="px-4 py-5 sm:px-6 lg:py-6"
              >
                <div className="text-2xl font-black text-white sm:text-3xl">
                  {value}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* LOADING */}
          {loading && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
                />
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-8 shadow-2xl sm:p-12">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative mx-auto max-w-3xl text-center">
                <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_60px_rgba(52,211,153,0.12)]">
                  <div className="h-10 w-10 animate-pulse rounded-full border-2 border-emerald-300/70 border-t-transparent" />
                </div>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Academy in preparation
                </div>

                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  The Research Academy is taking shape
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  We’re working with researchers, mentors and lecturers to prepare practical,
                  high-quality research modules—not just theory.
                </p>

                <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        Preparing for launch
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        The first learning modules will be released as soon as they are ready.
                        We’ll share an update here when the Academy launches.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/research-discovery"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300"
                  >
                    Explore Research Discovery
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/research-opportunities"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08]"
                  >
                    Find opportunities
                  </Link>
                </div>

                <p className="mt-7 text-xs font-medium tracking-wide text-slate-500">
                  Thank you for your patience—we’re building the Academy carefully.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* PATHWAY */}
              <section>
                <div className="max-w-3xl">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Professional pathway
                  </div>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                    Progress from first principles to independent research.
                  </h2>
                  <p className="mt-3 text-base leading-7 text-slate-400">
                    Start with the fundamentals, build methodological
                    confidence and progressively move toward real research
                    production and publication.
                  </p>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {pathwayStages.map((stage) => {
                    const Icon = stage.icon

                    return (
                      <div
                        key={stage.number}
                        className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 transition hover:-translate-y-0.5 hover:border-emerald-400/20"
                      >
                        <div className="flex items-start justify-between">
                          <div className="text-sm font-black text-emerald-300">
                            {stage.number}
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/10 p-2.5 text-slate-300">
                            <Icon size={18} />
                          </div>
                        </div>

                        <h3 className="mt-8 text-lg font-bold text-white">
                          {stage.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {stage.description}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* CORE CURRICULUM */}
              <section className="mt-16">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                      Core curriculum
                    </div>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                      Your research learning path
                    </h2>
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-400">
                    {coreModules.length} modules
                  </div>
                </div>

                <div className="mt-8 space-y-8">
                  {levels.map((level) => (
                    <section key={level.id}>
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-300">
                              Level {level.number}
                            </span>

                            {level.completed && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300">
                                <CheckCircle2 size={14} />
                                Completed
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 text-2xl font-black text-white">
                            {level.name}
                          </h3>

                          {level.description && (
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                              {level.description}
                            </p>
                          )}
                        </div>

                        <div className="text-sm text-slate-500">
                          {level.modules?.length || 0} modules
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {(level.modules || []).map((module) => {
                          const progress = getModuleProgress(module)

                          return (
                            <article
                              key={module.id}
                              className={`group relative overflow-hidden rounded-2xl border transition ${
                                module.unlocked
                                  ? 'border-white/10 bg-gradient-to-br from-[#10202a] to-[#0b151d] hover:border-emerald-400/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]'
                                  : 'border-white/8 bg-white/[0.025]'
                              }`}
                            >
                              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />

                              <div className="p-5 sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex min-w-0 gap-4">
                                    <div
                                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                                        module.completed
                                          ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                                          : module.unlocked
                                          ? 'border-white/10 bg-white/5 text-slate-300'
                                          : 'border-white/5 bg-white/[0.02] text-slate-600'
                                      }`}
                                    >
                                      {module.completed ? (
                                        <CheckCircle2 size={20} />
                                      ) : module.unlocked ? (
                                        <BookOpen size={20} />
                                      ) : (
                                        <Lock size={18} />
                                      )}
                                    </div>

                                    <div className="min-w-0">
                                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        Module {module.order}
                                      </div>

                                      <h4 className="mt-1 text-base font-bold leading-6 text-white">
                                        {module.title}
                                      </h4>

                                      {module.summary && (
                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                                          {module.summary}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {module.unlocked && (
                                    <ArrowRight
                                      size={18}
                                      className="shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-300"
                                    />
                                  )}
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <BookOpen size={14} />
                                    {module.lesson_total ??
                                      module.lessons?.length ??
                                      0}{' '}
                                    lessons
                                  </div>

                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Clock3 size={14} />
                                    {formatDuration(
                                      module.estimated_minutes || 60
                                    )}
                                  </div>
                                </div>

                                {module.unlocked && (
                                  <div className="mt-5">
                                    <div className="mb-2 flex items-center justify-between text-xs">
                                      <span className="text-slate-500">
                                        Progress
                                      </span>
                                      <span className="font-semibold text-slate-300">
                                        {progress}%
                                      </span>
                                    </div>

                                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                      <div
                                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="mt-6">
                                  {module.unlocked ? (
                                    <button
                                      onClick={() => start(module.id)}
                                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400/15 hover:text-emerald-100"
                                    >
                                      <Play size={15} fill="currentColor" />
                                      {module.completed
                                        ? 'Review module'
                                        : progress > 0
                                        ? 'Continue learning'
                                        : 'Start learning'}
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/10 px-4 py-3 text-xs text-slate-500">
                                      <Lock size={14} />
                                      Complete the required previous learning
                                      first.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </section>

              {/* SPECIALIST PATHWAYS */}
              <section className="mt-16">
                <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                      Specialist pathways
                    </div>

                    <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                      Go deeper when your research direction becomes clearer.
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-slate-400">
                      Specialist pathways add focused practical depth without
                      skipping the research foundations needed to work safely
                      and rigorously.
                    </p>

                    <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
                      <Users size={17} />
                      Designed for focused research development
                    </div>
                  </div>

                  <div className="space-y-3">
                    {pathways.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-500">
                        No specialist pathways are currently available.
                      </div>
                    ) : (
                      pathways.map((pathway) => (
                        <div
                          key={pathway.id}
                          className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-emerald-400/20 hover:bg-white/[0.05]"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    pathway.unlocked
                                      ? 'bg-emerald-400'
                                      : 'bg-slate-600'
                                  }`}
                                />
                                <h3 className="font-bold text-white">
                                  {pathway.name}
                                </h3>
                              </div>

                              {pathway.description && (
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                                  {pathway.description}
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 items-center gap-3 text-sm text-slate-500">
                              <span>
                                {pathway.modules?.length || 0} modules
                              </span>
                              <ChevronRight
                                size={17}
                                className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-300"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              {/* FINAL CTA */}
              <section className="mt-16 overflow-hidden rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-emerald-400/10 via-white/[0.03] to-transparent">
                <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                      Your next step
                    </div>

                    <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                      Start where your current research skills are.
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                      Take the entry assessment to identify a suitable starting
                      level, or jump directly into your learning dashboard.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <Link
                      href="/research-academy/diagnostic"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
                    >
                      Take assessment
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      href="/research-academy/dashboard"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Open my learning
                    </Link>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </ApplicationShell>
  )
}







export async function getServerSideProps() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/academy/", {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Academy API returned ${response.status}`)
    }

    const initialData = await response.json()

    return {
      props: {
        initialData,
      },
    }
  } catch (error) {
    console.error("ACADEMY SERVER LOAD ERROR:", error)

    return {
      props: {
        initialData: null,
      },
    }
  }
}
