import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { EntitySchema } from '../types'
import { provider } from '../lib/provider'

export default function EntityTable({entityKey, schema, onEdit}:{entityKey:string; schema:EntitySchema; onEdit:(row:any)=>void}){
  const qc = useQueryClient()
  const { data: rows=[] } = useQuery({ queryKey:['list',entityKey], queryFn:()=>provider.list(entityKey) })
  const remove = useMutation({ mutationFn:(id:string)=>provider.remove(entityKey,id), onSuccess:()=>qc.invalidateQueries({queryKey:['list',entityKey]}) })

  async function doExport(){
    const res = await fetch(`${import.meta.env.VITE_API_URL||''}/api/${entityKey}/export`, { headers: { Authorization:`Bearer ${localStorage.getItem('token')||''}` } })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${entityKey}.csv`; a.click(); URL.revokeObjectURL(url)
  }
  function doImport(e:any){
    const file = e.target.files?.[0]; if(!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const csv = String(reader.result)
      await fetch(`${import.meta.env.VITE_API_URL||''}/api/${entityKey}/import`, { method:'POST', headers: { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')||''}` }, body: JSON.stringify({csv}) })
      qc.invalidateQueries({queryKey:['list',entityKey]})
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{entityKey}</div>
        <div className="flex gap-2">
          <label className="btn-outline-primary cursor-pointer">Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={doImport}/>
          </label>
          <button className="btn-outline-primary" onClick={doExport}>Export CSV</button>
          <button className="btn-primary" onClick={()=>onEdit({})}>New</button>
        </div>
      </div>

      <div className="border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {schema.fields.map(f=><th key={f.name} className="text-left px-3 py-2 border-b">{f.label}</th>)}
              <th className="px-3 py-2 border-b w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r:any)=>(
              <tr key={r.id} className="odd:bg-background even:bg-muted/30">
                {schema.fields.map(f=><td key={f.name} className="px-3 py-2 border-b">{String(r[f.name] ?? '')}</td>)}
                <td className="px-3 py-2 border-b">
                  <div className="flex gap-2">
                    <button className="btn-outline-primary" onClick={()=>onEdit(r)}>Edit</button>
                    <button className="btn-outline-primary" onClick={()=>remove.mutate(String(r.id))}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
