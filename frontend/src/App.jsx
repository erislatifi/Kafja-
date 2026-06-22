import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import PinLogin from './pages/PinLogin';
import Tavolinat from './pages/Tavolinat';
import POSTouch from './pages/POSTouch';
import Sukses from './pages/Sukses';
import AdminLayout from './components/layout/AdminLayout';

// Faqet e Adminit
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';

const ADMIN_ROLET = ['ADMIN'];
const PUNONES_ROLET = ['KAMERIER', 'ARKATAR', 'MENAXHER'];

export default function App() {
  const { user, logout, loading } = useAuth();
  const [faza, setFaza] = useState('pin'); // pin | tavolina | pos | sukses | admin
  const [tavolinaZgjedhur, setTavolinaZgjedhur] = useState(null);
  const [suksesTeDhenat, setSuksesTeDhenat] = useState(null);
  const [adminFaqja, setAdminFaqja] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--lm)', fontSize: 16 }}>Duke u ngarkuar...</div>
      </div>
    );
  }

  function onLoginSukses(userRi) {
    if (ADMIN_ROLET.includes(userRi.role)) {
      setFaza('admin');
    } else {
      setFaza('tavolina');
    }
  }

  function onZgjidh(tav) {
    setTavolinaZgjedhur(tav);
    setFaza('pos');
  }

  function onPorosiaSuksesshme(totali, tavNr) {
    setSuksesTeDhenat({ totali, tavolina: tavNr, perdoruesi: user?.emri });
    setFaza('sukses_porosi');
  }

  function onMbyllFatura(rezultati) {
    setSuksesTeDhenat({
      totali: rezultati.totali,
      tavolina: rezultati.tavolina?.numri,
      perdoruesi: user?.emri,
      metoda: rezultati.metoda
    });
    setFaza('sukses_fatura');
  }

  function doLogout() {
    logout();
    setFaza('pin');
    setTavolinaZgjedhur(null);
  }

  // PIN - faza fillestare
  if (!user || faza === 'pin') {
    return <PinLogin onSuccess={onLoginSukses} />;
  }

  // ADMIN PANEL
  if (faza === 'admin' && ADMIN_ROLET.includes(user.role)) {
    const faqet = { dashboard: <Dashboard />, products: <Products />, stock: <Stock />, orders: <Orders />, reports: <Reports />, users: <Users />, settings: <Settings /> };
    return (
      <AdminLayout faqjaAktive={adminFaqja} onNdryshoFaqjen={setAdminFaqja} onLogout={doLogout}>
        {faqet[adminFaqja] || <Dashboard />}
      </AdminLayout>
    );
  }

  // TAVOLINAT
  if (faza === 'tavolina') {
    return <Tavolinat onZgjidh={onZgjidh} onLogout={doLogout} onMbyllFatura={onMbyllFatura} />;
  }

  // POS
  if (faza === 'pos') {
    return (
      <POSTouch
        tavolina={tavolinaZgjedhur}
        onKthehu={() => setFaza('tavolina')}
        onPorosiaSuksesshme={onPorosiaSuksesshme}
      />
    );
  }

  // SUKSES pas porosie - auto-logout
  if (faza === 'sukses_porosi') {
    return (
      <Sukses
        totali={suksesTeDhenat?.totali}
        tavolina={suksesTeDhenat?.tavolina}
        perdoruesi={suksesTeDhenat?.perdoruesi}
        metoda="cash"
        onKthet={doLogout}
      />
    );
  }

  // SUKSES pas mbylljes se fatures
  if (faza === 'sukses_fatura') {
    return (
      <Sukses
        totali={suksesTeDhenat?.totali}
        tavolina={suksesTeDhenat?.tavolina}
        perdoruesi={suksesTeDhenat?.perdoruesi}
        metoda={suksesTeDhenat?.metoda || 'cash'}
        onKthet={doLogout}
      />
    );
  }

  return <PinLogin onSuccess={onLoginSukses} />;
}
