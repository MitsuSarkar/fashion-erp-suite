import { api } from './rest'
export const provider = {
  list: (k:string)=>api.list(k),
  getOne:(k:string,id:string|number)=>api.get(k,id),
  create:(k:string,body:any)=>api.create(k,body),
  update:(k:string,id:string|number,body:any)=>api.update(k,id,body),
  remove:(k:string,id:string|number)=>api.remove(k,id)
}
