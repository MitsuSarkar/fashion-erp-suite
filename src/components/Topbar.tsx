import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { setTheme, presetBrand, applyPreset, setPrimaryHex, getPrimaryHex, isBuiltin } from '../lib/theme'
import BrandMenu from './BrandMenu'

export default function Topbar(){
  const { config, role, setRole } = useAppStore()

  const [mode, setMode] = useState<'light'|'dark'>(() => (localStorage.getItem('theme') as any) || 'light')
  const [brand, setBrand] = useState<string>(() => localStorage.getItem('brand') || 'default')
  const [accent, setAccent] = useState<string>(() => getPrimaryHex() || '#4f46e5')

  useEffect(()=>{ setTheme(mode) }, [mode])

  // Apply brand when changed
  useEffect(()=>{
    if (isBuiltin(brand)) presetBrand(brand as any)
    else applyPreset(brand)
    localStorage.setItem('brand', brand)
    try { setAccent(getPrimaryHex()) } catch {}
  }, [brand])

  function onPickColor(hex: string){
    setAccent(hex)
    setPrimaryHex(hex)
  }

  return (
    <div className="h-14 border-b bg-card/60 backdrop-blur flex items-center justify-between px-4">
      <div className="font-semibold">
        {config?.appName || 'ERP'}
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          className="px-3 py-1 rounded-xl border"
          onClick={()=>setMode(m => m==='light' ? 'dark' : 'light')}
          title="Toggle light/dark"
        >
          {mode === 'light' ? '🌞 Light' : '🌙 Dark'}
        </button>

        {/* Brand dropdown with Add/Delete inside */}
        <BrandMenu value={brand} onChange={setBrand} />

        {/* Custom accent color */}
        <label className="flex items-center gap-2 px-3 py-1 rounded-xl border cursor-pointer bg-background" title="Accent color">
          <span className="text-sm">Accent</span>
          <input
            type="color"
            value={accent}
            onChange={e=>onPickColor(e.target.value)}
            className="w-6 h-6 rounded"
          />
        </label>

        {/* Role selector (unchanged) */}
        <select className="px-3 py-1 rounded-xl border bg-background" value={role} onChange={e=>setRole(e.target.value)}>
          {config?.roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <button
          className="px-3 py-1 rounded-xl border"
          onClick={()=>{ localStorage.removeItem('token'); window.location.href='/login' }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
