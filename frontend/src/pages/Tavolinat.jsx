import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MbyllFaturen from '../components/pos/MbyllFaturen';

export default function Tavolinat({ onZgjidh, onLogout }) {
  const [tavolinat, setTavolinat] = useState([]);
  const [selTav, setSelTav] = useState(null);
  const [modalMbyll, setModalMbyll] = useState(false);
  const [duke_u_ngarkuar, setDukeUNgarkuar] = useState(true);
  const { user, theme, toggleTheme } = useAuth();

  useEffect(() => { ngarko(); }, []);

  async function ngarko() {
    setDukeUNgarkuar(true);
    try {
      const { data } = await api.get('/tables');
      setTavolinat(data);
    } catch {
      // nese API nuk ekziston ende, krijo tavolina demo
      const demo = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1, numri: i + 1, aktive: [3, 7, 11].includes(i + 1),
        totali: [3, 7, 11].includes(i + 1) ? [3.50, 5.20, 8.00][([3,7,11].indexOf(i+1))] : 0
      }));
      setTavolinat(demo);
    } finally {
      setDukeUNgarkuar(false);
    }
  }

  function selekto(tav) {
    setSelTav(tav);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 20, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)' }}>Zgjidh Tavolinën</div>
          <div style={{ fontSize: 12, color: 'var(--mt)', marginTop: 2 }}>
            Punonjësi: <span style={{ color: 'var(--lm)', fontWeight: 600 }}>{user?.emri}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleTheme} style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, color: 'var(--mt)' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={onLogout} style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, color: 'var(--rd)' }}>
            Dil
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, flex: 1 }}>
        {tavolinat.map(tav => {
          const aktive = tav.aktive;
          const zgjedhur = selTav?.numri === tav.numri;
          return (
            <div key={tav.id} onClick={() => selekto(tav)} style={{
              aspectRatio: '1', borderRadius: 12,
              border: `2px solid ${zgjedhur ? 'var(--lm)' : aktive ? 'var(--or)' : 'var(--bd)'}`,
              background: zgjedhur ? 'rgba(166,230,53,0.12)' : aktive ? 'rgba(251,146,60,0.07)' : 'var(--bg3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: 20, marginBottom: 3 }}>🪑</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: zgjedhur ? 'var(--lm)' : aktive ? 'var(--or)' : 'var(--tx)' }}>
                {tav.numri}
              </div>
              {aktive && (
                <div style={{ fontSize: 9, color: 'var(--or)', fontWeight: 600 }}>{tav.totali?.toFixed(2)}€</div>
              )}
              {aktive && (
                <div style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: 'var(--or)' }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {[['var(--bg3)', 'var(--bd)', 'E lire'], ['rgba(251,146,60,0.2)', 'var(--or)', 'E zene'], ['rgba(166,230,53,0.2)', 'var(--lm)', 'E zgjedhur']].map(([bg, bd, lbl]) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--mt)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: `2px solid ${bd}` }} />
              {lbl}
            </div>
          ))}
        </div>
      </div>

      {selTav && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          {selTav.aktive && (
            <button onClick={() => setModalMbyll(true)} style={{
              padding: '11px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: 'rgba(251,146,60,0.12)', border: '1.5px solid var(--or)', color: 'var(--or)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7
            }}>
              🧾 Mbyll Faturën
            </button>
          )}
          <button onClick={() => onZgjidh(selTav)} style={{
            padding: '11px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: 'var(--lm)', color: 'var(--ld)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7
          }}>
            → Shto Porosi — Tav. {selTav.numri}
          </button>
        </div>
      )}

      {modalMbyll && selTav && (
        <MbyllFaturen
          tavolina={selTav}
          onMbyll={(rezultati) => {
            setModalMbyll(false);
            setSelTav(null);
            ngarko();
          }}
          onAnulo={() => setModalMbyll(false)}
        />
      )}
    </div>
  );
}
