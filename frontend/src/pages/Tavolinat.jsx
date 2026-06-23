import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Tavolinat({ onZgjidh, onLogout, onRaport, onMbyllSukses }) {
  const [tavolinat, setTavolinat] = useState([]);
  const [selTav, setSelTav] = useState(null);
  const [porositeAktive, setPorositeAktive] = useState([]);
  const [modalMbyll, setModalMbyll] = useState(false);
  const [modalShiko, setModalShiko] = useState(false);
  const [metoda, setMetoda] = useState('cash');
  const [duke_mbyllur, setDukeMbyllur] = useState(false);
  const { user, theme, toggleTheme } = useAuth();

  useEffect(() => { ngarko(); }, []);

  // Rifresko çdo 15 sekonda
  useEffect(() => {
    const t = setInterval(ngarko, 15000);
    return () => clearInterval(t);
  }, []);

  async function ngarko() {
    try {
      // Merr tavolinat nga backend
      const { data } = await api.get('/tables');
      setTavolinat(data);
    } catch {
      // Fallback: nderto nga porositë aktive
      try {
        const { data: orders } = await api.get('/orders?status=AKTIVE&limit=100');
        const tavMap = {};
        for (const o of orders) {
          const nr = o.tavolinaNr;
          if (!nr) continue;
          if (!tavMap[nr]) tavMap[nr] = { id: nr, numri: nr, emri: null, aktive: true, totali: 0, items: [] };
          tavMap[nr].totali += Number(o.totali);
          tavMap[nr].items.push(...(o.items || []));
        }
        const lista = Array.from({ length: 15 }, (_, i) => ({
          id: i + 1, numri: i + 1, emri: null,
          aktive: !!(tavMap[i + 1]),
          totali: tavMap[i + 1]?.totali || 0,
          items: tavMap[i + 1]?.items || []
        }));
        setTavolinat(lista);
      } catch {
        setTavolinat(Array.from({ length: 15 }, (_, i) => ({
          id: i + 1, numri: i + 1, emri: null, aktive: false, totali: 0, items: []
        })));
      }
    }
  }

  async function zgjidhTavolinen(tav) {
    setSelTav(tav);
    if (tav.aktive) {
      // Merr porositë aktive
      try {
        const { data } = await api.get(`/orders/table/${tav.numri}`);
        setPorositeAktive(data.porosite || []);
      } catch { setPorositeAktive([]); }
    } else {
      setPorositeAktive([]);
    }
  }

  async function mbyllTavolinen() {
    if (!selTav) return;
    setDukeMbyllur(true);
    try {
      const { data } = await api.post(`/orders/table/${selTav.numri}/mbyll`, { metoda });
      setModalMbyll(false);
      setSelTav(null);
      setPorositeAktive([]);
      ngarko();
      if (onMbyllSukses) onMbyllSukses({ totali: data.totali, tavolina: selTav.numri, metoda, perdoruesi: user?.emri });
    } catch (err) {
      alert(err.response?.data?.gabim || 'Gabim gjate mbylljes.');
    } finally { setDukeMbyllur(false); }
  }

  const lira = tavolinat.filter(t => !t.aktive).length;
  const zena = tavolinat.filter(t => t.aktive).length;
  const totalDita = tavolinat.reduce((s, t) => s + Number(t.totali || 0), 0);

  return (
    <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '10px 12px 6px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo-p.png" alt="PRO IT" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tx)' }}>Kafe Nlagje</div>
            <div style={{ fontSize: 10, color: 'var(--lm)', fontWeight: 600 }}>{user?.emri}</div>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[['var(--lm)', lira, 'LIRA'], ['var(--or)', zena, 'ZËNA'], ['var(--bl)', `${totalDita.toFixed(0)}€`, 'SHUMË']].map(([c, v, l]) => (
            <div key={l} style={{ background: 'var(--bg2)', border: `1.5px solid var(--bd)`, borderRadius: 8, padding: '3px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 8, color: 'var(--mt)', fontWeight: 700 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={onRaport} style={{ background: 'rgba(37,99,235,0.08)', border: '1.5px solid rgba(37,99,235,0.25)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--bl)' }}>📊</button>
          <button onClick={toggleTheme} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bd)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', fontSize: 12 }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <button onClick={onLogout} style={{ background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--rd)' }}>DAL</button>
        </div>
      </div>

      {/* GRILLA TAVOLINAVE */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 7, minHeight: 0 }}>
        {tavolinat.map(tav => {
          const zgjedhur = selTav?.numri === tav.numri;
          return (
            <div key={tav.id} onClick={() => zgjidhTavolinen(zgjedhur ? null : tav)} style={{
              borderRadius: 12,
              border: `2.5px solid ${zgjedhur ? 'var(--lm)' : tav.aktive ? 'var(--or)' : 'var(--bd)'}`,
              background: zgjedhur ? 'rgba(90,158,15,0.1)' : tav.aktive ? 'rgba(234,88,12,0.05)' : 'var(--bg2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', transition: 'all 0.12s',
              boxShadow: zgjedhur ? '0 0 0 3px rgba(90,158,15,0.2)' : 'var(--sh)'
            }}>
              <div style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: tav.aktive ? 'var(--or)' : 'var(--bd)' }} />
              <div style={{ fontSize: 11, marginBottom: 1 }}>🪑</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: zgjedhur ? 'var(--lm)' : tav.aktive ? 'var(--or)' : 'var(--tx)', lineHeight: 1 }}>{tav.numri}</div>
              {tav.emri && <div style={{ fontSize: 8, color: 'var(--mt)', marginTop: 1 }}>{tav.emri}</div>}
              {tav.aktive && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--or)', marginTop: 2 }}>{Number(tav.totali).toFixed(2)}€</div>}
            </div>
          );
        })}
      </div>

      {/* LEGJENDA */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 5, flexShrink: 0 }}>
        {[['var(--bg2)', 'var(--bd)', 'E lirë'], ['rgba(234,88,12,0.15)', 'var(--or)', 'E zënë'], ['rgba(90,158,15,0.15)', 'var(--lm)', 'E zgjedhur']].map(([bg, bd, lbl]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--mt)' }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: bg, border: `2px solid ${bd}` }} />
            {lbl}
          </div>
        ))}
      </div>

      {/* BUTONAT */}
      {selTav && (
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 7, flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Shiko porositë aktive */}
          {selTav.aktive && (
            <button onClick={() => setModalShiko(true)} style={{ padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: 'var(--bg2)', border: '1.5px solid var(--bd)', color: 'var(--tx)', cursor: 'pointer' }}>
              👁️ Shiko ({porositeAktive.length})
            </button>
          )}
          {/* Mbyll faturën */}
          {selTav.aktive && (
            <button onClick={() => setModalMbyll(true)} style={{ padding: '9px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'rgba(234,88,12,0.1)', border: '1.5px solid var(--or)', color: 'var(--or)', cursor: 'pointer' }}>
              🧾 Mbyll — {Number(selTav.totali).toFixed(2)}€
            </button>
          )}
          {/* Shto porosi */}
          <button onClick={() => onZgjidh(selTav)} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'var(--lm)', color: 'var(--ld)', border: 'none', cursor: 'pointer' }}>
            + Porosi {selTav.aktive ? '(shto)' : ''} — Tav. {selTav.numri}
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ textAlign: 'center', marginTop: 5, flexShrink: 0 }}>
        <img src="/logo-proit.png" alt="PRO IT" style={{ height: 16, opacity: 0.4 }} />
      </div>

      {/* MODAL SHIKO POROSITË */}
      {modalShiko && selTav && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-title">🪑 Tavolina {selTav.numri} — Porositë Aktive</div>
            {porositeAktive.length === 0 ? (
              <div style={{ color: 'var(--mt)', textAlign: 'center', padding: 20 }}>Nuk ka porosi aktive.</div>
            ) : (
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {porositeAktive.map(p => (
                  <div key={p.id} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: 'var(--mt)' }}>#{p.numriPorosise} — {p.user?.emri}</span>
                      <span style={{ fontSize: 11, color: 'var(--mt)' }}>{new Date(p.krijuarMe).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {p.items?.map(it => (
                      <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--tx)' }}>{it.emriProduktit} x{Number(it.sasia)}</span>
                        <span style={{ color: 'var(--lm)', fontWeight: 600 }}>{Number(it.nentotali).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--bd)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>Totali:</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--lm)' }}>{Number(selTav.totali).toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setModalShiko(false)} className="btn-secondary" style={{ flex: 1 }}>Mbylle</button>
              <button onClick={() => { setModalShiko(false); setModalMbyll(true); }} style={{ flex: 2, padding: 10, background: 'var(--lm)', color: 'var(--ld)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                🧾 Mbyll Faturën
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MBYLL FATURËN */}
      {modalMbyll && selTav && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 340 }}>
            <div className="modal-title">💳 Mbyll Faturën — Tav. {selTav.numri}</div>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--lm)' }}>{Number(selTav.totali).toFixed(2)} €</div>
              <div style={{ fontSize: 11, color: 'var(--mt)' }}>{porositeAktive.length} porosi aktive</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[['cash', '💵', 'Cash'], ['card', '💳', 'Kartë']].map(([m, ic, lbl]) => (
                <div key={m} onClick={() => setMetoda(m)} style={{
                  padding: '12px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${metoda === m ? 'var(--lm)' : 'var(--bd)'}`,
                  background: metoda === m ? 'rgba(90,158,15,0.1)' : 'var(--bg3)',
                  transition: 'all 0.12s'
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{ic}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: metoda === m ? 'var(--lm)' : 'var(--tx)' }}>{lbl}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setModalMbyll(false)} className="btn-secondary" style={{ flex: 1 }}>Anulo</button>
              <button onClick={mbyllTavolinen} disabled={duke_mbyllur} style={{ flex: 2, padding: 12, background: 'var(--lm)', color: 'var(--ld)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                {duke_mbyllur ? 'Duke mbyllur...' : '✓ KONFIRMO PAGESËN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
