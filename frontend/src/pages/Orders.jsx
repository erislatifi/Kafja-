import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Orders() {
  const [porosite, setPorosite] = useState([]);
  const [detajet, setDetajet] = useState(null);
  const [duke_ngarkuar, setDukeNgarkuar] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setPorosite(r.data)).catch(() => {}).finally(() => setDukeNgarkuar(false));
  }, []);

  async function riprinto(id) {
    try { await api.post(`/orders/${id}/printo`); alert('Fatura u dërgua për printim.'); }
    catch { alert('Gabim në printim.'); }
  }

  const statusInfo = {
    PERFUNDUAR: ['badge-green', 'Perfunduar'],
    ANULUAR: ['badge-red', 'Anuluar'],
    AKTIVE: ['badge-blue', 'Aktive'],
  };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)', marginBottom: 18 }}>Porosite</div>

      <div className="tabela">
        <table>
          <thead>
            <tr><th>#</th><th>Data</th><th>Perdoruesi</th><th>Totali</th><th>Statusi</th><th>Veprime</th></tr>
          </thead>
          <tbody>
            {duke_ngarkuar ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--mt)' }}>Duke u ngarkuar...</td></tr>
            ) : porosite.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--mt)' }}>Nuk ka porosi akoma.</td></tr>
            ) : porosite.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 700 }}>#{p.numriPorosise}</td>
                <td style={{ color: 'var(--mt)', fontSize: 12 }}>{new Date(p.krijuarMe).toLocaleString('sq-AL')}</td>
                <td>{p.user?.emri}</td>
                <td style={{ color: 'var(--lm)', fontWeight: 700 }}>{Number(p.totali).toFixed(2)} €</td>
                <td><span className={statusInfo[p.status]?.[0] || 'badge-green'}>{statusInfo[p.status]?.[1] || p.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setDetajet(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--mt)' }}>👁️</button>
                    <button onClick={() => riprinto(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--mt)' }}>🖨️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detajet && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-title">Porosia #{detajet.numriPorosise}</div>
            <div style={{ fontSize: 12, color: 'var(--mt)', marginBottom: 4 }}>Perdoruesi: <strong style={{ color: 'var(--tx)' }}>{detajet.user?.emri}</strong></div>
            <div style={{ fontSize: 12, color: 'var(--mt)', marginBottom: 14 }}>Data: <strong style={{ color: 'var(--tx)' }}>{new Date(detajet.krijuarMe).toLocaleString('sq-AL')}</strong></div>
            <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 12, marginBottom: 12 }}>
              {detajet.items?.map(it => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid var(--bd)' }}>
                  <span style={{ color: 'var(--tx)' }}>{it.emriProduktit} x{Number(it.sasia)}</span>
                  <span style={{ color: 'var(--lm)', fontWeight: 600 }}>{Number(it.nentotali).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
              <span style={{ color: 'var(--tx)' }}>Totali</span>
              <span style={{ color: 'var(--lm)' }}>{Number(detajet.totali).toFixed(2)} €</span>
            </div>
            <button onClick={() => setDetajet(null)} className="btn-secondary" style={{ width: '100%' }}>Mbylle</button>
          </div>
        </div>
      )}
    </div>
  );
}
