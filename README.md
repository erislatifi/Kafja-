# ☕ Kafe Nlagje — Sistemi i Menaxhimit
**Powered by PRO IT | prs-ks.com**

Sistem i plotë POS (Point of Sale) për menaxhimin e kafenesë: produkte, stok, porosi, printim termik, raporte dhe përdorues me role të ndryshme.

---

## 🧱 Struktura e Projektit

```
proit-kafene/
├── backend/          → API (Node.js + Express + PostgreSQL/Prisma)
├── frontend/          → Web App (React + Vite + TailwindCSS)
├── electron/          → Desktop App wrapper
├── docs/               → Dokumentacioni i instalimit
└── docker-compose.yml  → PostgreSQL e gatshme me Docker
```

## 🚀 Stack Teknologjik

| Shtresa | Teknologjia |
|---|---|
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Frontend | React + Vite + TailwindCSS |
| Desktop | Electron |
| Printim | ESC/POS (node-thermal-printer) — 58mm/80mm |
| Autentikim | JWT + bcrypt + RBAC (4 role) |
| Raporte | Recharts (grafika) + pdfkit + exceljs (eksport) |

## 👥 Rolet e Përdoruesve

- **Admin** — qasje e plotë (produkte, stok, raporte, përdorues, cilësime)
- **Menaxher** — produkte, stok, raporte, porosi (jo menaxhim përdoruesish)
- **Arkatar** — porosi, shikim porosish
- **Kamerier** — porosi, shikim porosish

## ⚡ Fillimi i Shpejtë (Zhvillim Lokal)

```bash
# 1. Databaza (me Docker)
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env   # plotesoni DATABASE_URL, JWT_SECRET
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev             # http://localhost:4000

# 3. Frontend (terminal i ri)
cd frontend
echo "VITE_API_URL=http://localhost:4000/api" > .env
npm install
npm run dev              # http://localhost:5173
```

**Kycja fillestare:** `admin` / `admin123` *(ndryshojeni menjehere!)*

## 📦 Instalim në Prodhim (Hostinger VPS)

Shihni udhëzimet e plota hap-pas-hapi: **[docs/INSTALIMI.md](docs/INSTALIMI.md)**

## 🖨️ Lidhja me Printer Termik

Shihni: **[docs/PRINTER_SETUP.md](docs/PRINTER_SETUP.md)**

## 🗂️ Modulet Kryesore

- ✅ Login + role-based access control
- ✅ Menaxhim produktesh (kategori, çmim, stok, barkod)
- ✅ Menaxhim stoku (shtim, alarm, histori lëvizjesh)
- ✅ POS — krijim porosie e shpejtë me listë/kërkim
- ✅ Printim automatik ESC/POS (80mm) + ri-printim
- ✅ Raporte ditore/mujore + eksport PDF/Excel
- ✅ Dashboard me grafikë
- ✅ Menaxhim përdoruesish (Admin)
- 🔜 Modul tavolinash (e ardhshme — schema e bazës e mbështet tashmë me `tavolinaNr`)

## 🔐 Siguria

- Fjalëkalimet hash-ohen me bcrypt
- Autentikim JWT me skadencë
- Rate-limiting në endpoint-in e login-it
- RBAC në çdo rrugë të API-së
- Helmet.js për header-a sigurie HTTP

---

**Powered by PRO IT | prs-ks.com**
