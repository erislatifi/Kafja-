import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PinLogin({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [gabim, setGabim] = useState('');
  const [duke_ngarkuar, setDukeNgarkuar] = useState(false);
  const { loginWithPin, theme, toggleTheme } = useAuth();

  // Buffer për RFID/barcode — vijnë shpejt < 80ms
  const rfidBuffer = useRef('');
  const rfidTimer = useRef(null);
  const lastKeyTime = useRef(0);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duke_ngarkuar, pin]);

  function onKey(e) {
    if (duke_ngarkuar) return;

    const now = Date.now();
    const diff = now - lastKeyTime.current;
    lastKeyTime.current = now;

    // RFID dërgon karaktere shumë shpejt (< 80ms)
    const eshte_rfid = diff < 80 || rfidBuffer.current.length > 0;

    if (e.key === 'Enter') {
      // Enter = fundi i leximit (RFID ose konfirmim manual)
      const kodi = rfidBuffer.current || pin;
      rfidBuffer.current = '';
      clearTimeout(rfidTimer.current);
      if (kodi.length >= 4) kontrollo(kodi);
      return;
    }

    if (e.key === 'Backspace') {
      setPin(p => p.slice(0, -1));
      setGabim('');
      return;
    }

    if (e.key.length > 1) return; // injoro Shift, Ctrl, etj

    if (eshte_rfid) {
      // Po grumbullon input nga RFID/barcode scanner
      rfidBuffer.current += e.key;
      clearTimeout(rfidTimer.current);
      rfidTimer.current = setTimeout(() => {
        // Ndaloi leximi — konfirmo automatikisht
        if (rfidBuffer.current.length >= 4) {
          kontrollo(rfidBuffer.current);
        }
        rfidBuffer.current = '';
      }, 150);
    } else {
      // Input manual nga tastiera — shto te PIN
      if (/^\d$/.test(e.key)) {
        shtoShifren(e.key);
      }
    }
  }

  function shtoShifren(n) {
    if (duke_ngarkuar) return;
    setPin(p => p + n);
    setGabim('');
  }

  function fshiShifren() {
    setPin(p => p.slice(0, -1));
    setGabim('');
  }

  async function kontrollo(kodi) {
    setDukeNgarkuar(true);
    setGabim('');
    try {
      const user = await loginWithPin(kodi);
      setPin('');
      onSuccess(user);
    } catch {
      setGabim('PIN i pasakte. Provoni perseri.');
      setPin('');
    } finally {
      setDukeNgarkuar(false);
    }
  }

  // Shfaq pikat — nese PIN eshte i gjate (RFID) shfaq vetem 4 pika
  const numPikat = Math.min(pin.length, 4);
  const pikatPlota = pin.length;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: 20
    }}>
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
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--tx)', marginBottom: 4 }}>
        Kafe Nlagje
      </div>
      <div style={{ fontSize: 13, color: 'var(--mt)', marginBottom: 28 }}>
        Shkruani PIN-in tuaj
      </div>

      {/* PIKAT */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 8, alignItems: 'center' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 18, height: 18, borderRadius: '50%',
            background: i < pin.length ? 'var(--lm)' : 'transparent',
            border: `2.5px solid ${i < pin.length ? 'var(--lm)' : 'var(--bd)'}`,
            transition: 'all 0.15s',
            boxShadow: i < pin.length ? '0 0 8px rgba(90,158,15,0.4)' : 'none'
          }} />
        ))}
        {/* Nese PIN eshte me i gjate se 4 (RFID) trego numrin */}
        {pin.length > 4 && (
          <span style={{ fontSize: 12, color: 'var(--lm)', fontWeight: 700, marginLeft: 4 }}>
            +{pin.length - 4}
          </span>
        )}
      </div>

      {/* MESAZH GABIMI / NGARKIMI */}
      <div style={{ fontSize: 13, minHeight: 22, marginBottom: 20, textAlign: 'center', fontWeight: 600 }}>
        {duke_ngarkuar
          ? <span style={{ color: 'var(--lm)' }}>Duke kontrolluar...</span>
          : <span style={{ color: 'var(--rd)' }}>{gabim}</span>}
      </div>

      {/* TASTIERA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: 10 }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n}
            onClick={() => shtoShifren(String(n))}
            disabled={duke_ngarkuar}
            style={{
              width: 80, height: 80, borderRadius: 16,
              background: 'var(--bg2)', border: '1.5px solid var(--bd)',
              color: 'var(--tx)', fontSize: 24, fontWeight: 700,
              cursor: 'pointer', boxShadow: 'var(--sh)', transition: 'all 0.1s'
            }}
            onMouseDown={e => { e.currentTarget.style.background='var(--lm)'; e.currentTarget.style.color='var(--ld)'; e.currentTarget.style.transform='scale(0.93)'; }}
            onMouseUp={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--tx)'; e.currentTarget.style.transform='scale(1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--tx)'; e.currentTarget.style.transform='scale(1)'; }}
          >{n}</button>
        ))}

        {/* Rreshti i fundit: bosh, 0, fshij */}
        <div />
        <button
          onClick={() => shtoShifren('0')}
          disabled={duke_ngarkuar}
          style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--bg2)', border: '1.5px solid var(--bd)', color: 'var(--tx)', fontSize: 24, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--sh)' }}
          onMouseDown={e => { e.currentTarget.style.background='var(--lm)'; e.currentTarget.style.color='var(--ld)'; }}
          onMouseUp={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--tx)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--tx)'; }}
        >0</button>
        <button
          onClick={fshiShifren}
          style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--bg2)', border: '1.5px solid var(--bd)', color: 'var(--tx)', fontSize: 20, cursor: 'pointer', boxShadow: 'var(--sh)' }}
        >⌫</button>
      </div>

      {/* INFO RFID - e vogel */}
      <div style={{ marginTop: 24, fontSize: 11, color: 'var(--mt)', textAlign: 'center', opacity: 0.7 }}>
        📡 Lexuesi RFID funksionon automatikisht
      </div>

      {/* FOOTER */}
      <div style={{ position: 'absolute', bottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 16, height: 16, background: 'var(--lm)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--ld)', fontSize: 9 }}>P</div>
        <span style={{ fontSize: 11, color: 'var(--mt)' }}>
          Powered by <strong style={{ color: 'var(--lm)' }}>PRO IT</strong> | prs-ks.com
        </span>
      </div>
    </div>
  );
}
