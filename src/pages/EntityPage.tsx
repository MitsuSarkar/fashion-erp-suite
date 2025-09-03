import { useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import type { EntitySchema } from '../types'
import EntityTable from '../components/EntityTable'
import EntityForm from '../components/EntityForm'
import { provider } from '../lib/provider'
import VariantMatrix from './VariantMatrix'
import { useState } from 'react'
export default function EntityPage(){
  const { moduleId, entity } = useParams()
  const { config } = useAppStore()
  const schema = config?.modules.find(m=>m.id===moduleId)?.entities.find(e=>e.name===entity) as EntitySchema | undefined
  const [open, setOpen] = useState<any|null>(null)
  if(!schema) return <div>Not found</div>
  async function save(vals:any){
    if (open && open.id){ await provider.update(`${moduleId}.${entity}`, open.id, vals) } else { await provider.create(`${moduleId}.${entity}`, vals) }
    setOpen(null)
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">{schema.label}</h1></div>
      {entity==='styles' && open?.id && <VariantMatrix style={open} />}
      <EntityTable entityKey={`${moduleId}.${entity}`} schema={schema} onEdit={(r)=>setOpen(r)} />
      {open !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-card p-4 rounded-2xl w-full max-w-xl border space-y-2">
            <div className="text-lg font-semibold">{open?.id ? 'Edit' : 'Create'} {schema.label}</div>
            <EntityForm schema={schema} initial={open?.id?open:undefined} onSubmit={save} onCancel={()=>setOpen(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
