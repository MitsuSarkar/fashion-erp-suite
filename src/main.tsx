import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { applyThemeFromStorage } from './lib/theme'

applyThemeFromStorage()

const qc = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  // no StrictMode (avoids double effects in dev)
  <QueryClientProvider client={qc}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
)
