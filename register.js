import { useState } from 'react'
import api from './utils/api'
import { useRouter } from 'next/router'

export default function Register(){
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleRegister(e){
    e.preventDefault()
    try{
      await api.post('/auth/register/', { username, email, password })
      alert('Registered — please login')
      router.push('/auth/login')
    }catch(err){
      alert('Register failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      <form onSubmit={handleRegister} className="space-y-3">
        <input className="w-full p-2 border" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full p-2 border" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-rwanda-600 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  )
}
