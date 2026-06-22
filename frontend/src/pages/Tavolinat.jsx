import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MbyllFaturen from '../components/pos/MbyllFaturen';

export default function Tavolinat({ onZgjidh, onLogout }) {
  const [tavolinat, setTavolinat] = useState([]);
  const [selTav, setSelTav] = useState(null);
  const [modalMbyll, setModalMbyll] = useState(false);
  const { user, theme, toggleTheme } = useAuth();

  useEffect(() => { ngarko(); }, []);

  async function ngarko() {
    // Krijo tavolina lokalisht (20 tavolina)
    const occ = [3, 7, 11];
    const demo = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1, numri: i + 1,
      aktive: occ.includes(i + 1),
      totali: occ.includes(i + 1) ? [3.50, 5.20, 8.00][occ.indexOf(i + 1)] : 0,
      items: []
    }));
    setTavolinat(demo);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx)' }}>Zgjidh Tavolinën</div>
          <div style={{ fontSize: 11, color: 'var(--mt)' }}>Punonjësi: <strong style={{ color: 'var(--lm)' }}>{user?.emri}</strong></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleTheme} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bd)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, color: 'var(--mt)' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={onLogout} style={{ background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, color: 'var(--rd)' }}>
            Dil
          </button>
        </div>
      </div>

      {/* GRILLA E TAVOLINAVE - me te vogla */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, flex: 1 }}>
        {tavolinat.map(tav => {
          const zgjedhur = selTav?.numri === tav.numri;
          return (
            <div key={tav.id} onClick={() => setSelTav(tav)} style={{
              aspectRatio: '1.1',
              borderRadius: 10,
              border: `2px solid ${zgjedhur ? 'var(--lm)' : tav.aktive ? 'var(--or)' : 'var(--bd)'}`,
              background: zgjedhur ? 'rgba(90,158,15,0.1)' : tav.aktive ? 'rgba(234,88,12,0.06)' : 'var(--bg2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', transition: 'all 0.12s',
              boxShadow: zgjedhur ? '0 0 0 3px rgba(90,158,15,0.2)' : 'var(--sh)'
            }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>🪑</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: zgjedhur ? 'var(--lm)' : tav.aktive ? 'var(--or)' : 'var(--tx)' }}>
                {tav.numri}
              </div>
              {tav.aktive && (
                <div style={{ fontSize: 9, color: 'var(--or)', fontWeight: 700 }}>{Number(tav.totali).toFixed(2)}€</div>
              )}
              {tav.aktive && (
                <div style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: 'var(--or)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* LEGJENDA */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 10 }}>
        {[['var(--bg2)', 'var(--bd)', 'E lire'], ['rgba(234,88,12,0.15)', 'var(--or)', 'E zene'], ['rgba(90,158,15,0.15)', 'var(--lm)', 'E zgjedhur']].map(([bg, bd, lbl]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--mt)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: `2px solid ${bd}` }} />
            {lbl}
          </div>
        ))}
      </div>

      {/* BUTONAT E VEPRIMIT */}
      {selTav && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
          {selTav.aktive && (
            <button onClick={() => setModalMbyll(true)} style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: 'rgba(234,88,12,0.1)', border: '1.5px solid var(--or)', color: 'var(--or)', cursor: 'pointer'
            }}>
              🧾 Mbyll Faturën
            </button>
          )}
          <button onClick={() => onZgjidh(selTav)} style={{
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: 'var(--lm)', color: 'var(--ld)', border: 'none', cursor: 'pointer'
          }}>
            → Shto Porosi — Tav. {selTav.numri}
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: 'var(--mt)' }}>
        Powered by <strong style={{ color: 'var(--lm)' }}>PRO IT</strong> | prs-ks.com
      </div>

      {modalMbyll && selTav && (
        <MbyllFaturen tavolina={selTav} onMbyll={r => { setModalMbyll(false); setSelTav(null); }} onAnulo={() => setModalMbyll(false)} />
      )}
    </div>
  );
}
