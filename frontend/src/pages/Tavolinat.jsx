import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MbyllFaturen from '../components/pos/MbyllFaturen';

export default function Tavolinat({ onZgjidh, onLogout, onMbyllFatura, onRaport }) {
  const [tavolinat, setTavolinat] = useState([]);
  const [selTav, setSelTav] = useState(null);
  const [modalMbyll, setModalMbyll] = useState(false);
  const [modalEdito, setModalEdito] = useState(false);
  const [editTav, setEditTav] = useState(null);
  const { user, theme, toggleTheme } = useAuth();

  useEffect(() => { ngarko(); }, []);

  async function ngarko() {
    try {
      const { data } = await api.get('/tables');
      setTavolinat(data);
    } catch {
      // Demo tavolina
      setTavolinat(Array.from({ length: 15 }, (_, i) => ({
        id: i + 1, numri: i + 1, emri: `T${i + 1}`,
        aktive: [3, 7, 11].includes(i + 1),
        totali: [3, 7, 11].includes(i + 1) ? [12.50, 8.00, 22.00][([3,7,11].indexOf(i+1))] : 0,
        items: []
      })));
    }
  }

  const lira = tavolinat.filter(t => !t.aktive).length;
  const zena = tavolinat.filter(t => t.aktive).length;

  return (
    <div style={{
      height: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', padding: '12px 14px 8px'
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo-p.png" alt="PRO IT" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--tx)' }}>Kafe Nlagje</div>
            <div style={{ fontSize: 11, color: 'var(--mt)' }}>{user?.emri}</div>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bd)', borderRadius: 8, padding: '4px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--lm)' }}>{lira}</div>
            <div style={{ fontSize: 9, color: 'var(--mt)', fontWeight: 600 }}>TË LIRA</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bd)', borderRadius: 8, padding: '4px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--or)' }}>{zena}</div>
            <div style={{ fontSize: 9, color: 'var(--mt)', fontWeight: 600 }}>TË ZËNA</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={toggleTheme} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bd)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: 'var(--mt)' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={onLogout} style={{ background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--rd)' }}>
            DALI
          </button>
        </div>
      </div>

      {/* GRILLA TAVOLINAVE */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 8, minHeight: 0
      }}>
        {tavolinat.map(tav => {
          const zgjedhur = selTav?.numri === tav.numri;
          const aktive = tav.aktive;
          return (
            <div key={tav.id} onClick={() => setSelTav(zgjedhur ? null : tav)}
              style={{
                borderRadius: 12,
                border: `2.5px solid ${zgjedhur ? 'var(--lm)' : aktive ? 'var(--or)' : 'var(--bd)'}`,
                background: zgjedhur
                  ? 'rgba(90,158,15,0.1)'
                  : aktive
                    ? 'rgba(234,88,12,0.06)'
                    : 'var(--bg2)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
                transition: 'all 0.15s',
                boxShadow: zgjedhur ? '0 0 0 3px rgba(90,158,15,0.2)' : 'var(--sh)'
              }}>
              {/* Dot statusi */}
              <div style={{
                position: 'absolute', top: 7, right: 7,
                width: 8, height: 8, borderRadius: '50%',
                background: aktive ? 'var(--or)' : 'var(--bd)'
              }} />

              {/* Numri */}
              <div style={{
                fontSize: 22, fontWeight: 900,
                color: zgjedhur ? 'var(--lm)' : aktive ? 'var(--or)' : 'var(--tx)',
                lineHeight: 1
              }}>{tav.numri}</div>

              {/* Emri opsional */}
              {tav.emri && tav.emri !== `T${tav.numri}` && (
                <div style={{ fontSize: 9, color: 'var(--mt)', marginTop: 2 }}>{tav.emri}</div>
              )}

              {/* Totali nëse e zënë */}
              {aktive && (
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--or)', marginTop: 3 }}>
                  {Number(tav.totali).toFixed(2)}€
                </div>
              )}

              {/* Ikona */}
              <div style={{ fontSize: 13, marginTop: 2, opacity: 0.5 }}>🪑</div>
            </div>
          );
        })}
      </div>

      {/* LEGJENDA */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 6, flexShrink: 0 }}>
        {[['var(--bg2)', 'var(--bd)', 'E lirë'], ['rgba(234,88,12,0.15)', 'var(--or)', 'E zënë'], ['rgba(90,158,15,0.15)', 'var(--lm)', 'E zgjedhur']].map(([bg, bd, lbl]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--mt)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: `2px solid ${bd}` }} />
            {lbl}
          </div>
        ))}
      </div>

      {/* BUTONAT — shfaqen vetëm kur selektohet tavolina */}
      {selTav && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Edito tavolinën */}
          <button onClick={() => { setEditTav({ ...selTav }); setModalEdito(true); }}
            style={{ padding: '9px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: 'var(--bg2)', border: '1.5px solid var(--bd)', color: 'var(--mt)', cursor: 'pointer' }}>
            ✏️ Edito Tav. {selTav.numri}
          </button>

          {/* Mbyll faturën — vetëm nëse e zënë */}
          {selTav.aktive && (
            <button onClick={() => setModalMbyll(true)}
              style={{ padding: '9px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'rgba(234,88,12,0.1)', border: '1.5px solid var(--or)', color: 'var(--or)', cursor: 'pointer' }}>
              🧾 Mbyll Faturën — {Number(selTav.totali).toFixed(2)}€
            </button>
          )}

          {/* Shto porosi */}
          <button onClick={() => onZgjidh(selTav)}
            style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'var(--lm)', color: 'var(--ld)', border: 'none', cursor: 'pointer' }}>
            + Porosi — Tav. {selTav.numri}
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ textAlign: 'center', marginTop: 6, flexShrink: 0 }}>
        <img src="/logo-proit.png" alt="PRO IT" style={{ height: 18, objectFit: 'contain', opacity: 0.5 }} />
      </div>

      {/* MODAL MBYLL FATURËN */}
      {modalMbyll && selTav && (
        <MbyllFaturen
          tavolina={selTav}
          onMbyll={r => { setModalMbyll(false); setSelTav(null); if (onMbyllFatura) onMbyllFatura(r); ngarko(); }}
          onAnulo={() => setModalMbyll(false)}
        />
      )}

      {/* MODAL EDITO TAVOLINËN */}
      {modalEdito && editTav && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 320 }}>
            <div className="modal-title">✏️ Edito Tavolinën {editTav.numri}</div>
            <div className="form-group">
              <label className="form-label">Emri / Etiketa</label>
              <input value={editTav.emri || ''} onChange={e => setEditTav({ ...editTav, emri: e.target.value })}
                placeholder={`p.sh. Ballkoni, VIP, T${editTav.numri}`} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => setModalEdito(false)} className="btn-secondary" style={{ flex: 1 }}>Anulo</button>
              <button onClick={async () => {
                try { await api.put(`/tables/${editTav.id}`, { emri: editTav.emri }); } catch { }
                setModalEdito(false); ngarko();
              }} className="btn-primary" style={{ flex: 2 }}>✓ Ruaj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
