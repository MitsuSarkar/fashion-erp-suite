import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Shell from './components/Shell'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Login from './pages/Login'
import EntityPage from './pages/EntityPage'
import { loadConfig } from './lib/config'
import { useAppStore } from './store/useAppStore'

function Gate({children}:{children:React.ReactNode}){
  const { config } = useAppStore(); const token = typeof window!=='undefined'?localStorage.getItem('token'):null
  if(!config) return <div className="p-4">Loading…</div>
  if(config.dataSource==='rest' && !token) return <Navigate to="/login" replace />
  return <>{children}</>
}
class ErrorBoundary extends React.Component<{children:React.ReactNode}, {error:any}>{ 
  constructor(p:any){ super(p); this.state={error:null} } 
  static getDerivedStateFromError(e:any){ return {error:e} } 
  componentDidCatch(e:any,i:any){ console.error(e,i) } 
  render(){ return this.state.error? <div className="p-6"><h1 className="text-xl font-semibold">Error</h1><pre className="p-3 border rounded-xl">{String(this.state.error)}</pre></div> : this.props.children as any } 
}
export default function App(){
  const { setConfig } = useAppStore()
  React.useEffect(()=>{ loadConfig().then(setConfig) }, [setConfig])
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/*" element={<Gate><Shell>
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/settings" element={<Settings/>} />
            <Route path="/m/:moduleId/:entity" element={<EntityPage/>} />
            <Route path="*" element={<div className="p-4">Not Found</div>} />
          </Routes>
        </Shell></Gate>} />
      </Routes>
    </ErrorBoundary>
  )
}
