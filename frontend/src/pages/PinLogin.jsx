import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PinLogin({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [gabim, setGabim] = useState('');
  const [duke_ngarkuar, setDukeNgarkuar] = useState(false);
  const [debug, setDebug] = useState(''); // per te pare cfare lexon
  const { loginWithPin, theme, toggleTheme } = useAuth();
  const rfidBuffer = useRef('');
  const rfidTimer = useRef(null);
  const lastKeyTime = useRef(0);
  const allKeys = useRef('');

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duke_ngarkuar]);

  function onKey(e) {
    if (duke_ngarkuar) return;
    const now = Date.now();
    const diff = now - lastKeyTime.current;
    lastKeyTime.current = now;

    // Regjistro cdo taste per debug
    if (e.key.length === 1 || e.key === 'Enter') {
      allKeys.current += e.key === 'Enter' ? '[ENTER]' : e.key;
      setDebug(allKeys.current.slice(-30)); // shfaq 30 karakteret e fundit
    }

    const eshte_rfid = diff < 100; // RFID < 100ms

    if (e.key === 'Enter') {
      const kodi = rfidBuffer.current || pin;
      rfidBuffer.current = '';
      clearTimeout(rfidTimer.current);
      if (kodi.length >= 4) kontrollo(kodi);
      return;
    }
    if (e.key === 'Backspace') { setPin(p => p.slice(0, -1)); return; }
    if (e.key.length > 1) return;

    if (eshte_rfid && rfidBuffer.current.length === 0 && pin.length === 0) {
      // Fillim i leximit RFID
      rfidBuffer.current += e.key;
      clearTimeout(rfidTimer.current);
      rfidTimer.current = setTimeout(() => {
        if (rfidBuffer.current.length >= 4) {
          setPin(rfidBuffer.current); // shfaq ne display
          kontrollo(rfidBuffer.current);
        }
        rfidBuffer.current = '';
      }, 300);
    } else if (rfidBuffer.current.length > 0) {
      // Vazhdon leximi RFID
      rfidBuffer.current += e.key;
      clearTimeout(rfidTimer.current);
      rfidTimer.current = setTimeout(() => {
        if (rfidBuffer.current.length >= 4) {
          setPin(rfidBuffer.current);
          kontrollo(rfidBuffer.current);
        }
        rfidBuffer.current = '';
      }, 300);
    } else if (/^\d$/.test(e.key) && pin.length < 20) {
      // Input manual
      setPin(p => p + e.key);
      setGabim('');
    }
  }

  function shtoShifren(n) {
    if (duke_ngarkuar || pin.length >= 20) return;
    setPin(p => p + n);
    setGabim('');
  }

  async function kontrollo(kodi) {
    if (!kodi || kodi.length < 4) return;
    setDukeNgarkuar(true);
    setGabim('');
    try {
      const user = await loginWithPin(kodi);
      setPin('');
      onSuccess(user);
    } catch {
      setGabim(`PIN i pasakte: "${kodi}"`);
      setPin('');
    } finally { setDukeNgarkuar(false); }
  }

  const btnStyle = { width: 80, height: 80, borderRadius: 16, background: 'var(--bg2)', border: '1.5px solid var(--bd)', color: 'var(--tx)', fontSize: 24, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--sh)', transition: 'all 0.1s' };
  const bp = e => { e.currentTarget.style.background='var(--lm)'; e.currentTarget.style.color='var(--ld)'; e.currentTarget.style.transform='scale(0.93)'; };
  const br = e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--tx)'; e.currentTarget.style.transform='scale(1)'; };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 20 }}>

      <button onClick={toggleTheme} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--bg2)', border: '1.5px solid var(--bd)', borderRadius: 20, padding: '5px 14px', cursor: 'pointer', fontSize: 12, color: 'var(--mt)' }}>
        {theme === 'dark' ? '☀️ Dritet' : '🌙 Nata'}
      </button>

      <img src="/logo-p.png" alt="PRO IT" style={{ width: 70, height: 70, objectFit: 'contain', marginBottom: 8 }} />
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--tx)', marginBottom: 20 }}>Kafe Nlagje</div>

      {/* DISPLAY */}
      <div style={{ width: 280, minHeight: 56, background: 'var(--bg2)', border: '2px solid var(--bd)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, padding: '0 16px', boxShadow: 'var(--sh)' }}>
        {pin.length === 0
          ? <span style={{ color: 'var(--mt)', fontSize: 16 }}>Vendosni PIN-in...</span>
          : <span style={{ color: 'var(--tx)', fontSize: pin.length > 12 ? 16 : 22, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2 }}>{pin}</span>
        }
      </div>

      {/* GABIM / NGARKIMI */}
      <div style={{ fontSize: 12, minHeight: 20, marginBottom: 4, textAlign: 'center', fontWeight: 600, maxWidth: 280 }}>
        {duke_ngarkuar
          ? <span style={{ color: 'var(--lm)' }}>Duke kontrolluar...</span>
          : <span style={{ color: 'var(--rd)' }}>{gabim}</span>}
      </div>

      {/* DEBUG - shfaq cfare po lexon lexuesi */}
      {debug && (
        <div style={{ fontSize: 10, color: 'var(--mt)', background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 6, padding: '4px 10px', marginBottom: 10, maxWidth: 280, wordBreak: 'break-all', textAlign: 'center' }}>
          📡 Lexuar: {debug}
        </div>
      )}

      {/* TASTIERA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: 10 }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => shtoShifren(String(n))} disabled={duke_ngarkuar}
            style={btnStyle} onMouseDown={bp} onMouseUp={br} onMouseLeave={br}
          >{n}</button>
        ))}
        <button onClick={() => { setPin(p => p.slice(0,-1)); setGabim(''); allKeys.current=''; setDebug(''); }}
          style={btnStyle} onMouseDown={bp} onMouseUp={br} onMouseLeave={br}>⌫</button>
        <button onClick={() => shtoShifren('0')} disabled={duke_ngarkuar}
          style={btnStyle} onMouseDown={bp} onMouseUp={br} onMouseLeave={br}>0</button>
        <button onClick={() => kontrollo(pin)} disabled={duke_ngarkuar || pin.length < 4}
          style={{ width: 80, height: 80, borderRadius: 16, background: pin.length >= 4 ? 'var(--lm)' : 'var(--bg3)', border: `1.5px solid ${pin.length >= 4 ? 'var(--lm)' : 'var(--bd)'}`, color: pin.length >= 4 ? 'var(--ld)' : 'var(--mt)', fontSize: 12, fontWeight: 800, cursor: pin.length >= 4 ? 'pointer' : 'default', boxShadow: 'var(--sh)' }}
        >HYRJE</button>
      </div>

      <div style={{ position: 'absolute', bottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <img src="/logo-proit.png" alt="PRO IT" style={{ height: 24, objectFit: 'contain', opacity: 0.7 }} />
        <span style={{ fontSize: 10, color: 'var(--mt)', opacity: 0.7 }}>prs-ks.com</span>
      </div>
    </div>
  );
}
