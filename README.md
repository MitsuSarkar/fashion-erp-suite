# Fashion ERP Suite (Full System)

Features:
- Sidebar navigation + CRUD screens for Merchandising, Procurement, Inventory, Sales
- Variant Matrix to generate SKUs (style→color×size)
- PO workflow endpoints
- CSV import/export for every entity
- JWT login and demo data
- Executive dashboard wired to the same DB

## Start
Backend:
```bash
cd server
npm install
copy .env.example .env
npm run dev
```
Frontend:
```bash
npm install
copy .env.example .env    # VITE_API_URL=http://localhost:4000
npm run dev
```
Login: **admin@demo.local / admin123**.
