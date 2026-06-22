import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Settings() {
  const [printeret, setPrinteret] = useState([]);
  const [modal, setModal] = useState(false);
  const [printerEdit, setPrinterEdit] = useState(null);
  const [forma, setForma] = useState({ emri: '', lidhja: 'USB', gjeresiaMM: 80, pathUSB: '/dev/usb/lp0', ipAdresa: '', porti: 9100, parazgjedhur: false });
  const [mesazh, setMesazh] = useState(null);

  useEffect(() => { ngarko(); }, []);
  async function ngarko() {
    try { const { data } = await api.get('/printers'); setPrinteret(data); } catch { }
  }
  function hapModal(p = null) {
    setPrinterEdit(p);
    setForma(p ? { emri: p.emri, lidhja: p.lidhja, gjeresiaMM: p.gjeresiaMM, pathUSB: p.pathUSB || '', ipAdresa: p.ipAdresa || '', porti: p.porti || 9100, parazgjedhur: p.parazgjedhur }
      : { emri: '', lidhja: 'USB', gjeresiaMM: 80, pathUSB: '/dev/usb/lp0', ipAdresa: '', porti: 9100, parazgjedhur: false });
    setModal(true);
  }
  async function ruaj(e) {
    e.preventDefault();
    try {
      if (printerEdit) await api.put(`/printers/${printerEdit.id}`, forma);
      else await api.post('/printers', forma);
      setModal(false); ngarko();
    } catch { }
  }
  async function testo(id) {
    setMesazh(null);
    try { await api.post(`/printers/${id}/test`); setMesazh({ tip: 'ok', tekst: 'Fatura test u dërgua me sukses!' }); }
    catch (err) { setMesazh({ tip: 'err', tekst: err.response?.data?.gabim || 'Gabim gjate testimit.' }); }
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)', marginBottom: 18 }}>Cilesimet — Printeret</div>

      {mesazh && (
        <div style={{ marginBottom: 14, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: mesazh.tip === 'ok' ? 'rgba(90,158,15,0.1)' : 'rgba(220,38,38,0.08)', color: mesazh.tip === 'ok' ? 'var(--lm)' : 'var(--rd)', border: `1px solid ${mesazh.tip === 'ok' ? 'var(--lm)' : 'var(--rd)'}` }}>
          {mesazh.tekst}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={() => hapModal()} className="btn-primary">+ Printer i Ri</button>
      </div>

      {printeret.length === 0 ? (
        <div className="kard" style={{ textAlign: 'center', padding: 40, color: 'var(--mt)' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🖨️</div>
          <div>Nuk është konfiguruar asnjë printer.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {printeret.map(p => (
            <div key={p.id} className="kard" style={{ borderColor: p.parazgjedhur ? 'var(--lm)' : 'var(--bd)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>🖨️</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--tx)', fontSize: 14 }}>{p.emri}</div>
                    {p.parazgjedhur && <span className="badge-green" style={{ marginTop: 3 }}>✓ Parazgjedhur</span>}
                  </div>
                </div>
                <button onClick={() => hapModal(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✏️</button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--mt)', marginBottom: 4 }}>Lidhja: <strong style={{ color: 'var(--tx)' }}>{p.lidhja}</strong> • {p.gjeresiaMM}mm</div>
              <div style={{ fontSize: 12, color: 'var(--mt)', marginBottom: 12 }}>{p.lidhja === 'USB' ? p.pathUSB : `${p.ipAdresa}:${p.porti}`}</div>
              <button onClick={() => testo(p.id)} className="btn-secondary" style={{ fontSize: 12, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 5 }}>⚡ Testo Printerin</button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-title">{printerEdit ? 'Edito Printerin' : 'Printer i Ri'}</div>
            <form onSubmit={ruaj}>
              <div className="form-group"><label className="form-label">Emri *</label><input required value={forma.emri} onChange={e => setForma({ ...forma, emri: e.target.value })} placeholder="p.sh. Printeri Kryesor" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group"><label className="form-label">Lidhja</label>
                  <select value={forma.lidhja} onChange={e => setForma({ ...forma, lidhja: e.target.value })}>
                    <option value="USB">USB</option><option value="NETWORK">Network (IP)</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Gjerësia</label>
                  <select value={forma.gjeresiaMM} onChange={e => setForma({ ...forma, gjeresiaMM: Number(e.target.value) })}>
                    <option value={58}>58mm</option><option value={80}>80mm</option>
                  </select>
                </div>
              </div>
              {forma.lidhja === 'USB'
                ? <div className="form-group"><label className="form-label">Path USB</label><input value={forma.pathUSB} onChange={e => setForma({ ...forma, pathUSB: e.target.value })} placeholder="/dev/usb/lp0" /></div>
                : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group"><label className="form-label">IP Adresa</label><input value={forma.ipAdresa} onChange={e => setForma({ ...forma, ipAdresa: e.target.value })} placeholder="192.168.1.50" /></div>
                    <div className="form-group"><label className="form-label">Porti</label><input type="number" value={forma.porti} onChange={e => setForma({ ...forma, porti: Number(e.target.value) })} /></div>
                  </div>
              }
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--tx)', marginBottom: 16, cursor: 'pointer' }}>
                <input type="checkbox" checked={forma.parazgjedhur} onChange={e => setForma({ ...forma, parazgjedhur: e.target.checked })} style={{ width: 'auto', accentColor: 'var(--lm)' }} />
                Vendose si printer parazgjedhur
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary" style={{ flex: 1 }}>Anulo</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>✓ Ruaj</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
