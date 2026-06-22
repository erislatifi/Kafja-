// ============================================================
// PRODUCTS PAGE - Menaxhimi i produkteve
// ============================================================
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';

const njesiteOpsione = [
  { v: 'COPE', l: 'Cope' },
  { v: 'KG', l: 'Kg' },
  { v: 'LITER', l: 'Liter' },
  { v: 'GRAM', l: 'Gram' },
  { v: 'ML', l: 'Ml' },
];

function ModalProdukti({ produkti, kategorite, onMbyll, onRuajt }) {
  const [forma, setForma] = useState(
    produkti || {
      emri: '',
      categoryId: kategorite[0]?.id || '',
      cmimiShitjes: '',
      cmimiBlerjes: '',
      sasiaStok: '',
      njesia: 'COPE',
      alarmStokuMin: 5,
      barkod: '',
    }
  );
  const [dukeRuajtur, setDukeRuajtur] = useState(false);
  const [gabim, setGabim] = useState('');

  async function dorezo(e) {
    e.preventDefault();
    setDukeRuajtur(true);
    setGabim('');
    try {
      await onRuajt(forma);
    } catch (err) {
      setGabim(err.response?.data?.gabim || 'Gabim gjate ruajtjes.');
    } finally {
      setDukeRuajtur(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">{produkti ? 'Edito Produktin' : 'Produkt i Ri'}</h2>
          <button onClick={onMbyll} className="text-proit-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        {gabim && <div className="bg-red-900/20 border border-red-800 text-red-300 text-sm px-3 py-2 rounded-lg mb-3">{gabim}</div>}

        <form onSubmit={dorezo} className="space-y-3">
          <div>
            <label className="label-field">Emri i Produktit *</label>
            <input
              required
              className="input-field"
              value={forma.emri}
              onChange={(e) => setForma({ ...forma, emri: e.target.value })}
            />
          </div>

          <div>
            <label className="label-field">Kategoria *</label>
            <select
              required
              className="input-field"
              value={forma.categoryId}
              onChange={(e) => setForma({ ...forma, categoryId: e.target.value })}
            >
              {kategorite.map((k) => (
                <option key={k.id} value={k.id}>{k.ikona} {k.emri}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Çmimi i Shitjes (€) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                value={forma.cmimiShitjes}
                onChange={(e) => setForma({ ...forma, cmimiShitjes: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">Çmimi i Blerjes (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                value={forma.cmimiBlerjes || ''}
                onChange={(e) => setForma({ ...forma, cmimiBlerjes: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {!produkti && (
              <div>
                <label className="label-field">Stoku Fillestar</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  className="input-field"
                  value={forma.sasiaStok}
                  onChange={(e) => setForma({ ...forma, sasiaStok: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="label-field">Njesia</label>
              <select
                className="input-field"
                value={forma.njesia}
                onChange={(e) => setForma({ ...forma, njesia: e.target.value })}
              >
                {njesiteOpsione.map((n) => (
                  <option key={n.v} value={n.v}>{n.l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Alarm Min.</label>
              <input
                type="number"
                step="0.001"
                min="0"
                className="input-field"
                value={forma.alarmStokuMin}
                onChange={(e) => setForma({ ...forma, alarmStokuMin: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label-field">Barkodi (opsional)</label>
            <input
              className="input-field"
              value={forma.barkod || ''}
              onChange={(e) => setForma({ ...forma, barkod: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onMbyll} className="btn-secondary flex-1 justify-center flex">
              Anulo
            </button>
            <button type="submit" disabled={dukeRuajtur} className="btn-primary flex-1 justify-center flex">
              {dukeRuajtur ? 'Duke ruajtur...' : 'Ruaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [produktet, setProduktet] = useState([]);
  const [kategorite, setKategorite] = useState([]);
  const [kerkimi, setKerkimi] = useState('');
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);
  const [modalHapur, setModalHapur] = useState(false);
  const [produktiNeEditim, setProduktiNeEditim] = useState(null);

  useEffect(() => {
    ngarko();
  }, []);

  async function ngarko() {
    setDukeNgarkuar(true);
    const [resProd, resKat] = await Promise.all([api.get('/products'), api.get('/products/categories/all')]);
    setProduktet(resProd.data);
    setKategorite(resKat.data);
    setDukeNgarkuar(false);
  }

  async function ruajProduktin(forma) {
    if (forma.id) {
      await api.put(`/products/${forma.id}`, forma);
    } else {
      await api.post('/products', forma);
    }
    setModalHapur(false);
    setProduktiNeEditim(null);
    ngarko();
  }

  async function fshijProduktin(id) {
    if (!confirm('A jeni te sigurt qe doni ta çaktivizoni kete produkt?')) return;
    await api.delete(`/products/${id}`);
    ngarko();
  }

  const produktetFiltruara = produktet.filter((p) => p.emri.toLowerCase().includes(kerkimi.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-white">Produktet</h1>
        <button
          onClick={() => {
            setProduktiNeEditim(null);
            setModalHapur(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Produkt i Ri
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-proit-muted" />
        <input
          className="input-field pl-10"
          placeholder="Kerko produkt..."
          value={kerkimi}
          onChange={(e) => setKerkimi(e.target.value)}
        />
      </div>

      <div className="card p-0 overflow-hidden">
        {dukeNgarkuar ? (
          <div className="p-8 text-center text-proit-muted">Duke u ngarkuar...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-proit-dark border-b border-proit-border">
              <tr className="text-left text-proit-muted">
                <th className="px-4 py-3 font-medium">Emri</th>
                <th className="px-4 py-3 font-medium">Kategoria</th>
                <th className="px-4 py-3 font-medium text-right">Çmimi Shitjes</th>
                <th className="px-4 py-3 font-medium text-right">Stoku</th>
                <th className="px-4 py-3 font-medium text-center">Statusi</th>
                <th className="px-4 py-3 font-medium text-center">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {produktetFiltruara.map((p) => (
                <tr key={p.id} className="border-b border-proit-border last:border-0">
                  <td className="px-4 py-3 text-white font-medium">{p.emri}</td>
                  <td className="px-4 py-3 text-proit-muted">{p.category?.emri}</td>
                  <td className="px-4 py-3 text-right text-proit-lime font-semibold">{Number(p.cmimiShitjes).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right text-white">{Number(p.sasiaStok)} {p.njesia}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${p.aktiv ? 'bg-proit-lime/20 text-proit-lime' : 'bg-red-900/30 text-red-400'}`}>
                      {p.aktiv ? 'Aktiv' : 'Jo Aktiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setProduktiNeEditim({ ...p, categoryId: p.categoryId });
                          setModalHapur(true);
                        }}
                        className="text-proit-muted hover:text-proit-lime"
                      >
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => fshijProduktin(p.id)} className="text-proit-muted hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalHapur && (
        <ModalProdukti
          produkti={produktiNeEditim}
          kategorite={kategorite}
          onMbyll={() => {
            setModalHapur(false);
            setProduktiNeEditim(null);
          }}
          onRuajt={ruajProduktin}
        />
      )}
    </div>
  );
}
