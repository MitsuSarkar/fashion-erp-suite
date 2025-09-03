import { NavLink } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export default function Sidebar(){
  const { config } = useAppStore()
  return (
    <aside className="w-64 border-r h-full p-3">
      <div className="text-xs font-medium text-muted-foreground mb-2">NAVIGATION</div>
      <nav className="flex flex-col gap-1">
        <NavLink
          to="/"
          className={({isActive}) =>
            `px-3 py-2 rounded-xl border ${isActive ? 'nav-active' : 'hover:bg-muted'}`
          }
        >
          Dashboard
        </NavLink>

        {config?.navigation.map((n,i)=>{
          const mod = config.modules.find(m=>m.id===n.moduleId)
          const ent = mod?.entities.find(e=>e.name===n.entity)
          const label = n.label || `${mod?.label} · ${ent?.label}`
          return (
            <NavLink
              key={i}
              to={`/m/${n.moduleId}/${n.entity}`}
              className={({isActive}) =>
                `px-3 py-2 rounded-xl border ${isActive ? 'nav-active' : 'hover:bg-muted'}`
              }
            >
              {label}
            </NavLink>
          )
        })}

        <NavLink
          to="/settings"
          className={({isActive}) =>
            `px-3 py-2 rounded-xl border ${isActive ? 'nav-active' : 'hover:bg-muted'}`
          }
        >
          Settings
        </NavLink>
      </nav>
    </aside>
  )
}
