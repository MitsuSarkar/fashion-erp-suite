import { useState } from 'react'
import { api } from '../lib/rest'
export default function VariantMatrix({style}:{style:any}){
  const [colors, setColors] = useState<string>('Black,White,Navy')
  const [sizes, setSizes] = useState<string>('XS,S,M,L,XL')
  const [price, setPrice] = useState<number>(Number(style?.defaultPrice||12.99))
  const [cost, setCost] = useState<number>(Number(style?.cost||5))
  const [msg, setMsg] = useState<string>('')
  async function generate(){
    const listC = colors.split(',').map(s=>s.trim()).filter(Boolean)
    const listS = sizes.split(',').map(s=>s.trim()).filter(Boolean)
    const res = await api.generateVariants(style.id, listC, listS, price, cost)
    setMsg(`Generated ${res.created} SKUs`)
  }
  return (
    <div className="space-y-3 p-3 border rounded-2xl">
      <div className="text-sm text-muted-foreground">Variant Matrix</div>
      <div className="grid md:grid-cols-4 gap-3">
        <div><label className="text-sm">Colors (comma)</label><input className="px-3 py-2 rounded-xl border w-full" value={colors} onChange={e=>setColors(e.target.value)} /></div>
        <div><label className="text-sm">Sizes (comma)</label><input className="px-3 py-2 rounded-xl border w-full" value={sizes} onChange={e=>setSizes(e.target.value)} /></div>
        <div><label className="text-sm">Price</label><input type="number" className="px-3 py-2 rounded-xl border w-full" value={price} onChange={e=>setPrice(Number(e.target.value))} /></div>
        <div><label className="text-sm">Cost</label><input type="number" className="px-3 py-2 rounded-xl border w-full" value={cost} onChange={e=>setCost(Number(e.target.value))} /></div>
      </div>
      <button className="px-3 py-2 rounded-xl border" onClick={generate}>Generate SKUs</button>
      {msg && <div className="text-sm text-green-600">{msg}</div>}
    </div>
  )
}
