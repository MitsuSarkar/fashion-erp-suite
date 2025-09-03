import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { AppConfig } from '../types'
export default function Settings(){
  const { config, setConfig } = useAppStore()
  const [str, setStr] = useState(JSON.stringify(config, null, 2))
  function apply(){ try{ setConfig(JSON.parse(str) as AppConfig); alert('Applied. Refresh to see nav changes.') }catch(e:any){ alert('Invalid JSON: '+e.message) } }
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Settings / JSON Config</h1>
      <textarea className="w-full h-[60vh] p-3 rounded-2xl border bg-background font-mono text-sm" value={str} onChange={e=>setStr(e.target.value)} />
      <button className="px-3 py-2 rounded-xl border" onClick={apply}>Apply</button>
    </div>
  )
}
