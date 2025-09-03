Fashion ERP Suite — Multi-brand Retail ERP (React + Express + SQLite)

A learning project that grew into a brand-ready ERP for fashion/retail.
Front-to-back: React + Vite (TS), Express (REST), SQLite DB.
Supports multiple brands as isolated organizations (H&M, M&S, or your own).
Includes a KPI dashboard, merchandising → SKUs, POs, inventory, sales/OMS, CSV import/export, dark mode + theming.

✨ Features

Multi-tenant profiles (organizations): pick a brand in the top bar. Each org has separate data.

Brand presets menu:

Add / rename / delete (built-ins can be “hidden”)

Selecting a brand creates/selects an org automatically

Deleting a brand deletes that org’s data

Dashboard: Cash / A/R Trade (Net) / Inventory, YoY bars, retention pie, top customers.

Merchandising: Styles → variant generator to create SKUs (color/size).

Procurement: Vendors, Purchase Orders + lines, PO workflow (Draft → Submitted → Approved → Received → Closed).

Inventory & Ops: Warehouses, Stores, Stock Ledger, Transfers.

Sales / OMS: Customers, Sales Orders + lines, channels & statuses.

CSV import/export for every major entity.

KPI overrides (per brand): set exact Cash/A/R/Inventory in Settings.

Theming: dark mode + accent color; brand presets theme the UI & charts.

🧱 Tech Stack

Frontend: React (Vite, TS), React Router, React Query, Recharts, Tailwind (utility layer + CSS variables)

Backend: Node.js / Express (REST), JWT auth, better-sqlite3

DB: SQLite (swappable to Postgres)

Deploy: GitHub Pages (frontend) + Render/Railway/Fly (backend)

🚀 Quick Start (Local)
Prerequisites

Node 18+ (Node 20 recommended)

Git

1) Clone & install
git clone https://github.com/<you>/<repo>.git
cd <repo>

# backend
cd server
npm install

# frontend
cd ../client
npm install

2) Run the backend

cd ../server
npm run dev    # or: node src/index.js
# → prints: "ERP Suite server on 4000"

By default the server:

Creates/updates the SQLite DB.

Seeds a Default org (and demo M&S/H&M orgs).

Seeds an admin user via ensureAdmin() (see server/src/auth.js for details; credentials are printed/defined there).

3) Run the frontend (dev)

cd ../client
npm run dev
# http://localhost:5173
🔐 Auth

POST /api/auth/login with { email, password } returns a JWT; the frontend stores it in localStorage and sends Authorization: Bearer <token>.

Admin user is seeded in ensureAdmin() (see server/src/auth.js).
If you can’t log in, check the server console or adjust credentials in that file.

🏢 Multi-Tenant Model (Brands = Orgs)

Brand presets in the UI map to organizations in the DB.

The active org id is stored in localStorage.orgId and sent as X-Org-ID header on every request (see client/src/lib/rest.ts).

Delete a brand in the menu ⇒ deletes that org and all of its data (on the server), and hides the preset.

📊 Dashboard Data
<img width="1914" height="890" alt="Screenshot 2025-09-02 220559" src="https://github.com/user-attachments/assets/b55affe4-df2a-474f-858e-bbba87b4d603" />

<img width="1919" height="729" alt="Screenshot 2025-09-02 220932" src="https://github.com/user-attachments/assets/a039f18c-abc5-4917-8df2-e561ed504020" />


Cash: revenue (last 30 days) × 0.6 (demo formula)
<img width="1915" height="786" alt="Screenshot 2025-09-02 220654" src="https://github.com/user-attachments/assets/b812647b-273a-4cf1-9716-552711ff0849" />

A/R Net: sum of sales lines on orders with status New/Allocated/Shipped
<img width="1917" height="875" alt="Screenshot 2025-09-02 220717" src="https://github.com/user-attachments/assets/288fc80c-e65a-4faf-82d9-dcdea9794794" />

Inventory: stock.qty × sku.cost

Overrides: go to Settings → Dashboard KPI Overrides to set any of these per brand (leave blank = calculated)
<img width="1914" height="819" alt="Screenshot 2025-09-02 220816" src="https://github.com/user-attachments/assets/6a4fb81e-5b43-4ab8-9cb2-4629169a00c2" />
<img width="281" height="296" alt="Screenshot 2025-09-02 220913" src="https://github.com/user-attachments/assets/07ea52d8-67f4-44d0-be8f-f22b0b47fa34" />
<img width="298" height="282" alt="Screenshot 2025-09-02 2208501" src="https://github.com/user-attachments/assets/54e1d1e8-43c0-4082-9098-81fd3d7f6001" />



📥 CSV Import / 📤 Export

Every major list view supports Import CSV / Export CSV:

Import expects headers matching the column names shown in the export.

For foreign keys (e.g., soId, skuId), get the ids via Export CSV from the related table.


⚙️ Environment Variables
Server (server/.env)

PORT=4000
JWT_SECRET=dev-secret-please-change
# Comma-separated list of allowed origins for CORS
CORS_ORIGIN=http://localhost:5173,https://<user>.github.io
# Optional: persistent DB path
DB_FILE=/absolute/path/to/erp.sqlite
# Optional (if supported by your auth.js)
ADMIN_EMAIL=admin@demo.local
ADMIN_PASSWORD=admin123

Client (client/.env.production)

# Your deployed backend base URL
VITE_API_URL=https://your-backend.example.com

🌐 Deployment
Frontend → GitHub Pages

Set base path in client/vite.config.ts:

const repo = '<repo-name>'
export default defineConfig({
  plugins: [react()],
  base: `/${repo}/`,
  // ...
})

Production API URL: client/.env.production
GitHub Actions workflow (recommended):
Create .github/workflows/deploy-pages.yml:

name: Deploy Frontend to GitHub Pages
on: { push: { branches: [ main ] } }

permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: "pages", cancel-in-progress: true }

jobs:
  build:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: client } }
    steps:
      - uses: actions/checkout@v4
        with: { submodules: false }    # avoid submodule pitfalls
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - run: cp dist/index.html dist/404.html
      - uses: actions/upload-pages-artifact@v3
        with: { path: client/dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
4.In GitHub → Settings → Pages → Source: GitHub Actions.

Alternative: gh-pages CLI
In client/package.json add:

"predeploy": "npm run build && node -e \"require('fs').copyFileSync('dist/index.html','dist/404.html')\"",
"deploy": "gh-pages -d dist -b gh-pages"

Then: cd client && npm run deploy and set Pages to “Deploy from a branch → gh-pages”.

Backend → Render (example)

Create a Web Service on Render.

Root directory: server

Build: npm ci

Start: node src/index.js

Env vars: CORS_ORIGIN=https://<user>.github.io, JWT_SECRET=..., optional DB_FILE=...

Attach a persistent Disk if you want the SQLite file to survive restarts.

🧪 Scripts

client/

npm run dev        # Vite dev server (http://localhost:5173)
npm run build      # Production build to client/dist
npm run preview    # Preview build locally
npm run deploy     # (if using gh-pages) publish dist to gh-pages branch


server/

npm run dev        # Nodemon or node src/index.js

🛠️ Troubleshooting

GitHub Pages 404 on refresh → Ensure workflow copies dist/index.html to dist/404.html (SPA fallback).

Assets 404 on Pages → Check base: '/<repo>/' in vite.config.ts.

CORS / “Failed to fetch” → Add your Pages origin to CORS_ORIGIN on the server.

“Not a git repository” → Run git init at the project root, then git add -A && git commit -m "..."

Submodule error in Pages build:

No url found for submodule path 'server' in .gitmodules


Remove accidental submodule:

git rm --cached -r server
rm -f .gitmodules
rm -rf server/.git
git add -A && git commit -m "Fix: remove accidental submodule" && git push

🧩 API Cheatsheet

Orgs (brands)
GET /api/orgs · POST /api/orgs {name,color?} · DELETE /api/orgs/:id

Dashboard
GET /api/reports/dashboard (uses X-Org-ID)

Per-org settings (KPI overrides)
GET /api/settings · PUT /api/settings { cashOverride?, arOverride?, inventoryOverride? }

Generic CRUD (:key = merch.styles, sales.salesOrders, etc.)
GET /api/:key · GET /api/:key/:id · POST /api/:key · PUT /api/:key/:id · DELETE /api/:key/:id
POST /api/:key/import (CSV) · GET /api/:key/export (CSV)

Auth
POST /api/auth/login { email, password }

All requests (except /auth/login, /orgs, /reports/dashboard) require Authorization: Bearer <token> and every request should include X-Org-ID: <orgId>.

🧑‍💻 Contributing

PRs welcome! Please open an Issue first if it’s a large change:

Follow the existing code style (Prettier/ESLint if configured).

Keep modules focused (small routes/controllers).

Add helpful seed data for new entities where relevant.

📄 License

MIT — do anything, but no warranty.
This project is a learning build and not affiliated with any brand.

🙌 Thanks

React, Vite, Express, better-sqlite3, Recharts, Tailwind.

Everyone who shares patterns for resilient retail systems.
