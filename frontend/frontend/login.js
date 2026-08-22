import { useState } from 'react'
import api from './utils/api'
import { useRouter } from 'next/router'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleLogin(e){
    e.preventDefault()
    try{
      const res = await api.post('/auth/token/', { username: email, password })
      // handle tokens: for production use httpOnly cookies from backend
      localStorage.setItem('access', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)
      router.push('/')
    }catch(err){
      alert('Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="space-y-3">
        <input className="w-full p-2 border" placeholder="Email or username" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-rwanda-600 text-white px-4 py-2 rounded">Login</button>
      </form>
    </div>
  )
}
