import { useState } from 'react'
import type { EntitySchema, Field } from '../types'

function coerceValue(field: Field, raw: any) {
  if (raw === '' || raw === undefined) return ''
  switch (field.type) {
    case 'number':
    case 'currency':
      return Number(raw)
    case 'boolean':
      return raw === true || raw === 'true'
    default:
      return raw
  }
}

export default function EntityForm({
  schema, initial, onSubmit, onCancel
}:{schema:EntitySchema; initial?:any; onSubmit:(vals:any)=>void; onCancel:()=>void}){
  const [form, setForm] = useState<any>(()=>{
    const b:any = {}; schema.fields.forEach(f=>b[f.name] = initial?.[f.name] ?? ''); return b
  })
  function update(n:string,v:any){ setForm((s:any)=>({...s,[n]:v})) }
  function submit(e:any){
    e.preventDefault()
    // coerce before send (numbers/currency become numbers, etc.)
    const body:any = {}
    for (const f of schema.fields) body[f.name] = coerceValue(f, form[f.name])
    onSubmit(body)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {schema.fields.map(f=>(
        <div key={f.name} className="grid gap-1">
          <label className="text-sm text-muted-foreground">{f.label}</label>

          {f.type === 'select' && f.options ? (
            <select className="px-3 py-2 rounded-xl border bg-background"
                    value={String(form[f.name] ?? '')}
                    onChange={e=>update(f.name, e.target.value)}>
              <option value="">— select —</option>
              {f.options.map(opt=><option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input
              type={f.type === 'number' || f.type === 'currency' ? 'number' : 'text'}
              className="px-3 py-2 rounded-xl border bg-background"
              value={String(form[f.name] ?? '')}
              onChange={e=>update(f.name, e.target.value)}
            />
          )}
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button type="submit" className="px-3 py-2 rounded-xl border">Save</button>
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-xl border">Cancel</button>
      </div>
    </form>
  )
}
