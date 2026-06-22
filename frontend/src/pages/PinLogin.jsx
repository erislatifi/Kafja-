import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PinLogin({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [gabim, setGabim] = useState('');
  const [duke_ngarkuar, setDukeNgarkuar] = useState(false);
  const { loginWithPin, theme, toggleTheme } = useAuth();
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
    const eshte_rfid = diff < 80 || rfidBuffer.current.length > 0;

    if (e.key === 'Enter') {
      const kodi = rfidBuffer.current || pin;
      rfidBuffer.current = '';
      clearTimeout(rfidTimer.current);
      if (kodi.length >= 4) kontrollo(kodi);
      return;
    }
    if (e.key === 'Backspace') { setPin(p => p.slice(0, -1)); setGabim(''); return; }
    if (e.key.length > 1) return;

    if (eshte_rfid) {
      rfidBuffer.current += e.key;
      clearTimeout(rfidTimer.current);
      rfidTimer.current = setTimeout(() => {
        if (rfidBuffer.current.length >= 4) kontrollo(rfidBuffer.current);
        rfidBuffer.current = '';
      }, 150);
    } else if (/^\d$/.test(e.key)) {
      shtoShifren(e.key);
    }
  }

  function shtoShifren(n) {
    if (duke_ngarkuar) return;
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
      setGabim('PIN i pasakte. Provoni perseri.');
      setPin('');
    } finally { setDukeNgarkuar(false); }
  }

  const btnStyle = {
    width: 80, height: 80, borderRadius: 16,
    background: 'var(--bg2)', border: '1.5px solid var(--bd)',
    color: 'var(--tx)', fontSize: 24, fontWeight: 700,
    cursor: 'pointer', boxShadow: 'var(--sh)', transition: 'all 0.1s'
  };

  const btnPress = (e) => { e.currentTarget.style.background='var(--lm)'; e.currentTarget.style.color='var(--ld)'; e.currentTarget.style.transform='scale(0.93)'; };
  const btnRelease = (e) => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--tx)'; e.currentTarget.style.transform='scale(1)'; };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 20 }}>

      <button onClick={toggleTheme} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--bg2)', border: '1.5px solid var(--bd)', borderRadius: 20, padding: '5px 14px', cursor: 'pointer', fontSize: 12, color: 'var(--mt)' }}>
        {theme === 'dark' ? '☀️ Dritet' : '🌙 Nata'}
      </button>

      {/* LOGO LART */}
      <img src="/logo-p.png" alt="PRO IT" style={{ width: 70, height: 70, objectFit: 'contain', marginBottom: 8 }} />

      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--tx)', marginBottom: 20 }}>Kafe Nlagje</div>

      {/* PIKAT - pa tekst "Shkruani PIN" */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 18, height: 18, borderRadius: '50%',
            background: i < pin.length ? 'var(--lm)' : 'transparent',
            border: `2.5px solid ${i < pin.length ? 'var(--lm)' : 'var(--bd)'}`,
            transition: 'all 0.15s',
          }} />
        ))}
      </div>

      {/* GABIM */}
      <div style={{ fontSize: 13, minHeight: 22, marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>
        {duke_ngarkuar
          ? <span style={{ color: 'var(--lm)' }}>Duke kontrolluar...</span>
          : <span style={{ color: 'var(--rd)' }}>{gabim}</span>}
      </div>

      {/* TASTIERA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: 10 }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => shtoShifren(String(n))} disabled={duke_ngarkuar}
            style={btnStyle}
            onMouseDown={btnPress} onMouseUp={btnRelease} onMouseLeave={btnRelease}
          >{n}</button>
        ))}

        {/* Rreshti i fundit: fshi, 0, enter */}
        <button onClick={() => { setPin(p => p.slice(0,-1)); setGabim(''); }}
          style={btnStyle}
          onMouseDown={btnPress} onMouseUp={btnRelease} onMouseLeave={btnRelease}
        >⌫</button>

        <button onClick={() => shtoShifren('0')} disabled={duke_ngarkuar}
          style={btnStyle}
          onMouseDown={btnPress} onMouseUp={btnRelease} onMouseLeave={btnRelease}
        >0</button>

        {/* ENTER - butoni kryesor jeshil */}
        <button onClick={() => kontrollo(pin)} disabled={duke_ngarkuar || pin.length < 4}
          style={{
            width: 80, height: 80, borderRadius: 16,
            background: pin.length >= 4 ? 'var(--lm)' : 'var(--bg3)',
            border: `1.5px solid ${pin.length >= 4 ? 'var(--lm)' : 'var(--bd)'}`,
            color: pin.length >= 4 ? 'var(--ld)' : 'var(--mt)',
            fontSize: 13, fontWeight: 800,
            cursor: pin.length >= 4 ? 'pointer' : 'default',
            boxShadow: 'var(--sh)', transition: 'all 0.15s'
          }}
        >HYRJE</button>
      </div>

      {/* FOOTER */}
      <div style={{ position: 'absolute', bottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <img src="/logo-proit.png" alt="PRO IT" style={{ height: 24, objectFit: 'contain', opacity: 0.7 }} />
        <span style={{ fontSize: 10, color: 'var(--mt)', opacity: 0.7 }}>prs-ks.com</span>
      </div>
    </div>
  );
}
