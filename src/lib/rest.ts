// Use Vite proxy in dev; in prod use VITE_API_URL
export const API_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '')

function authHeader() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return t ? { Authorization: `Bearer ${t}` } : {}
}
function orgHeader() {
  const id = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null
  return id ? { 'X-Org-ID': id } : {}
}

export class HttpError extends Error {
  status: number; body?: string
  constructor(message:string, status:number, body?:string){ super(message); this.status=status; this.body=body }
}

export async function http(path: string, opts: RequestInit = {}) {
  const hasBody = (opts as any).body != null
  const headers: Record<string,string> = {
    ...orgHeader(), ...authHeader(),
    ...(opts.headers as Record<string,string> | undefined)
  }
  if (hasBody && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers })
  if (!res.ok) { let text=''; try{ text=await res.text() }catch{}; throw new HttpError(`HTTP ${res.status}`, res.status, text) }
  if (res.status === 204) return null
  const ct = res.headers.get('content-type') || ''; return ct.includes('application/json') ? res.json() : res.text()
}

export const api = {
  // orgs
  orgs: {
    list: () => http('/api/orgs'),
    create: (name:string, color?:string) => http('/api/orgs', { method:'POST', body: JSON.stringify({ name, color }) }),
    remove: (id:number) => http(`/api/orgs/${id}`, { method:'DELETE' }),
  },
  // existing endpoints
  list: (ek: string) => http(`/api/${ek}`),
  get: (ek: string, id: number | string) => http(`/api/${ek}/${id}`),
  create: (ek: string, body: any) => http(`/api/${ek}`, { method: 'POST', body: JSON.stringify(body) }),
  update: (ek: string, id: number | string, body: any) => http(`/api/${ek}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (ek: string, id: number | string) => http(`/api/${ek}/${id}`, { method: 'DELETE' }),
  importCsv: (ek: string, csv: string) => http(`/api/${ek}/import`, { method: 'POST', body: JSON.stringify({ csv }) }),
  exportCsv: (ek: string) => http(`/api/${ek}/export`),
  login: (email: string, password: string) => http('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => http('/api/auth/me'),
  generateVariants: (styleId: number, colors: string[], sizes: string[], price: number, cost: number) =>
    http(`/api/merch/styles/${styleId}/generate-variants`, { method: 'POST', body: JSON.stringify({ colors, sizes, price, cost }) }),
  poTransition: (id: number, action: string) => http(`/api/proc/purchaseOrders/${id}/${action}`, { method: 'POST' }),
  dashboard: (init?: RequestInit) => http('/api/reports/dashboard', init),
}
