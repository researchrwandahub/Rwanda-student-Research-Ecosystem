import { useEffect, useState } from 'react'
import api from '../../utils/api'
import Link from 'next/link'

export default function AuthorDashboard(){
  const [submissions, setSubmissions] = useState([])

  useEffect(()=>{
    // requires authenticated request
    api.get('/articles/?author_me=true').then(r=>setSubmissions(r.data.results || r.data)).catch(()=>setSubmissions([]))
  },[])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Author Dashboard</h1>
      <div className="mb-4">
        <Link href="/submit" className="text-white bg-rwanda-700 px-4 py-2 rounded">New Submission</Link>
      </div>
      <div className="grid gap-3">
        {submissions.map(s=> (
          <div key={s.id} className="border p-3 rounded">
            <div className="font-semibold">{s.title}</div>
            <div className="text-sm text-gray-600">State: {s.state}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
