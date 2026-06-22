# 📘 UDHËZIME INSTALIMI — Kafe Nlagje
**Powered by PRO IT | prs-ks.com**

Ky dokument ju udhëzon hap-pas-hapi si ta vendosni sistemin në VPS-në tuaj të Hostinger, dhe si ta nisni edhe lokalisht në kompjuterin e kafenesë.

---

## 📋 PËRMBAJTJA
1. Çfarë ju duhet para se të filloni
2. Përgatitja e VPS-së (Hostinger)
3. Instalimi i PostgreSQL
4. Instalimi i Backend-it
5. Instalimi i Frontend-it
6. Lidhja me Domain (prs-ks.com ose nën-domain)
7. Vënia në punë e vazhdueshme (PM2 + Nginx)
8. Instalimi i Desktop App (Electron) në kompjuterin e kafenesë
9. Backup i databazës
10. Probleme të zakonshme

---

## 1. ÇFARË JU DUHET PARA SE TË FILLONI

- VPS i blerë në Hostinger (Ubuntu 22.04 ose 24.04 rekomandohet)
- Qasje SSH në VPS (username + password, ose çelës SSH)
- Një domain ose nën-domain (p.sh. `app.prs-ks.com`) — opsionale por e rekomanduar
- Printer termik 80mm i lidhur me USB në kompjuterin e kafenesë

**Lidhu në VPS me SSH** (nga Windows mund të përdorni PuTTY, nga Mac/Linux terminalin direkt):
```bash
ssh root@IP_E_VPS_TENDE
```

---

## 2. PËRGATITJA E VPS-SË

Përditëso sistemin dhe instalo paketat bazë:

```bash
apt update && apt upgrade -y
apt install -y curl git build-essential
```

Instalo Node.js (versioni 20 LTS):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # duhet te shfaqe v20.x.x
```

---

## 3. INSTALIMI I POSTGRESQL

**Opsioni A — Me Docker (më e lehtë, rekomandohet):**

```bash
# Instalo Docker
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# Shko ne folderin e projektit (pas upload, shih hapin 4)
cd /var/www/kafe-nlagje

# Ndrysho fjalekalimin ne docker-compose.yml fillimisht (nano docker-compose.yml)
docker compose up -d
```

**Opsioni B — Instalim direkt:**

```bash
apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER kafe_user WITH PASSWORD 'fjalekalim_i_forte';"
sudo -u postgres psql -c "CREATE DATABASE kafe_nlagje_db OWNER kafe_user;"
```

---

## 4. INSTALIMI I BACKEND-IT

### 4.1 Ngarko projektin në VPS

Nga kompjuteri juaj (jo VPS), ngarkoni arkivin ZIP të projektit me `scp`:

```bash
scp kafe-nlagje.zip root@IP_E_VPS_TENDE:/var/www/
```

Në VPS:

```bash
mkdir -p /var/www/kafe-nlagje
cd /var/www
unzip kafe-nlagje.zip -d kafe-nlagje
cd kafe-nlagje/backend
```

### 4.2 Konfiguro variablat e mjedisit

```bash
cp .env.example .env
nano .env
```

Plotëso saktë:
```
DATABASE_URL="postgresql://kafe_user:fjalekalim_i_forte@localhost:5432/kafe_nlagje_db?schema=public"
PORT=4000
NODE_ENV=production
JWT_SECRET="<gjenero nje string te gjate - shiko poshte>"
FRONTEND_URL="https://app.prs-ks.com"
```

**Për të gjeneruar JWT_SECRET të sigurt**, ekzekuto:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Kopjo rezultatin dhe vendose si `JWT_SECRET`.

### 4.3 Instalo dhe nis databazën

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

Kjo do të krijojë:
- Përdoruesin admin: `admin` / `admin123` **(NDRYSHOJE menjëherë pas login-it të parë!)**
- 9 kategoritë e produkteve
- Printer parazgjedhur (do ta konfiguroni më vonë)

### 4.4 Testo backend-in

```bash
npm start
```

Hapni në shfletues: `http://IP_E_VPS_TENDE:4000/api/health` — duhet të shihni një mesazh JSON konfirmimi.

Ndaloni me `Ctrl+C` dhe vazhdoni te hapi 7 për ta mbajtur gjithmonë aktiv me PM2.

---

## 5. INSTALIMI I FRONTEND-IT

```bash
cd /var/www/kafe-nlagje/frontend
nano .env
```

Vendos:
```
VITE_API_URL=https://app.prs-ks.com/api
```
(ose `http://IP_E_VPS_TENDE:4000/api` nëse nuk keni ende domain)

```bash
npm install
npm run build
```

Kjo krijon folderin `dist/` me skedarë statikë (HTML/CSS/JS) — këta do t'i shërbejë Nginx.

---

## 6. LIDHJA ME DOMAIN

Te paneli i Hostinger (DNS Zone Editor), shtoni një **A Record**:
```
Tipi: A
Emri: app  (ose çfarëdo nën-domaini deshironi, p.sh. pos)
Vlera: IP_E_VPS_TENDE
TTL: 14400
```

Pritni 5-30 minuta për propagimin DNS.

---

## 7. VËNIA NË PUNË E VAZHDUESHME (PM2 + NGINX)

### 7.1 PM2 — mban backend-in gjithmonë aktiv

```bash
npm install -g pm2
cd /var/www/kafe-nlagje/backend
pm2 start src/app.js --name kafe-nlagje-api
pm2 save
pm2 startup   # ndiqni instruksionin qe shfaqet per autostart
```

Komanda të dobishme:
```bash
pm2 status              # shiko statusin
pm2 logs kafe-nlagje-api   # shiko log-et live
pm2 restart kafe-nlagje-api
```

### 7.2 Nginx — shërben frontend-in dhe ridrejton API-në

```bash
apt install -y nginx
nano /etc/nginx/sites-available/kafe-nlagje
```

Ngjit këtë konfigurim:

```nginx
server {
    listen 80;
    server_name app.prs-ks.com;

    root /var/www/kafe-nlagje/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktivizo dhe rinis:
```bash
ln -s /etc/nginx/sites-available/kafe-nlagje /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 7.3 HTTPS falas me Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d app.prs-ks.com
```

Ndiqni udhëzimet — do t'ju kërkojë email dhe konfirmim. Certifikata rinovohet automatikisht.

✅ Tani aplikacioni juaj është online në `https://app.prs-ks.com`, i sigurt me HTTPS, dhe gjithmonë aktiv.

---

## 8. INSTALIMI I DESKTOP APP (ELECTRON) NË KOMPJUTERIN E KAFENESË

Në kompjuterin e kafenesë (Windows ose Linux):

```bash
cd electron
npm install
```

Hapni `electron/main.js` dhe ndryshoni:
```js
const APP_URL = 'https://app.prs-ks.com';
```
(domain-in tuaj real)

Për ta testuar:
```bash
npm start
```

Për të ndërtuar instalues `.exe` (Windows):
```bash
npm run build:win
```
Skedari `.exe` do të jetë në `dist-electron/`. Instalojeni në kompjuterin e kafenesë si çdo program tjetër.

> **Shënim:** Ky desktop app thjesht hap aplikacionin tuaj online brenda një dritareje native — i jep pamje "app desktop" pa shfletues, por gjithmonë lidhet me backend-in tuaj online në VPS.

---

## 9. BACKUP I DATABAZËS

Krijo backup manual:
```bash
docker exec kafe_nlagje_db pg_dump -U kafe_user kafe_nlagje_db > backup_$(date +%Y%m%d).sql
```

**Backup automatik ditor** (shtoje në `crontab -e`):
```bash
0 3 * * * docker exec kafe_nlagje_db pg_dump -U kafe_user kafe_nlagje_db > /root/backups/backup_$(date +\%Y\%m\%d).sql
```

Kjo bën backup çdo ditë në orën 03:00.

---

## 10. PROBLEME TË ZAKONSHME

| Problemi | Zgjidhja |
|---|---|
| `Error: connect ECONNREFUSED` | PostgreSQL nuk është aktiv. Kontrollo `docker ps` ose `systemctl status postgresql` |
| Frontend nuk lidhet me backend | Kontrollo `VITE_API_URL` në `.env` të frontend-it dhe rindërto me `npm run build` |
| `401 Unauthorized` vazhdimisht | Token i skaduar — dilni dhe kyçuni përsëri |
| Printeri nuk printon | Shihni `docs/PRINTER_SETUP.md` |
| `Prisma Client not generated` | Ekzekuto `npx prisma generate` brenda `backend/` |
| PM2 nuk nis pas restart serveri | Ekzekuto `pm2 startup` dhe ndiq instruksionin, pastaj `pm2 save` |

---

**Powered by PRO IT | prs-ks.com**
