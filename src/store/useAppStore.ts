import { create } from 'zustand'
import type { AppConfig } from '../types'
type State = { config:AppConfig|null; role:string; setConfig:(c:AppConfig)=>void; setRole:(r:string)=>void }
export const useAppStore = create<State>((set)=>({ config:null, role: localStorage.getItem('role')||'admin', setConfig:(c)=>set({config:c}), setRole:(r)=>{localStorage.setItem('role',r); set({role:r})} }))
