import { useState } from 'react'
import { api } from '../lib/rest'
export default function Login(){
  const [email, setEmail] = useState('admin@demo.local')
  const [password, setPassword] = useState('admin123')
  const [err, setErr] = useState<string|null>(null)
  async function submit(e:any){ e.preventDefault(); setErr(null); try{ const res = await api.login(email,password); localStorage.setItem('token',res.token); window.location.href='/' } catch(e:any){ setErr(e.message) } }
  return (
    <div className="h-screen grid place-items-center">
      <form onSubmit={submit} className="p-6 border rounded-2xl bg-card w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <div className="grid gap-1"><label className="text-sm">Email</label><input className="px-3 py-2 rounded-xl border bg-background" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="grid gap-1"><label className="text-sm">Password</label><input type="password" className="px-3 py-2 rounded-xl border bg-background" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button className="px-3 py-2 rounded-xl border w-full" type="submit">Sign in</button>
      </form>
    </div>
  )
}
