import { useEffect, useState } from 'react'
import api from '../../utils/api'

export default function FounderDashboard(){
  const [metrics, setMetrics] = useState(null)

  useEffect(()=>{
    api.get('/metrics/founder-dashboard/').then(r=>setMetrics(r.data)).catch(()=>setMetrics(null))
  },[])

  if(!metrics) return <div>Loading metrics…</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Founder Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded">Total articles<div className="text-2xl font-bold">{metrics.total_articles}</div></div>
        <div className="p-4 border rounded">Published<div className="text-2xl font-bold">{metrics.published_articles}</div></div>
        <div className="p-4 border rounded">Pending<div className="text-2xl font-bold">{metrics.pending_submissions}</div></div>
        <div className="p-4 border rounded">Registered users<div className="text-2xl font-bold">{metrics.registered_users}</div></div>
      </div>
    </div>
  )
}
