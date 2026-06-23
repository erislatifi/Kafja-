# 🖨️ KONFIGURIMI I PRINTERIT TERMIK 80mm
**Powered by PRO IT | prs-ks.com**

Sistemi përdor protokollin standard **ESC/POS**, që mbështetet nga shumica e printerave termikë (Xprinter, Epson TM, Star, Rongta, etj). Backend-i lidhet direkt me printerin nga kompjuteri ku është nisur (zakonisht kompjuteri i kafenesë, jo VPS).

> ⚠️ **E rëndësishme:** Printeri USB lidhet fizikisht me kompjuterin që nis backend-in. Nëse backend-i juaj është në VPS (distancë), printeri duhet të jetë **printer rrjeti (Network/IP)**, jo USB direkt. Për printim lokal me USB, duhet të keni një instancë të vogël të backend-it (ose vetëm shërbimin e printimit) që punon lokalisht në kompjuterin e kafenesë.

---

## 🔌 DY MËNYRA LIDHJEJE

### A) PRINTER ME USB (rekomandohet për kafene me 1 vend pune)
Përdoret kur backend-i punon **lokalisht** në kompjuterin e kafenesë.

### B) PRINTER ME RRJET / IP (rekomandohet nëse backend-i është online në VPS)
Printeri lidhet në rrjetin Wi-Fi/LAN të lokalit dhe merr një adresë IP fikse — backend-i (qoftë lokal ose online) i dërgon urdhrat e printimit nëpërmjet rrjetit.

---

## 🅰️ KONFIGURIMI ME USB

### Windows
1. Lidhni printerin me kabllo USB dhe ndizeni.
2. Windows zakonisht e njeh automatikisht si **Generic / Text Only** printer.
3. Identifikoni portin: Control Panel → Devices and Printers → klikoni djathtas mbi printer → Properties → Ports. Zakonisht është `USB001` ose `COM3`.
4. Te paneli **Cilesimet → Printer** në aplikacion, vendosni `pathUSB` si emrin e portit (p.sh. `USB001`).

> Në Windows, `node-thermal-printer` punon më mirë me drejtues **Generic/Text Only** ose duke instaluar paketën shtesë `printer` (shih më poshtë "Probleme në Windows").

### Linux (Ubuntu)
1. Lidhni printerin me USB.
2. Gjeni pajisjen:
```bash
ls /dev/usb/
# zakonisht do shfaqet: lp0
```
3. Jepini leje përdoruesit (që backend-i mos kërkojë sudo):
```bash
sudo usermod -a -G lp $USER
sudo chmod 666 /dev/usb/lp0
```
4. Te **Cilesimet → Printer** në aplikacion, vendosni `pathUSB` = `/dev/usb/lp0`.

### macOS
Printerat termikë USB zakonisht shfaqen si `/dev/usb/lp0` ose përmes CUPS. Rekomandohet lidhja Network nëse jeni në Mac.

---

## 🅱️ KONFIGURIMI ME RRJET (IP) — REKOMANDOHET PËR VPS ONLINE

1. Shumica e printerave 80mm modernë kanë port **Ethernet (RJ45)** ose **Wi-Fi**.
2. Lidheni printerin në të njëjtin rrjet (router) si kompjuteri/rrjeti i kafenesë.
3. Gjeni IP-në e printerit:
   - Disa printera e shtypin automatikisht IP-në në një faturë test kur i ndizni (mbani shtypur butonin FEED gjatë ndezjes).
   - Ose hyni te paneli i router-it (p.sh. `192.168.1.1`) → Connected Devices → gjeni emrin e printerit.
4. Vendoseni printerin me **IP statike** (jo dinamike), që të mos ndryshojë me restart router-i. Kjo bëhet zakonisht nga menyja e vetë printerit (LCD/buton-konfigurim) ose nga DHCP reservation në router.
5. Te **Cilesimet → Printer** në aplikacion:
   - Lidhja: **Network**
   - IP Adresa: p.sh. `192.168.1.50`
   - Porti: `9100` (porti standard ESC/POS, mos e ndryshoni nëse s'jeni të sigurt)

> Nëse backend-i juaj është në VPS dhe printeri është në rrjetin lokal të kafenesë (jo i njëjti rrjet me VPS-në), **kjo NUK do të funksionojë direkt** — VPS-ja nuk "sheh" rrjetin lokal të kafenesë. Në këtë rast duhet të përdorni Opsionin C më poshtë.

---

## 🅲 OPSIONI C — BACKEND ONLINE + PRINTIM LOKAL (rekomandohet për setupin tuaj)

Meqë keni zgjedhur backend online (VPS) + përdorim edhe nga distanca, kjo është mënyra korrekte për printim:

1. **Desktop App (Electron)** në kompjuterin e kafenesë lidhet me backend-in online për të marrë/dërguar të dhëna (produktet, porositë, etj).
2. Por **printimi** ndodh **lokalisht** — kompjuteri i kafenesë ka printerin USB të lidhur direkt me të.
3. Për këtë, rekomandojmë të nisni **një instancë shtesë të vogël të backend-it lokalisht** në kompjuterin e kafenesë, e cila:
   - Lidhet me të njëjtën bazë të dhënash online (përmes `DATABASE_URL` që pikon te VPS-ja)
   - Përdoret VETËM për funksionin e printimit (rruga `/api/orders/:id/printo`)
   - Printeri USB i kompjuterit të kafenesë konfigurohet në këtë instancë lokale

**Hapat praktikë:**
```bash
# Ne kompjuterin e kafenese
cd backend
cp .env.example .env
nano .env
```
Vendosni `DATABASE_URL` të njëjtë me atë të VPS-së (PostgreSQL duhet të lejojë lidhje nga jashtë — kërkon konfigurim shtesë sigurie në VPS, `pg_hba.conf` + firewall).

```bash
npm install
npm start   # do punoje ne portin 4000 lokalisht
```

Te paneli **Cilesimet → Printer**, krijoni printerin me `pathUSB` siç u shpjegua më lart te Opsioni A.

> 💡 **Alternativë më e thjeshtë:** Nëse doni më pak ndërlikim teknik fillimisht, blini një **printer me Wi-Fi/IP** (Opsioni B) dhe vendoseni në të njëjtin rrjet si kompjuteri i kafenesë — kjo e bën gjënë shumë më të lehtë sesa USB + instancë lokale.

---

## ✅ TESTIMI

1. Hapni aplikacionin → **Cilesimet → Printer**.
2. Krijoni/editoni printerin me të dhënat e sakta.
3. Klikoni **"Testo Printerin"** — duhet të dëgjoni printerin duke printuar një faturë test.
4. Nëse del gabim, shihni tabelën më poshtë.

---

## 🔧 PROBLEME TË ZAKONSHME

| Gabimi | Shkaku i Mundshëm | Zgjidhja |
|---|---|---|
| "Printeri nuk eshte i lidhur" | Path/IP i gabuar | Verifikoni path-in (USB) ose IP+port (Network) |
| Karakteret shqipe (ë, ç) printohen gabim | Character set i gabuar | Backend-i përdor `PC852_LATIN2`; nëse printeri juaj nuk e mbështet, provoni `PC858` ose kontrolloni manualin e printerit |
| Printimi është shumë i ngushtë/gjerë | Gjerësia e gabuar (58 vs 80mm) | Kontrolloni `gjeresiaMM` te cilësimet e printerit |
| Permission denied (Linux) | Përdoruesi s'ka leje për `/dev/usb/lp0` | `sudo chmod 666 /dev/usb/lp0` (shih sipër) |
| S'printon fare, pa gabim | Letra mbaron ose printeri është offline | Kontrolloni fizikisht printerin |
| Printon vetëm pjesë të faturës | Buffer i tejmbushur | Rinisni printerin (off/on) |

### Probleme në Windows
Nëse `node-thermal-printer` nuk e gjen portin USB direkt në Windows, alternativa është të instaloni printerin si **Shared Printer** dhe ta referoni me emrin e tij Windows (`\\\\COMPUTER\\PrinterName`), ose të përdorni një **printer me Network/IP** që eliminon plotësisht këtë problem.

---

**Powered by PRO IT | prs-ks.com**
