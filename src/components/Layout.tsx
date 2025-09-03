import Topbar from './Topbar'
import Sidebar from './Sidebar'
import { ReactNode } from 'react'
export default function Layout({children}:{children:ReactNode}){
  return (
    <div className="h-full grid" style={{gridTemplateRows:'auto 1fr'}}>
      <Topbar/>
      <div className="h-full grid" style={{gridTemplateColumns:'16rem 1fr'}}>
        <Sidebar/>
        <main className="p-4 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
