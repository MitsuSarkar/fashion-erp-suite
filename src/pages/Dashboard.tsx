import { useEffect, useState } from 'react'
import { api, HttpError } from '../lib/rest'
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard(){
  const [data, setData] = useState<any|null>(null)
  const [err, setErr] = useState<string|null>(null)
  const [health, setHealth] = useState<'ok'|'fail'|'pending'>('pending')

  useEffect(()=>{
    let cancelled = false

    // connectivity probe
    ;(async()=>{
      try {
        const h = await fetch('/health')
        if (!cancelled) setHealth(h.ok ? 'ok' : 'fail')
      } catch { if (!cancelled) setHealth('fail') }
    })()

    const ctl = new AbortController()
    const timer = setTimeout(()=> ctl.abort(), 20000)

    ;(async()=>{
      try {
        const d = await api.dashboard({ signal: ctl.signal })
        if (!d) throw new Error('No data returned from /api/reports/dashboard')
        if (!cancelled) setData(d)
      } catch(e:any) {
        let msg = 'Failed to load'
        if (e?.name === 'AbortError') msg = 'Request timed out'
        else if (e instanceof HttpError) msg = `${e.message}${e.body ? `\n${e.body}` : ''}`
        else if (e?.message) msg = e.message
        if (!cancelled) setErr(msg)
      } finally { clearTimeout(timer) }
    })()

    return ()=>{ cancelled = true; ctl.abort(); clearTimeout(timer) }
  }, [])

  if (err) {
    return (
      <div className="p-4 border rounded-2xl">
        <div className="font-semibold mb-2">Dashboard failed to load</div>
        <pre className="text-sm whitespace-pre-wrap">{err}</pre>
        <div className="mt-2 text-xs text-muted-foreground">
          Health: {health === 'pending' ? 'checking…' : health === 'ok' ? 'backend reachable' : 'backend not reachable'}
        </div>
        <button className="mt-3 btn-outline-primary" onClick={()=>window.location.reload()}>Reload</button>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="p-4 border rounded-2xl">
        Loading…
        <div className="mt-2 text-xs text-muted-foreground">
          Health: {health === 'pending' ? 'checking…' : health === 'ok' ? 'backend reachable' : 'backend not reachable'}
        </div>
      </div>
    )
  }

  // Accent palette for charts (reads CSS var)
  const ACCENT = 'hsl(var(--primary))'
  const ACCENT_SOFT = 'hsl(var(--primary) / .45)'
  const ACCENT_FAINT = 'hsl(var(--primary) / .25)'
  const COLORS = [ACCENT, ACCENT_SOFT, ACCENT_FAINT, '#a3a3a3', '#d4d4d4', '#737373']

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <KPICard title="Cash" value={`£${fmt(data.header.cash)}`} />
        <KPICard title="A/R Trade (Net)" value={`£${fmt(data.header.arNet)}`} />
        <KPICard title="Inventory" value={`£${fmt(data.header.inventory)}`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Working Capital Current Ratio Trend">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data.workingCapitalTrend}>
              <XAxis dataKey="month"/><YAxis/><Tooltip/><Legend/>
              <Bar dataKey="workingCapital" name="Working Capital" fill={ACCENT_SOFT} />
              <Line dataKey="currentRatio" name="Current Ratio" stroke={ACCENT} strokeWidth={2}/>
              <Line dataKey="quickRatio" name="Quick Ratio" stroke={ACCENT_FAINT} strokeWidth={2}/>
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Sales Performance">
          <div className="overflow-auto h-[260px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr>
                  <th className="text-left p-2">Period</th>
                  <th className="text-right p-2">Sales Amt</th>
                  <th className="text-right p-2">GM%</th>
                  <th className="text-right p-2">Avg/Doc</th>
                  <th className="text-right p-2">#Docs</th>
                </tr>
              </thead>
              <tbody>
                {data.salesPerf.map((r:any,i:number)=>(
                  <tr key={i} className="odd:bg-muted/40">
                    <td className="p-2">{r.label}</td>
                    <td className="p-2 text-right">£{fmt(r.salesAmt)}</td>
                    <td className="p-2 text-right">{(r.gmPct*100).toFixed(1)}%</td>
                    <td className="p-2 text-right">£{fmt(r.avgAmtPerDoc)}</td>
                    <td className="p-2 text-right">{r.numDocs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Customer Retention">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.retention} dataKey="value" nameKey="label" outerRadius={100} label>
                {data.retention.map((_:any,i:number)=>(<Cell key={i} fill={COLORS[i%COLORS.length]} />))}
              </Pie>
              <Tooltip/><Legend/>
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Top Ten Customers">
          <div className="overflow-auto h-[260px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-right p-2">YTD</th>
                  <th className="text-right p-2">% Total</th>
                  <th className="text-right p-2">Change%</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((c:any,i:number)=>(
                  <tr key={i} className="odd:bg-muted/40">
                    <td className="p-2">{c.customer}</td>
                    <td className="p-2 text-right">£{fmt(c.ytd)}</td>
                    <td className="p-2 text-right">{c.pctTotal.toFixed(1)}%</td>
                    <td className="p-2 text-right">{c.changePct.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="YoY Sales & Margin">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data.yoy}>
              <XAxis dataKey="month"/><YAxis yAxisId={0}/><YAxis yAxisId={1} orientation="right" domain={[0,100]} /><Tooltip/><Legend/>
              <Bar yAxisId={0} dataKey="current" name="Sales Current" fill={ACCENT_SOFT}/>
              <Bar yAxisId={0} dataKey="prior" name="Sales Prior" fill={ACCENT_FAINT}/>
              <Line yAxisId={1} dataKey="gmCurrent" name="GM% Current" stroke={ACCENT} strokeWidth={2}/>
              <Line yAxisId={1} dataKey="gmPrior" name="GM% Prior" stroke="#9ca3af" strokeWidth={2}/>
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  )
}

function Panel({title,children}:{title:string;children:any}){
  return (
    <div className="p-4 border rounded-2xl bg-card card-accent">
      <div className="text-sm text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  )
}

function KPICard({title,value}:{title:string;value:string}){
  return (
    <div className="p-4 border rounded-2xl bg-card card-accent">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  )
}

function fmt(n:number){ return (n ?? 0).toLocaleString(undefined,{maximumFractionDigits:0}) }
