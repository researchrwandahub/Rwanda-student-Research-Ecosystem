import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'
import { getToken } from '../lib/auth.js'

type Notice = { id:number; title:string; message:string; is_read:boolean; created_at:string }

export default function NotificationsPage(){
  const [items,setItems]=useState<Notice[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState<number | null>(null)

  useEffect(()=>{
    const token=getToken()
    if(!token){ setError('Please sign in to view your notifications.'); setLoading(false); return }
    api.get('/notifications/',{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>setItems(Array.isArray(r.data)?r.data:r.data?.results||[]))
      .catch(e=>setError(e?.response?.data?.detail||'Unable to load notifications.'))
      .finally(()=>setLoading(false))
  },[])

  async function markRead(id:number){
    setBusy(id)
    try {
      await api.patch(`/notifications/${id}/`, { is_read: true })
      setItems((prev)=>prev.map((item)=>item.id===id?{...item,is_read:true}:item))
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(null)
    }
  }

  async function markAllRead(){
    try {
      await Promise.all(items.filter((item)=>!item.is_read).map((item)=>api.patch(`/notifications/${item.id}/`, { is_read: true })))
      setItems((prev)=>prev.map((item)=>({...item,is_read:true})))
    } catch (e) {
      console.error(e)
    }
  }

  return <Layout>
    <main className="rsre-page py-10 md:py-14">
      <div className="mb-8">
        <p className="rsre-kicker">YOUR RSRE UPDATES</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="mt-2 text-4xl font-black text-slate-950">Notifications</h1>
        <p className="mt-3 text-slate-600">Learning, research, opportunities, collaboration, Passport and journal updates in one place.</p></div>{items.some((item)=>!item.is_read) && <button onClick={markAllRead} className="rsre-action">Mark all read</button>}</div>
      </div>
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}
      {loading ? <div className="rsre-panel p-8 text-slate-500">Loading notifications...</div> : !error && items.length===0 ? <div className="rsre-panel p-10 text-slate-500">You are all caught up.</div> : <div className="rsre-stagger grid gap-4">{items.map(item=><article key={item.id} className={`rsre-panel p-5 ${item.is_read?'opacity-70':'ring-1 ring-blue-100'}`}><div className="flex items-start justify-between gap-5"><div><div className="font-black text-slate-950">{!item.is_read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500 align-middle" />}{item.title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{item.message}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">{new Date(item.created_at).toLocaleDateString()}</span>{!item.is_read && <button disabled={busy===item.id} onClick={()=>markRead(item.id)} className="text-xs font-black text-blue-700">{busy===item.id?"…":"Mark read"}</button>}</div></div></article>)}</div>}
    </main>
  </Layout>
}
