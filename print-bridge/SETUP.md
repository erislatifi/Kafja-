# 🖨️ Print Bridge - Udhëzime Instalimi
**Kafe Nlagje | Powered by PRO IT | prs-ks.com**

## Çfarë është Print Bridge?
Program i vogël që rri në kompjuterin e kafenesë dhe printon automatikisht çdo porosi të re nga sistemi online.

---

## HAPI 1 — Gjej IP-në e printerit

1. Ndize printerin OCPP-80S
2. Mbaj shtypur butonin **FEED** ndërkohë që e ndez → printon një faqe me konfigurimin
3. Shiko rreshtin **"IP Address"** — p.sh. `192.168.1.100`
4. Ose nga router-i: hyr te `192.168.1.1` → Connected Devices → gjej "OCPP" ose "Printer"

**Cakto IP fikse te printer-i** (nga menuja e printerit ose DHCP reservation te router-i) që të mos ndryshojë me restart.

---

## HAPI 2 — Instalo Node.js

Shko te: https://nodejs.org → shkarko **LTS** → instalo

---

## HAPI 3 — Konfiguro Print Bridge

1. Hape dosjen `print-bridge`
2. Kopjo `.env.example` si `.env`
3. Hape `.env` me Notepad dhe ndrysho:

```
API_URL=https://kafe-nlagje-api-production-44dd.up.railway.app/api
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PRINTER_IP=192.168.1.100    ← IP-ja e printerit tënd
PRINTER_PORT=9100
PRINTER_WIDTH=80
CHECK_INTERVAL=3
BIZNESI_EMRI=Kafe Nlagje
```

---

## HAPI 4 — Instalo dhe testo

Hape **Command Prompt** si Administrator, shko te dosja print-bridge:

```cmd
cd C:\Users\...\print-bridge
npm install
node bridge.js
```

Duhet të shohësh:
```
✅ U kyça si: Administratori
✅ Print Bridge aktiv — duke pritur porosi...
```

Bëj një porosi te sistemi → duhet të printohet automatikisht!

---

## HAPI 5 — Instalo si shërbim Windows (fillon vetë me kompjuter)

```cmd
npm install
node install-service.js
```

Tani Print Bridge fillon automatikisht çdo herë që ndizet kompjuteri — pa pasur nevojë ta hapësh manualisht.

---

## Probleme të zakonshme

| Problemi | Zgjidhja |
|---|---|
| "Printeri nuk është i lidhur" | Kontrollo IP-në te `.env`, sigurohu që printer-i dhe kompjuteri janë në të njëjtin rrjet |
| "Nuk u kyça" | Kontrollo `ADMIN_USERNAME` dhe `ADMIN_PASSWORD` te `.env` |
| Printon por karakteret janë gabim | Ndrysho `CharacterSet` te `bridge.js` — provo `PC858` ose `PC437` |
| Nuk fillon si shërbim | Hape Command Prompt si **Administrator** |

---

**Powered by PRO IT | prs-ks.com**
