// ============================================================
// STOCK PAGE - Menaxhimi i Stokut
// ============================================================
import { useState, useEffect } from 'react';
import api from '../services/api';
import { PackagePlus, AlertTriangle, History, X } from 'lucide-react';

function ModalShtoStok({ produktet, onMbyll, onRuajt }) {
  const [productId, setProductId] = useState(produktet[0]?.id || '');
  const [sasia, setSasia] = useState('');
  const [shenim, setShenim] = useState('');
  const [dukeRuajtur, setDukeRuajtur] = useState(false);
  const [gabim, setGabim] = useState('');

  async function dorezo(e) {
    e.preventDefault();
    setDukeRuajtur(true);
    setGabim('');
    try {
      await onRuajt({ productId, sasia, shenim });
    } catch (err) {
      setGabim(err.response?.data?.gabim || 'Gabim gjate shtimit te stokut.');
    } finally {
      setDukeRuajtur(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Shto Stok</h2>
          <button onClick={onMbyll} className="text-proit-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        {gabim && <div className="bg-red-900/20 border border-red-800 text-red-300 text-sm px-3 py-2 rounded-lg mb-3">{gabim}</div>}

        <form onSubmit={dorezo} className="space-y-3">
          <div>
            <label className="label-field">Produkti</label>
            <select required className="input-field" value={productId} onChange={(e) => setProductId(e.target.value)}>
              {produktet.map((p) => (
                <option key={p.id} value={p.id}>{p.emri} (Stoku: {Number(p.sasiaStok)} {p.njesia})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Sasia per ta shtuar</label>
            <input
              required
              type="number"
              step="0.001"
              min="0.001"
              className="input-field"
              value={sasia}
              onChange={(e) => setSasia(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Shenim (opsional)</label>
            <input className="input-field" value={shenim} onChange={(e) => setShenim(e.target.value)} placeholder="p.sh. Blerje nga furnizuesi X" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onMbyll} className="btn-secondary flex-1 justify-center flex">Anulo</button>
            <button type="submit" disabled={dukeRuajtur} className="btn-primary flex-1 justify-center flex">
              {dukeRuajtur ? 'Duke ruajtur...' : 'Shto Stok'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Stock() {
  const [produktet, setProduktet] = useState([]);
  const [alarmet, setAlarmet] = useState([]);
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);
  const [modalHapur, setModalHapur] = useState(false);
  const [tab, setTab] = useState('GJITHE'); // GJITHE | ALARM

  useEffect(() => {
    ngarko();
  }, []);

  async function ngarko() {
    setDukeNgarkuar(true);
    const [resProd, resAlarm] = await Promise.all([api.get('/products?aktiv=true'), api.get('/stock/alarm')]);
    setProduktet(resProd.data);
    setAlarmet(resAlarm.data);
    setDukeNgarkuar(false);
  }

  async function shtoStok(forma) {
    await api.post('/stock/shto', forma);
    setModalHapur(false);
    ngarko();
  }

  const listaPerShfaqje = tab === 'ALARM' ? alarmet : produktet;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-white">Stoku</h1>
        <button onClick={() => setModalHapur(true)} className="btn-primary flex items-center gap-2">
          <PackagePlus size={18} /> Shto Stok
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('GJITHE')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'GJITHE' ? 'bg-proit-lime text-proit-black' : 'bg-proit-panel text-proit-muted'}`}
        >
          Te Gjitha Produktet
        </button>
        <button
          onClick={() => setTab('ALARM')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${tab === 'ALARM' ? 'bg-orange-500 text-black' : 'bg-proit-panel text-proit-muted'}`}
        >
          <AlertTriangle size={14} /> Stok i Ulet ({alarmet.length})
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {dukeNgarkuar ? (
          <div className="p-8 text-center text-proit-muted">Duke u ngarkuar...</div>
        ) : listaPerShfaqje.length === 0 ? (
          <div className="p-8 text-center text-proit-muted">Nuk ka produkte per te shfaqur.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-proit-dark border-b border-proit-border">
              <tr className="text-left text-proit-muted">
                <th className="px-4 py-3 font-medium">Produkti</th>
                <th className="px-4 py-3 font-medium">Kategoria</th>
                <th className="px-4 py-3 font-medium text-right">Stoku Aktual</th>
                <th className="px-4 py-3 font-medium text-right">Niveli Alarm</th>
                <th className="px-4 py-3 font-medium text-center">Statusi</th>
              </tr>
            </thead>
            <tbody>
              {listaPerShfaqje.map((p) => {
                const ulet = Number(p.sasiaStok) <= Number(p.alarmStokuMin);
                return (
                  <tr key={p.id} className="border-b border-proit-border last:border-0">
                    <td className="px-4 py-3 text-white font-medium">{p.emri}</td>
                    <td className="px-4 py-3 text-proit-muted">{p.category?.emri}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${ulet ? 'text-orange-400' : 'text-white'}`}>
                      {Number(p.sasiaStok)} {p.njesia}
                    </td>
                    <td className="px-4 py-3 text-right text-proit-muted">{Number(p.alarmStokuMin)} {p.njesia}</td>
                    <td className="px-4 py-3 text-center">
                      {ulet ? (
                        <span className="badge bg-orange-500/20 text-orange-400">Stok i Ulet</span>
                      ) : (
                        <span className="badge bg-proit-lime/20 text-proit-lime">Ne Rregull</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalHapur && (
        <ModalShtoStok produktet={produktet} onMbyll={() => setModalHapur(false)} onRuajt={shtoStok} />
      )}
    </div>
  );
}
