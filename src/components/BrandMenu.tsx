// src/components/BrandMenu.tsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  listPresets,
  applyPreset,
  addPreset,
  deletePreset,
  renamePreset,
  isBuiltin,
  anyBuiltinsHidden,
  restoreAllBuiltins,
} from '../lib/theme'
import { ensureOrgForBrand, deleteOrgForBrand } from '../lib/org'

type Props = {
  value: string
  onChange: (name: string) => void
}

const BUILTIN_COLORS: Record<string, string> = {
  default: '#4f46e5', // indigo-600
  mands: '#00563B',
  hm: '#E21836',
}

function pretty(n: string) {
  if (n === 'mands') return 'M&S'
  if (n === 'hm') return 'H&M'
  if (n === 'default') return 'Default'
  return n
}

// Larger icons so they don’t blend into the dashboard
const IconPlus = (props: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
  </svg>
)
const IconTrash = (props: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 7h2v8h-2v-8zm4 0h2v8h-2v-8z" />
  </svg>
)
const IconPencil = (props: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
  </svg>
)
const IconRestore = (props: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13 3a9 9 0 1 0 8.446 12H19.5A7.5 7.5 0 1 1 13 4.5V2l4 3-4 3V6a6 6 0 1 0 6 6h1.5A7.5 7.5 0 1 1 13 3z" />
  </svg>
)

export default function BrandMenu({ value, onChange }: Props) {
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 320 })
  const [tick, setTick] = useState(0) // refresh list after changes

  const all = useMemo(() => listPresets(), [tick])
  const builtinsVisible = ['default', 'mands', 'hm'].filter((n) => all.includes(n))
  const customs = all.filter((p) => !isBuiltin(p))

  // Position dropdown (rendered in a portal → fixed coords)
  function place() {
    const anchor = btnRef.current?.getBoundingClientRect()
    if (!anchor) return
    const menuWidth = 320
    const gap = 8
    let left = anchor.right - menuWidth
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8))
    const top = Math.min(anchor.bottom + gap, window.innerHeight - 8 - 360) // keep inside viewport
    setPos({ top, left, width: menuWidth })
  }
  useLayoutEffect(() => {
    if (open) place()
  }, [open])
  useEffect(() => {
    if (!open) return
    const onWin = () => place()
    window.addEventListener('resize', onWin)
    window.addEventListener('scroll', onWin, true)
    return () => {
      window.removeEventListener('resize', onWin)
      window.removeEventListener('scroll', onWin, true)
    }
  }, [open])

  // Actions
  async function onAdd() {
    const name = window.prompt('Name this preset (e.g., “Asda”)')
    if (!name) return
    const exists = all.includes(name)
    if (exists && !window.confirm(`Preset "${name}" exists. Overwrite?`)) return
    if (exists) deletePreset(name) // overwrite behavior
    const ok = addPreset(name)
    if (ok) {
      applyPreset(name)
      onChange(name)
      await ensureOrgForBrand(name) // create/select org profile
      setTick((t) => t + 1)
      setOpen(false)
      window.location.reload()
    }
  }

  async function onDelete(name: string) {
    // For built-ins this hides the preset; both cases delete the org/profile
    const label = isBuiltin(name)
      ? `Hide ${pretty(name)} and DELETE its profile data?`
      : `Delete preset "${name}" and its profile data?`
    if (!window.confirm(label)) return

    await deleteOrgForBrand(pretty(name)) // delete org + mapping
    const ok = deletePreset(name) // visual: hide built-in or remove custom
    if (ok) {
      onChange(localStorage.getItem('brand') || 'default')
      setTick((t) => t + 1)
      window.location.reload()
    }
  }

  async function onRename(name: string) {
    const label = isBuiltin(name) ? 'Duplicate as (new name)' : 'Rename preset to'
    const newName = window.prompt(label, name)
    if (!newName || newName === name) return
    if (all.includes(newName) && newName !== name) {
      if (!window.confirm(`"${newName}" exists. Overwrite?`)) return
      if (!isBuiltin(newName)) deletePreset(newName)
    }
    const ok = renamePreset(name, newName)
    if (ok) {
      applyPreset(newName)
      onChange(newName)
      await ensureOrgForBrand(pretty(newName))
      setTick((t) => t + 1)
      setOpen(false)
      window.location.reload()
    }
  }

  function onRestoreBuiltins() {
    restoreAllBuiltins()
    setTick((t) => t + 1)
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        className="px-3 py-1 rounded-xl border bg-background flex items-center gap-2"
        onClick={() => setOpen((o) => !o)}
        title="Brand preset"
      >
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ background: BUILTIN_COLORS[value] || 'hsl(var(--primary))' }}
        />
        <span className="capitalize">{pretty(value)}</span>
        <span>▾</span>
      </button>

      {open &&
        createPortal(
          <>
            {/* overlay: blocks charts below and closes on click */}
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10000 }} />

            {/* menu */}
            <div
              style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 10001 }}
              className="border rounded-2xl bg-card shadow-xl p-2"
            >
              <div className="px-2 pb-2 flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground">Brand presets</div>
                <div className="flex items-center gap-2">
                  {anyBuiltinsHidden() && (
                    <button
                      className="btn-outline-primary flex items-center gap-1"
                      onClick={onRestoreBuiltins}
                      title="Restore hidden built-ins"
                    >
                      <IconRestore /> <span>Restore</span>
                    </button>
                  )}
                  <button
                    className="btn-outline-primary flex items-center gap-1"
                    onClick={onAdd}
                    title="Save current as preset"
                  >
                    <IconPlus /> <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-auto space-y-2">
                {/* Built-ins (deletable = hide) */}
                {builtinsVisible.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">Built-in</div>
                    {builtinsVisible.map((name) => (
                      <div key={name} className="flex items-center gap-2 mb-1">
                        {/* Delete BEFORE name (red) */}
                        <button
                          className="w-8 h-8 grid place-items-center rounded-xl border"
                          title={`Hide ${pretty(name)} & delete profile data`}
                          onClick={() => onDelete(name)}
                          style={{ color: '#ef4444' }}
                        >
                          <IconTrash />
                        </button>
                        {/* Rename (duplicates built-in as custom) */}
                        <button
                          className="w-8 h-8 grid place-items-center rounded-xl border btn-outline-primary"
                          title="Duplicate as…"
                          onClick={() => onRename(name)}
                        >
                          <IconPencil />
                        </button>
                        {/* Select */}
                        <button
                          className={`flex-1 text-left px-3 py-2 rounded-xl border ${
                            value === name ? 'nav-active' : 'hover:bg-muted'
                          }`}
                          onClick={async () => {
                            applyPreset(name as any)
                            onChange(name)
                            await ensureOrgForBrand(pretty(name))
                            setOpen(false)
                            window.location.reload()
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{ background: BUILTIN_COLORS[name] }}
                            />
                            <span className="capitalize">{pretty(name)}</span>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom */}
                <div>
                  <div className="px-2 pt-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Custom</div>
                  {customs.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No custom presets yet.</div>
                  )}
                  {customs.map((name) => (
                    <div key={name} className="flex items-center gap-2 mb-1">
                      {/* Delete BEFORE name (red) */}
                      <button
                        className="w-8 h-8 grid place-items-center rounded-xl border"
                        title="Delete preset & profile data"
                        onClick={() => onDelete(name)}
                        style={{ color: '#ef4444' }}
                      >
                        <IconTrash />
                      </button>
                      {/* Rename */}
                      <button
                        className="w-8 h-8 grid place-items-center rounded-xl border btn-outline-primary"
                        title="Rename"
                        onClick={() => onRename(name)}
                      >
                        <IconPencil />
                      </button>
                      {/* Select */}
                      <button
                        className={`flex-1 text-left px-3 py-2 rounded-2xl border ${
                          value === name ? 'nav-active' : 'hover:bg-muted'
                        }`}
                        onClick={async () => {
                          applyPreset(name)
                          onChange(name)
                          await ensureOrgForBrand(name)
                          setOpen(false)
                          window.location.reload()
                        }}
                      >
                        {name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  )
}
