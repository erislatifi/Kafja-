import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MbyllFaturen({ tavolina, onMbyll, onAnulo }) {
  const [metoda, setMetoda] = useState('cash');
  const [duke_konfirmuar, setDukeKonfirmuar] = useState(false);
  const { user } = useAuth();

  const items = tavolina.items || [];
  const totali = tavolina.totali || items.reduce((s, x) => s + x.cmimi * x.sasia, 0);

  async function konfirmo() {
    setDukeKonfirmuar(true);
    try {
      await api.post(`/tables/${tavolina.id}/close`, { metoda });
      onMbyll({ tavolina, totali, metoda });
    } catch {
      // per demo - vetem mbyll
      onMbyll({ tavolina, totali, metoda });
    } finally {
      setDukeKonfirmuar(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)', marginBottom: 4 }}>Mbyll Faturën</div>
        <div style={{ fontSize: 11, color: 'var(--mt)', marginBottom: 16 }}>Konfirmo pagesën — Tavolina {tavolina.numri}</div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--lm)' }}>{tavolina.numri}</div>
          <div style={{ fontSize: 11, color: 'var(--mt)' }}>Tavolina</div>
        </div>

        {items.length > 0 && (
          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 10, marginBottom: 12, maxHeight: 140, overflowY: 'auto' }}>
            {items.map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0', borderBottom: '1px solid var(--bd)' }}>
                <span style={{ color: 'var(--tx)' }}>{it.emri} x{it.sasia}</span>
                <span style={{ color: 'var(--lm)', fontWeight: 600 }}>{(it.cmimi * it.sasia).toFixed(2)} €</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)', borderRadius: 9, padding: '12px 14px', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--mt)' }}>Totali për Pagesë</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--lm)' }}>{Number(totali).toFixed(2)} €</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[['cash', '💵', 'Cash'], ['card', '💳', 'Kartele']].map(([m, ic, lbl]) => (
            <div key={m} onClick={() => setMetoda(m)} style={{
              padding: 10, borderRadius: 8, cursor: 'pointer', textAlign: 'center',
              border: `2px solid ${metoda === m ? 'var(--lm)' : 'var(--bd)'}`,
              background: metoda === m ? 'rgba(166,230,53,0.1)' : 'transparent',
              transition: 'all 0.12s'
            }}>
              <div style={{ fontSize: 20, marginBottom: 3 }}>{ic}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx)' }}>{lbl}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onAnulo} style={{ flex: 1, padding: 10, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 8, fontSize: 12, color: 'var(--mt)', cursor: 'pointer' }}>
            Anulo
          </button>
          <button onClick={konfirmo} disabled={duke_konfirmuar} style={{ flex: 2, padding: 10, background: 'var(--lm)', color: 'var(--ld)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            ✓ Konfirmo Pagesën
          </button>
        </div>
      </div>
    </div>
  );
}
