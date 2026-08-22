import { useEffect, useState } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { getToken, getCurrentUser } from '../lib/auth.js'

interface ReviewTask {
  id: number
  article: {
    id: number
    title: string
    abstract: string
    author: {
      username: string
      university: string
    }
  }
  accepted: boolean
  completed: boolean
}

export default function ReviewPage() {
  const [tasks, setTasks] = useState<ReviewTask[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState('4')

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const token = getToken()
  const user = getCurrentUser()

  useEffect(() => {
    if (!token || user?.role !== 'reviewer') {
      setLoading(false)
      return
    }

    axios
      .get(`${API_BASE}/api/assignments/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setTasks(response.data))
      .finally(() => setLoading(false))
  }, [token, user])

  const submitReview = async () => {
    if (!selected) return
    try {
      await axios.post(
        `${API_BASE}/api/reviews/`,
        {
          article: selected,
          content: reviewText,
          rating: Number(rating),
          recommendation: 'Accept with revisions',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setMessage('Review submitted successfully.')
      setReviewText('')
    } catch (error: unknown) {
      setMessage('Failed to submit the review.')
    }
  }

  return (
    <Layout>
      <section className="page-shell py-12">
        <div className="light-panel rounded-[2rem] p-10 max-w-5xl mx-auto">
          <p className="section-heading">Review Assignments</p>
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Confidential peer review.</strong> Review only assigned manuscripts, keep manuscript content private, and base recommendations on the journal criteria. Reviewer recommendations do not directly publish an article.</div>
          {loading ? (
            <p>Loading reviewer assignments…</p>
          ) : user?.role !== 'reviewer' ? (
            <p className="text-slate-600">You need a reviewer account to access assignments.</p>
          ) : tasks.length === 0 ? (
            <p className="text-slate-600">No active review assignments yet.</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <article key={task.id} className="card cursor-pointer" onClick={() => setSelected(task.article.id)}>
                    <p className="text-sm uppercase tracking-[0.2em] text-cyan-600">Review task</p>
                    <h2 className="mt-3 text-xl font-semibold text-slate-950">{task.article.title}</h2>
                    <p className="mt-3 text-slate-600">{task.article.abstract}</p>
                    <p className="mt-4 text-sm text-slate-500">Author: {task.article.author.username} · {task.article.author.university}</p>
                  </article>
                ))}
              </div>
              <div className="card">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-600">Write review</p>
                <label className="grid gap-2 text-slate-700 mt-5">
                  Selected article
                  <input className="rounded-3xl border border-slate-200 px-4 py-3 bg-slate-50" value={selected ? tasks.find((task) => task.article.id === selected)?.article.title ?? '' : ''} readOnly />
                </label>
                <label className="grid gap-2 text-slate-700">
                  Recommendation
                  <select className="rounded-3xl border border-slate-200 px-4 py-3" value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value="5">Accept</option>
                    <option value="4">Accept with revisions</option>
                    <option value="3">Major revisions</option>
                    <option value="2">Reject</option>
                  </select>
                </label>
                <label className="grid gap-2 text-slate-700">
                  Review text
                  <textarea className="rounded-3xl border border-slate-200 px-4 py-3" rows={8} value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                </label>
                <button className="call-to-action mt-3" type="button" onClick={submitReview}>Submit Review</button>
                {message && <p className="text-slate-600 mt-4">{message}</p>}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}
