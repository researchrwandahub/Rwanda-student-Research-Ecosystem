import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, BookOpen, Home, LayoutDashboard, Menu, Search, Sparkles, X } from 'lucide-react'
import api, { absoluteUrl } from '../utils/api'

const primaryNav = [
  ['/', 'Home'],
  ['/articles', 'RSJH Journal'],
  ['/research-academy', 'Academy'],
  ['/research-discovery', 'Discovery'],
  ['/research-opportunities', 'Opportunities'],
  ['/research-incubator', 'Incubator'],
  ['/research-passport', 'Passport'],
  ['/about', 'About'],
]

const workspaceNav = [
  ['/research-sandbox','Research Sandbox'],
  ['/collaboration','Collaboration Network'],
  ['/ethics-compliance','Ethics & Compliance'],
  ['/events-training','Events & Training'],
  ['/research-analytics','Research Analytics'],
  ['/medtech-ai','MedTech AI'],
]

export default function Header() {
  const [user,setUser]=useState(null)
  const [unread,setUnread]=useState(0)
  const [open,setOpen]=useState(false)

  async function refresh(){
    if(typeof window==='undefined') return
    const token=localStorage.getItem('rmsjToken')
    if(!token){setUser(null);setUnread(0);return}
    try{
      const [profileRes,notesRes]=await Promise.all([api.get('/profile/'),api.get('/notifications/')])
      setUser(profileRes.data)
      localStorage.setItem('rmsjUser',JSON.stringify(profileRes.data))
      const notes=Array.isArray(notesRes.data)?notesRes.data:(notesRes.data?.results||[])
      setUnread(notes.filter(n=>!n.is_read).length)
    }catch{
      try{setUser(JSON.parse(localStorage.getItem('rmsjUser')||'null'))}catch{setUser(null)}
    }
  }

  useEffect(()=>{refresh();const onChange=()=>refresh();window.addEventListener('rmsj-auth-changed',onChange);return()=>window.removeEventListener('rmsj-auth-changed',onChange)},[])
  const dashboard=user?.role==='administrator'?'/rsre-admin':'/dashboard'

  function logout(){
    if(typeof window==='undefined') return
    ;['rmsjToken','rmsjRefresh','rmsjRefreshToken','rmsjRole','rmsjUsername','rmsjFullName','rmsjUser'].forEach(k=>localStorage.removeItem(k))
    window.dispatchEvent(new Event('rmsj-auth-changed'))
    window.location.href='/'
  }

  return <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
    <div className="rsre-topbar hidden sm:block">
      <div className="rsre-page flex min-h-[34px] items-center justify-between gap-4 text-xs font-bold">
        <span className="inline-flex items-center gap-2 text-emerald-100"><Sparkles size={13}/> Research learning, discovery, collaboration and publication</span>
        <Link href="/support-rsre" className="text-emerald-200 hover:text-white">Support RSRE</Link>
      </div>
    </div>
    <div className="rsre-page flex min-h-[76px] items-center justify-between gap-4 py-3">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 ring-1 ring-slate-200"><img src="/logo.png" alt="RSRE" className="h-10 w-10 object-contain"/></div>
        <div className="hidden sm:block"><div className="text-sm font-black text-slate-950">RSRE</div><div className="text-[11px] text-slate-500">Rwanda Student Research Ecosystem</div></div>
      </Link>
      <nav className="hidden items-center gap-1 lg:flex">
        {primaryNav.map(([href,label])=><Link key={href} href={href} className="rsre-nav">{label}</Link>)}
        <div className="group relative"><button className="rsre-nav">Research tools</button><div className="pointer-events-none absolute right-0 top-10 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:pointer-events-auto group-hover:opacity-100">{workspaceNav.map(([href,label])=><Link key={href} href={href} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{label}</Link>)}</div></div>
      </nav>
      <div className="flex items-center gap-1.5">
        <Link href="/research-discovery" className="hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 sm:inline-flex" aria-label="Search research"><Search size={19}/></Link>
        {user?<><Link href="/notifications" className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100"><Bell size={19}/>{unread>0&&<span className="absolute right-1 top-1 min-w-4 rounded-full bg-rose-600 px-1 text-[9px] font-black leading-4 text-center text-white">{unread>9?'9+':unread}</span>}</Link><Link href={dashboard} className="hidden items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-sm font-black text-white md:inline-flex"><LayoutDashboard size={16}/>{user.role==='administrator'?'Control Center':'My Dashboard'}</Link><button onClick={logout} className="hidden rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-black text-rose-700 sm:inline-flex">Logout</button></>:<><Link href="/auth/login" className="hidden rounded-xl px-3.5 py-2.5 text-sm font-black text-slate-700 sm:inline-flex">Sign in</Link><Link href="/auth/register" className="rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-black text-white">Join RSRE</Link></>}
        <button onClick={()=>setOpen(!open)} className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden">{open?<X size={19}/>:<Menu size={19}/>}</button>
      </div>
    </div>
    {open&&<div className="border-t border-slate-200 bg-white lg:hidden"><div className="rsre-page grid gap-1 py-3 pb-5 text-sm font-bold max-h-[70vh] overflow-y-auto">{primaryNav.concat(workspaceNav).map(([href,label])=><Link key={href} className="rsre-mobile-link" href={href} onClick={()=>setOpen(false)}>{label}</Link>)}{user?<><Link className="rsre-mobile-link" href={dashboard} onClick={()=>setOpen(false)}>Dashboard</Link><Link className="rsre-mobile-link" href="/notifications" onClick={()=>setOpen(false)}>Notifications {unread>0&&`(${unread})`}</Link><Link className="rsre-mobile-link" href="/profile" onClick={()=>setOpen(false)}>Profile</Link><button className="rsre-mobile-link text-left text-rose-700" onClick={logout}>Logout</button></>:<Link className="rsre-mobile-link text-emerald-700" href="/auth/login" onClick={()=>setOpen(false)}>Sign in</Link>}</div></div>}
    <nav className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,.10)] backdrop-blur-xl sm:hidden" aria-label="Mobile primary navigation">
      {[["/","Home",Home],["/articles","Journal",BookOpen],["/research-academy","Academy",BookOpen],["/research-incubator","Build",LayoutDashboard]].map(([href,label,Icon])=>{const I=Icon;return <Link key={href} href={href} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-black text-slate-500 active:bg-slate-50"><I size={17}/><span>{label}</span></Link>})}
      <button type="button" onClick={()=>setOpen(!open)} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-black text-slate-500 active:bg-slate-50"><Menu size={17}/><span>More</span></button>
    </nav>
  </header>
}
