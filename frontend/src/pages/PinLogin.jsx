import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PinLogin({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [gabim, setGabim] = useState('');
  const [duke_u_ngarkuar, setDukeUNgarkuar] = useState(false);
  const [preview, setPreview] = useState('');
  const { loginWithPin, theme, toggleTheme } = useAuth();

  function shtoShifren(n) {
    if (pin.length >= 4 || duke_u_ngarkuar) return;
    const pinRi = pin + n;
    setPin(pinRi);
    setGabim('');
    if (pinRi.length === 4) {
      setTimeout(() => kontrolloPin(pinRi), 150);
    }
  }

  async function kontrolloPin(pinFinal) {
    setDukeUNgarkuar(true);
    try {
      const user = await loginWithPin(pinFinal);
      onSuccess(user);
    } catch (err) {
      setGabim('PIN i pasakte. Provoni perseri.');
      setPin('');
      setPreview('');
    } finally {
      setDukeUNgarkuar(false);
    }
  }

  function fshiShifren() {
    if (!pin) return;
    setPin(pin.slice(0, -1));
    setGabim('');
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: '20px'
    }}>
      <button onClick={toggleTheme} style={{
        position: 'absolute', top: 16, right: 16,
        background: 'var(--bg3)', border: '1px solid var(--bd)',
        borderRadius: 20, padding: '5px 14px',
        cursor: 'pointer', fontSize: 12, color: 'var(--mt)'
      }}>
        {theme === 'dark' ? '☀️ Dritet' : '🌙 Nata'}
      </button>

      <div style={{ width: 56, height: 56, background: 'var(--lm)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: 'var(--ld)', marginBottom: 12 }}>N</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--tx)', marginBottom: 4 }}>Kafe Nlagje</div>
      <div style={{ fontSize: 13, color: 'var(--mt)', marginBottom: 32 }}>Shkruani PIN-in tuaj</div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 18, height: 18, borderRadius: '50%',
            background: i < pin.length ? 'var(--lm)' : 'transparent',
            border: '2px solid', borderColor: i < pin.length ? 'var(--lm)' : 'var(--bd)',
            transition: 'all 0.15s'
          }} />
        ))}
      </div>

      {preview && (
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lm)', marginBottom: 4, minHeight: 20 }}>{preview}</div>
      )}
      <div style={{ fontSize: 12, color: 'var(--rd)', marginBottom: 16, minHeight: 20 }}>{gabim}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 82px)', gap: 10 }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => shtoShifren(String(n))} disabled={duke_u_ngarkuar} style={{
            width: 82, height: 82, borderRadius: 16,
            background: 'var(--bg3)', border: '1.5px solid var(--bd)',
            color: 'var(--tx)', fontSize: 26, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.1s'
          }}
          onMouseDown={e => e.currentTarget.style.background='var(--lm)'}
          onMouseUp={e => e.currentTarget.style.background='var(--bg3)'}
          onMouseLeave={e => e.currentTarget.style.background='var(--bg3)'}
          >{n}</button>
        ))}
        <div style={{ width: 82, height: 82 }} />
        <button onClick={() => shtoShifren('0')} disabled={duke_u_ngarkuar} style={{
          width: 82, height: 82, borderRadius: 16,
          background: 'var(--bg3)', border: '1.5px solid var(--bd)',
          color: 'var(--tx)', fontSize: 26, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.1s'
        }}
        onMouseDown={e => e.currentTarget.style.background='var(--lm)'}
        onMouseUp={e => e.currentTarget.style.background='var(--bg3)'}
        onMouseLeave={e => e.currentTarget.style.background='var(--bg3)'}
        >0</button>
        <button onClick={fshiShifren} style={{
          width: 82, height: 82, borderRadius: 16,
          background: 'var(--bg3)', border: '1.5px solid var(--bd)',
          color: 'var(--tx)', fontSize: 20, cursor: 'pointer'
        }}>⌫</button>
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: 'var(--mt)', textAlign: 'center' }}>
        {duke_u_ngarkuar && <span style={{ color: 'var(--lm)' }}>Duke kontrolluar...</span>}
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--mt)', textAlign: 'center', opacity: 0.5 }}>
        Powered by PRO IT | prs-ks.com
      </div>
    </div>
  );
}
