// ============================================================
// POS PAGE - Krijim porosie e shpejte (Liste kompakte + kerkim)
// ============================================================
import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Search, Plus, Minus, Trash2, Printer, ShoppingCart, X, CheckCircle } from 'lucide-react';

export default function POS() {
  const [produktet, setProduktet] = useState([]);
  const [kategorite, setKategorite] = useState([]);
  const [kerkimi, setKerkimi] = useState('');
  const [kategoriaAktive, setKategoriaAktive] = useState('TE_GJITHA');
  const [shporta, setShporta] = useState([]); // [{ product, sasia }]
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);
  const [dukeRuajtur, setDukeRuajtur] = useState(false);
  const [gabim, setGabim] = useState('');
  const [porosiaSukses, setPorosiaSukses] = useState(null);

  useEffect(() => {
    ngarkoTeDhenat();
  }, []);

  async function ngarkoTeDhenat() {
    setDukeNgarkuar(true);
    try {
      const [resProd, resKat] = await Promise.all([
        api.get('/products?aktiv=true'),
        api.get('/products/categories/all'),
      ]);
      setProduktet(resProd.data);
      setKategorite(resKat.data);
    } catch (err) {
      setGabim('Gabim ne ngarkimin e produkteve.');
    } finally {
      setDukeNgarkuar(false);
    }
  }

  const produktetFiltruara = useMemo(() => {
    return produktet.filter((p) => {
      const perputhetKerkimi =
        !kerkimi ||
        p.emri.toLowerCase().includes(kerkimi.toLowerCase()) ||
        p.barkod?.toLowerCase().includes(kerkimi.toLowerCase());
      const perputhetKategoria = kategoriaAktive === 'TE_GJITHA' || p.categoryId === kategoriaAktive;
      return perputhetKerkimi && perputhetKategoria;
    });
  }, [produktet, kerkimi, kategoriaAktive]);

  function shtoNeShporte(produkti) {
    setShporta((prev) => {
      const ekzistues = prev.find((it) => it.product.id === produkti.id);
      if (ekzistues) {
        if (Number(ekzistues.sasia) + 1 > Number(produkti.sasiaStok)) return prev;
        return prev.map((it) =>
          it.product.id === produkti.id ? { ...it, sasia: it.sasia + 1 } : it
        );
      }
      if (Number(produkti.sasiaStok) < 1) return prev;
      return [...prev, { product: produkti, sasia: 1 }];
    });
  }

  function ndryshoSasine(productId, delta) {
    setShporta((prev) =>
      prev
        .map((it) => {
          if (it.product.id !== productId) return it;
          const sasiaRe = it.sasia + delta;
          if (sasiaRe > Number(it.product.sasiaStok)) return it;
          return { ...it, sasia: sasiaRe };
        })
        .filter((it) => it.sasia > 0)
    );
  }

  function hiqNgaShporta(productId) {
    setShporta((prev) => prev.filter((it) => it.product.id !== productId));
  }

  function pastroShporten() {
    setShporta([]);
    setPorosiaSukses(null);
  }

  const totali = useMemo(
    () => shporta.reduce((sum, it) => sum + Number(it.product.cmimiShitjes) * it.sasia, 0),
    [shporta]
  );

  async function konfirmoPorosine() {
    if (shporta.length === 0) return;
    setDukeRuajtur(true);
    setGabim('');
    try {
      const { data } = await api.post('/orders', {
        items: shporta.map((it) => ({ productId: it.product.id, sasia: it.sasia })),
      });

      // printim automatik
      try {
        await api.post(`/orders/${data.id}/printo`);
      } catch (errPrint) {
        console.warn('Printimi deshtoi:', errPrint);
      }

      setPorosiaSukses(data);
      setShporta([]);
      ngarkoTeDhenat(); // rifresko stokun
    } catch (err) {
      setGabim(err.response?.data?.gabim || 'Gabim gjate krijimit te porosise.');
    } finally {
      setDukeRuajtur(false);
    }
  }

  async function riprintoPorosine() {
    if (!porosiaSukses) return;
    try {
      await api.post(`/orders/${porosiaSukses.id}/printo`);
    } catch (err) {
      setGabim('Gabim gjate ri-printimit.');
    }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-110px)]">
      {/* LISTA E PRODUKTEVE */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white mb-3">Porosi e Re</h1>
          <div className="relative mb-3">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-proit-muted" />
            <input
              type="text"
              value={kerkimi}
              onChange={(e) => setKerkimi(e.target.value)}
              placeholder="Kerko produkt ose barkod..."
              className="input-field pl-10"
              autoFocus
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setKategoriaAktive('TE_GJITHA')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                kategoriaAktive === 'TE_GJITHA'
                  ? 'bg-proit-lime text-proit-black'
                  : 'bg-proit-panel text-proit-muted hover:text-white'
              }`}
            >
              Te Gjitha
            </button>
            {kategorite.map((k) => (
              <button
                key={k.id}
                onClick={() => setKategoriaAktive(k.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  kategoriaAktive === k.id
                    ? 'bg-proit-lime text-proit-black'
                    : 'bg-proit-panel text-proit-muted hover:text-white'
                }`}
              >
                {k.ikona} {k.emri}
              </button>
            ))}
          </div>
        </div>

        <div className="card flex-1 overflow-y-auto p-0">
          {dukeNgarkuar ? (
            <div className="p-8 text-center text-proit-muted">Duke u ngarkuar...</div>
          ) : produktetFiltruara.length === 0 ? (
            <div className="p-8 text-center text-proit-muted">Nuk u gjet asnje produkt.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-proit-panel border-b border-proit-border">
                <tr className="text-left text-proit-muted">
                  <th className="px-4 py-3 font-medium">Produkti</th>
                  <th className="px-4 py-3 font-medium">Kategoria</th>
                  <th className="px-4 py-3 font-medium text-right">Çmimi</th>
                  <th className="px-4 py-3 font-medium text-right">Stoku</th>
                  <th className="px-4 py-3 font-medium text-center">Shto</th>
                </tr>
              </thead>
              <tbody>
                {produktetFiltruara.map((p) => {
                  const stokUlet = Number(p.sasiaStok) <= Number(p.alarmStokuMin);
                  const stokZero = Number(p.sasiaStok) <= 0;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-proit-border last:border-0 hover:bg-proit-dark/50 cursor-pointer"
                      onClick={() => !stokZero && shtoNeShporte(p)}
                    >
                      <td className="px-4 py-3 text-white font-medium">{p.emri}</td>
                      <td className="px-4 py-3 text-proit-muted">{p.category?.emri}</td>
                      <td className="px-4 py-3 text-right text-proit-lime font-semibold">
                        {Number(p.cmimiShitjes).toFixed(2)} €
                      </td>
                      <td className={`px-4 py-3 text-right ${stokUlet ? 'text-orange-400' : 'text-proit-muted'}`}>
                        {Number(p.sasiaStok)} {p.njesia === 'COPE' ? 'cope' : p.njesia.toLowerCase()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          disabled={stokZero}
                          className="w-8 h-8 rounded-lg bg-proit-lime text-proit-black flex items-center justify-center mx-auto disabled:opacity-30 disabled:cursor-not-allowed hover:bg-proit-lime-light"
                        >
                          <Plus size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SHPORTA / POROSIA */}
      <div className="w-96 flex flex-col shrink-0">
        <div className="card flex-1 flex flex-col overflow-hidden p-0">
          <div className="p-4 border-b border-proit-border flex items-center gap-2">
            <ShoppingCart size={18} className="text-proit-lime" />
            <h2 className="font-bold text-white">Porosia Aktuale</h2>
            {shporta.length > 0 && (
              <button onClick={pastroShporten} className="ml-auto text-xs text-red-400 hover:text-red-300">
                Pastro
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {shporta.length === 0 ? (
              <p className="text-proit-muted text-sm text-center py-8">Shporta eshte bosh.<br />Klikoni nje produkt per ta shtuar.</p>
            ) : (
              shporta.map((it) => (
                <div key={it.product.id} className="bg-proit-dark rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-white">{it.product.emri}</p>
                    <button onClick={() => hiqNgaShporta(it.product.id)} className="text-proit-muted hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => ndryshoSasine(it.product.id, -1)}
                        className="w-6 h-6 rounded bg-proit-panel border border-proit-border flex items-center justify-center text-white hover:border-proit-lime"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm text-white w-6 text-center">{it.sasia}</span>
                      <button
                        onClick={() => ndryshoSasine(it.product.id, 1)}
                        className="w-6 h-6 rounded bg-proit-panel border border-proit-border flex items-center justify-center text-white hover:border-proit-lime"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="text-proit-lime font-semibold text-sm">
                      {(Number(it.product.cmimiShitjes) * it.sasia).toFixed(2)} €
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {gabim && (
            <div className="mx-3 mb-2 text-xs text-red-300 bg-red-900/20 border border-red-800 px-3 py-2 rounded-lg">
              {gabim}
            </div>
          )}

          {porosiaSukses && (
            <div className="mx-3 mb-2 bg-proit-lime/10 border border-proit-lime text-proit-lime px-3 py-2.5 rounded-lg text-sm">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <CheckCircle size={16} />
                Porosia #{porosiaSukses.numriPorosise} u krye!
              </div>
              <button onClick={riprintoPorosine} className="flex items-center gap-1 text-xs underline mt-1">
                <Printer size={12} /> Ri-printo faturen
              </button>
            </div>
          )}

          <div className="p-4 border-t border-proit-border">
            <div className="flex justify-between items-center mb-3">
              <span className="text-proit-muted font-medium">Totali</span>
              <span className="text-2xl font-bold text-proit-lime">{totali.toFixed(2)} €</span>
            </div>
            <button
              onClick={konfirmoPorosine}
              disabled={shporta.length === 0 || dukeRuajtur}
              className="btn-primary w-full justify-center flex items-center gap-2 py-3"
            >
              <Printer size={18} />
              {dukeRuajtur ? 'Duke ruajtur...' : 'Konfirmo dhe Printo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
