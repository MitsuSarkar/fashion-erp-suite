import { api } from './rest'

// brand → orgId mapping (persisted)
function getMap(): Record<string, number> { try { return JSON.parse(localStorage.getItem('orgMap') || '{}') } catch { return {} } }
function saveMap(m: Record<string, number>) { localStorage.setItem('orgMap', JSON.stringify(m)) }

export async function ensureOrgForBrand(brand: string): Promise<number> {
  const map = getMap()
  if (map[brand]) { localStorage.setItem('orgId', String(map[brand])); return map[brand] }
  const orgs = await api.orgs.list() as any[]
  const found = orgs.find(o => String(o.name).toLowerCase() === brand.toLowerCase())
  let id: number
  if (found) id = found.id
  else id = (await api.orgs.create(brand)).id
  map[brand] = id; saveMap(map)
  localStorage.setItem('orgId', String(id))
  return id
}

export async function deleteOrgForBrand(brand: string){
  const map = getMap()
  const id = map[brand]
  if (id) { await api.orgs.remove(id); delete map[brand]; saveMap(map) }
  if (localStorage.getItem('brand') === brand) {
    localStorage.setItem('brand', 'default')
    localStorage.setItem('orgId', '1') // default org
  }
}
