import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PinLogin({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [gabim, setGabim] = useState('');
  const [duke_ngarkuar, setDukeNgarkuar] = useState(false);
  const [metoda, setMetoda] = useState('pin'); // 'pin' | 'karte'
  const [karta_aktive, setKartaAktive] = useState(false);
  const { loginWithPin, theme, toggleTheme } = useAuth();

  // Buffer per RFID — lexuesi dërgon karaktere shpejt (< 50ms ndërmjet)
  const rfidBuffer = useRef('');
  const rfidTimer = useRef(null);
  const lastKeyTime = useRef(0);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [duke_ngarkuar]);

  function handleKeydown(e) {
    if (duke_ngarkuar) return;

    const now = Date.now();
    const timeDiff = now - lastKeyTime.current;
    lastKeyTime.current = now;

    // Nëse karakteret vijnë shumë shpejt (< 80ms) = RFID scanner
    const esht_rfid = timeDiff < 80;

    if (e.key === 'Enter') {
      // Enter = fundi i leximit RFID ose konfirmim PIN
      if (rfidBuffer.current.length >= 4) {
        // RFID e lexoi kartën
        const kodiKartes = rfidBuffer.current;
        rfidBuffer.current = '';
        clearTimeout(rfidTimer.current);
        kontrolloRFID(kodiKartes);
      } else if (pin.length === 4) {
        kontrolloPin(pin);
      }
      return;
    }

    if (e.key === 'Backspace') {
      if (metoda === 'pin') {
        setPin(p => p.slice(0, -1));
        setGabim('');
      }
      return;
    }

    // Injoro tastet speciale
    if (e.key.length > 1) return;

    if (esht_rfid || rfidBuffer.current.length > 0) {
      // Po lexon RFID
      rfidBuffer.current += e.key;
      clearTimeout(rfidTimer.current);
      // Nëse ndalon leximi (> 200ms), konsidero të mbaruar
      rfidTimer.current = setTimeout(() => {
        if (rfidBuffer.current.length >= 4) {
          kontrolloRFID(rfidBuffer.current);
        }
        rfidBuffer.current = '';
      }, 200);
    } else if (metoda === 'pin' && /^\d$/.test(e.key) && pin.length < 4) {
      // Input manual PIN
      const pinRi = pin + e.key;
      setPin(pinRi);
      setGabim('');
      if (pinRi.length === 4) setTimeout(() => kontrolloPin(pinRi), 150);
    }
  }

  async function kontrolloPin(p) {
    setDukeNgarkuar(true);
    try {
      const user = await loginWithPin(p);
      onSuccess(user);
    } catch {
      setGabim('PIN i pasakte. Provoni perseri.');
      setPin('');
    } finally { setDukeNgarkuar(false); }
  }

  async function kontrolloRFID(kodi) {
    setKartaAktive(true);
    setDukeNgarkuar(true);
    setGabim('');
    try {
      const user = await loginWithPin(kodi);
      onSuccess(user);
    } catch {
      setGabim('Karta nuk u njoh. Provoni perseri.');
      setTimeout(() => setKartaAktive(false), 1000);
    } finally { setDukeNgarkuar(false); }
  }

  function shtoShifren(n) {
    if (pin.length >= 4 || duke_ngarkuar || metoda !== 'pin') return;
    const pinRi = pin + n;
    setPin(pinRi);
    setGabim('');
    if (pinRi.length === 4) setTimeout(() => kontrolloPin(pinRi), 150);
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: 20
    }}>
      {/* TEMA */}
      <button onClick={toggleTheme} style={{
        position: 'absolute', top: 16, right: 16,
        background: 'var(--bg2)', border: '1.5px solid var(--bd)',
        borderRadius: 20, padding: '5px 14px',
        cursor: 'pointer', fontSize: 12, color: 'var(--mt)'
      }}>
        {theme === 'dark' ? '☀️ Dritet' : '🌙 Nata'}
      </button>

      {/* LOGO */}
      <div style={{
        width: 60, height: 60, background: 'var(--lm)',
        borderRadius: 16, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 26, fontWeight: 900,
        color: 'var(--ld)', marginBottom: 12,
        boxShadow: '0 4px 16px rgba(90,158,15,0.25)'
      }}>N</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--tx)', marginBottom: 4 }}>Kafe Nlagje</div>

      {/* NDËRRIMI METODËS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--bg3)', padding: 4, borderRadius: 12 }}>
        <button onClick={() => { setMetoda('pin'); setPin(''); setGabim(''); }} style={{
          padding: '7px 18px', borderRadius: 9, fontSize: 12, fontWeight: 600,
          background: metoda === 'pin' ? 'var(--bg2)' : 'transparent',
          color: metoda === 'pin' ? 'var(--tx)' : 'var(--mt)',
          border: metoda === 'pin' ? '1.5px solid var(--bd)' : '1.5px solid transparent',
          cursor: 'pointer', boxShadow: metoda === 'pin' ? 'var(--sh)' : 'none'
        }}>🔢 PIN</button>
        <button onClick={() => { setMetoda('karte'); setPin(''); setGabim(''); }} style={{
          padding: '7px 18px', borderRadius: 9, fontSize: 12, fontWeight: 600,
          background: metoda === 'karte' ? 'var(--bg2)' : 'transparent',
          color: metoda === 'karte' ? 'var(--tx)' : 'var(--mt)',
          border: metoda === 'karte' ? '1.5px solid var(--bd)' : '1.5px solid transparent',
          cursor: 'pointer', boxShadow: metoda === 'karte' ? 'var(--sh)' : 'none'
        }}>📡 Karta RFID</button>
      </div>

      {/* PIN MODE */}
      {metoda === 'pin' && (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: 18, height: 18, borderRadius: '50%',
                background: i < pin.length ? 'var(--lm)' : 'transparent',
                border: `2.5px solid ${i < pin.length ? 'var(--lm)' : 'var(--bd)'}`,
                transition: 'all 0.15s',
                boxShadow: i < pin.length ? '0 0 8px rgba(90,158,15,0.4)' : 'none'
              }} />
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--rd)', marginBottom: 16, minHeight: 22, textAlign: 'center', fontWeight: 600 }}>
            {duke_ngarkuar ? <span style={{ color: 'var(--lm)' }}>Duke kontrolluar...</span> : gabim}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: 10 }}>
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} onClick={() => shtoShifren(String(n))} disabled={duke_ngarkuar}
                style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--bg2)', border: '1.5px solid var(--bd)', color: 'var(--tx)', fontSize: 24, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--sh)', transition: 'all 0.1s' }}
                onMouseDown={e => { e.currentTarget.style.background='var(--lm)'; e.currentTarget.style.color='var(--ld)'; e.currentTarget.style.transform='scale(0.93)'; }}
                onMouseUp={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--tx)'; e.currentTarget.style.transform='scale(1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--tx)'; e.currentTarget.style.transform='scale(1)'; }}
              >{n}</button>
            ))}
            <div />
            <button onClick={() => shtoShifren('0')} disabled={duke_ngarkuar}
              style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--bg2)', border: '1.5px solid var(--bd)', color: 'var(--tx)', fontSize: 24, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--sh)' }}
              onMouseDown={e => { e.currentTarget.style.background='var(--lm)'; e.currentTarget.style.color='var(--ld)'; }}
              onMouseUp={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--tx)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--tx)'; }}
            >0</button>
            <button onClick={() => { setPin(p => p.slice(0,-1)); setGabim(''); }}
              style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--bg2)', border: '1.5px solid var(--bd)', color: 'var(--tx)', fontSize: 20, cursor: 'pointer', boxShadow: 'var(--sh)' }}>⌫</button>
          </div>
        </>
      )}

      {/* KARTA RFID MODE */}
      {metoda === 'karte' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 140, height: 140, borderRadius: 24,
            border: `3px solid ${karta_aktive ? 'var(--lm)' : gabim ? 'var(--rd)' : 'var(--bd)'}`,
            background: karta_aktive ? 'rgba(90,158,15,0.08)' : gabim ? 'rgba(220,38,38,0.05)' : 'var(--bg2)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            transition: 'all 0.3s',
            boxShadow: karta_aktive ? '0 0 24px rgba(90,158,15,0.3)' : 'var(--sh)',
            animation: duke_ngarkuar ? 'pulse 1s infinite' : 'none'
          }}>
            <div style={{ fontSize: 52, marginBottom: 4 }}>
              {duke_ngarkuar ? '⏳' : karta_aktive ? '✅' : gabim ? '❌' : '📡'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--mt)', fontWeight: 600 }}>
              {duke_ngarkuar ? 'Duke lexuar...' : karta_aktive ? 'U njoh!' : gabim ? 'Gabim' : 'NFC/RFID'}
            </div>
          </div>

          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)', marginBottom: 8 }}>
            {duke_ngarkuar ? 'Duke kontrolluar kartën...' : 'Vëni kartën te lexuesi'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--mt)', marginBottom: 16, lineHeight: 1.5 }}>
            Afrojeni kartën ose chip-in tuaj<br />te lexuesi RFID/NFC
          </div>

          {gabim && (
            <div style={{ color: 'var(--rd)', fontSize: 13, fontWeight: 600, background: 'rgba(220,38,38,0.08)', padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(220,38,38,0.2)' }}>
              {gabim}
            </div>
          )}

          <div style={{ marginTop: 20, fontSize: 11, color: 'var(--mt)', background: 'var(--bg3)', padding: '8px 16px', borderRadius: 8, border: '1px solid var(--bd)' }}>
            💡 Lexuesi USB RFID funksionon automatikisht<br />pasi të lidhet me kompjuterin
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ position: 'absolute', bottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 16, height: 16, background: 'var(--lm)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--ld)', fontSize: 9 }}>P</div>
        <span style={{ fontSize: 11, color: 'var(--mt)' }}>Powered by <strong style={{ color: 'var(--lm)' }}>PRO IT</strong> | prs-ks.com</span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
