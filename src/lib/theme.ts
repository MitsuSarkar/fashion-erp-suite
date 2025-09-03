// src/lib/theme.ts
// Theme + brand presets (built-in + custom), with delete for H&M/M&S via "hide"

export type ThemeMode = 'light' | 'dark'
type PresetRecord = { primary: string; primaryForeground: string }

const BUILTINS = ['default','mands','hm'] as const
export type Builtin = typeof BUILTINS[number]
export type PresetName = Builtin | string

const HIDDEN_KEY = 'brandBuiltinsHidden'

// ---------------- Theme mode ----------------
export function applyThemeFromStorage() {
  try {
    const t = (localStorage.getItem('theme') as ThemeMode) || 'light'
    setTheme(t, false)

    const brand = (localStorage.getItem('brand') as PresetName) || 'default'
    // If a built-in was hidden after being selected, fall back
    if (isBuiltin(brand) && isBuiltinHidden(brand)) {
      localStorage.setItem('brand', 'default')
      presetBrand('default')
      return
    }
    applyPreset(brand)
  } catch {}
}

export function setTheme(mode: ThemeMode, persist = true) {
  const el = document.documentElement
  if (mode === 'dark') el.classList.add('dark')
  else el.classList.remove('dark')
  if (persist) localStorage.setItem('theme', mode)
}

// ---------------- Accent color ----------------
export function setPrimaryHex(hex: string) {
  const hsl = hexToHslString(hex) // "H S% L%"
  document.documentElement.style.setProperty('--primary', hsl)

  // Contrast text for primary
  const { l } = hexToHsl(hex)
  const fg = l < 0.55 ? '0 0% 100%' : '222.2 84% 4.9%'
  document.documentElement.style.setProperty('--primary-foreground', fg)

  localStorage.setItem('primary', hsl)
  localStorage.setItem('primary-foreground', fg)
}

export function getPrimaryHex(): string {
  const cs = getComputedStyle(document.documentElement)
  const hsl = (cs.getPropertyValue('--primary') || '').trim()
  return hslStringToHex(hsl) || '#4f46e5'
}

// ---------------- Built-in presets ----------------
export function presetBrand(name: Builtin) {
  if (name === 'mands') {
    // Marks & Spencer green
    setPrimaryHex('#00563B')
  } else if (name === 'hm') {
    // H&M red
    setPrimaryHex('#E21836')
  } else {
    // Default indigo-600
    const hsl = '221.2 83.2% 53.3%'
    const fg = '210 40% 98%'
    document.documentElement.style.setProperty('--primary', hsl)
    document.documentElement.style.setProperty('--primary-foreground', fg)
    localStorage.setItem('primary', hsl)
    localStorage.setItem('primary-foreground', fg)
  }
}

export function isBuiltin(name: string): boolean {
  return (BUILTINS as readonly string[]).includes(name)
}

// ---------------- Hidden built-ins ----------------
function readHidden(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]')
    return new Set(Array.isArray(raw) ? raw : [])
  } catch { return new Set() }
}
function writeHidden(s: Set<string>) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(s)))
}
export function isBuiltinHidden(name: string) {
  return readHidden().has(name)
}
export function anyBuiltinsHidden() {
  return readHidden().size > 0
}
export function restoreAllBuiltins() {
  writeHidden(new Set())
}

// ---------------- Custom preset storage ----------------
function getCustomMap(): Record<string, PresetRecord> {
  try { return JSON.parse(localStorage.getItem('brandPresets') || '{}') } catch { return {} }
}
function saveCustomMap(map: Record<string, PresetRecord>) {
  localStorage.setItem('brandPresets', JSON.stringify(map))
}

export function listPresets(): PresetName[] {
  // filter built-ins that are not hidden
  const hidden = readHidden()
  const visibleBuiltins = (BUILTINS as readonly string[]).filter(n => !hidden.has(n))
  return [...visibleBuiltins, ...Object.keys(getCustomMap())]
}

export function applyPreset(name: PresetName) {
  if (isBuiltin(name)) {
    // If hidden, ignore apply and fall back
    if (isBuiltinHidden(name)) {
      presetBrand('default')
      localStorage.setItem('brand', 'default')
      return
    }
    presetBrand(name as Builtin)
    localStorage.setItem('brand', name)
    return
  }
  const mp = getCustomMap()
  const rec = mp[name as string]
  if (!rec) {
    presetBrand('default')
    localStorage.setItem('brand', 'default')
    return
  }
  document.documentElement.style.setProperty('--primary', rec.primary)
  document.documentElement.style.setProperty('--primary-foreground', rec.primaryForeground)
  localStorage.setItem('primary', rec.primary)
  localStorage.setItem('primary-foreground', rec.primaryForeground)
  localStorage.setItem('brand', name as string)
}

export function addPreset(name: string): boolean {
  const clean = (name || '').trim()
  if (!clean) return false
  const mp = getCustomMap()
  const current = currentTokens()
  mp[clean] = { primary: current.primary, primaryForeground: current.primaryForeground }
  saveCustomMap(mp)
  localStorage.setItem('brand', clean)
  return true
}

export function renamePreset(oldName: string, newName: string): boolean {
  const from = (oldName || '').trim()
  const to = (newName || '').trim()
  if (!from || !to || from === to) return false

  // Built-ins: duplicate to new name (can't overwrite the built-in)
  if (isBuiltin(from)) {
    return addPreset(to)
  }

  const mp = getCustomMap()
  if (!(from in mp)) return false
  mp[to] = mp[from]
  delete mp[from]
  saveCustomMap(mp)
  localStorage.setItem('brand', to)
  return true
}

export function deletePreset(name: string): boolean {
  const clean = (name || '').trim()
  if (!clean) return false

  if (isBuiltin(clean)) {
    // "Delete" for built-ins == hide from the list
    const hidden = readHidden()
    hidden.add(clean)
    writeHidden(hidden)

    // If currently selected, fall back
    if (localStorage.getItem('brand') === clean) {
      localStorage.setItem('brand', 'default')
      presetBrand('default')
    }
    return true
  }

  const mp = getCustomMap()
  if (!(clean in mp)) return false
  delete mp[clean]
  saveCustomMap(mp)
  if (localStorage.getItem('brand') === clean) {
    localStorage.setItem('brand', 'default')
    presetBrand('default')
  }
  return true
}

function currentTokens() {
  const cs = getComputedStyle(document.documentElement)
  const primary = (cs.getPropertyValue('--primary') || '').trim()
  const primaryForeground = (cs.getPropertyValue('--primary-foreground') || '').trim()
  return { primary, primaryForeground }
}

// ---------------- Color utils ----------------
function hexToRgb(hex: string) {
  const h = hex.replace('#','')
  const v = h.length === 3 ? h.split('').map(c=>c+c).join('') : h
  const bigint = parseInt(v, 16)
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
}
function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const r1 = r/255, g1 = g/255, b1 = b/255
  const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break
      case g1: h = (b1 - r1) / d + 2; break
      case b1: h = (r1 - g1) / d + 4; break
    }
    h /= 6
  }
  return { h, s, l }
}
function hexToHslString(hex: string) {
  const { h, s, l } = hexToHsl(hex)
  const H = Math.round(h*360)
  const S = Math.round(s*100)
  const L = Math.round(l*100)
  return `${H} ${S}% ${L}%`
}
function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100
  const k = (n: number) => (n + h/30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}
function hslStringToHex(str: string) {
  const m = String(str).trim().match(/^(\d+(\.\d+)?)\s+(\d+(\.\d+)?)%\s+(\d+(\.\d+)?)%$/)
  if (!m) return ''
  const h = parseFloat(m[1]); const s = parseFloat(m[3]); const l = parseFloat(m[5])
  return hslToHex(h, s, l)
}
