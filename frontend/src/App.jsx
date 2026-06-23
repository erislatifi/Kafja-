import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import PinLogin from './pages/PinLogin';
import Tavolinat from './pages/Tavolinat';
import POSTouch from './pages/POSTouch';
import Sukses from './pages/Sukses';
import RaportiKamarjerit from './pages/RaportiKamarjerit';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';

export default function App() {
  const { user, logout, loading } = useAuth();
  const [faza, setFaza] = useState('pin');
  const [tavolinaZgjedhur, setTavolinaZgjedhur] = useState(null);
  const [suksesTeDhenat, setSuksesTeDhenat] = useState(null);
  const [adminFaqja, setAdminFaqja] = useState('dashboard');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ color: 'var(--lm)', fontSize: 16 }}>Duke u ngarkuar...</div>
    </div>
  );

  function onLoginSukses(userRi) {
    if (userRi.role === 'ADMIN' || userRi.role === 'MENAXHER') setFaza('admin');
    else setFaza('tavolina');
  }

  function doLogout() {
    logout();
    setFaza('pin');
    setTavolinaZgjedhur(null);
  }

  if (!user || faza === 'pin') return <PinLogin onSuccess={onLoginSukses} />;

  if (faza === 'admin') {
    const faqet = {
      dashboard: <Dashboard />,
      products: <Products />,
      stock: <Stock />,
      orders: <Orders />,
      reports: <Reports />,
      users: <Users />,
      settings: <Settings />
    };
    return (
      <AdminLayout faqjaAktive={adminFaqja} onNdryshoFaqjen={setAdminFaqja} onLogout={doLogout}
      onRaport={() => setFaza("raport_kamerier")}>
        {faqet[adminFaqja] || <Dashboard />}
      </AdminLayout>
    );
  }

  if (faza === 'tavolina') return (
    <Tavolinat
      onZgjidh={tav => { setTavolinaZgjedhur(tav); setFaza('pos'); }}
      onLogout={doLogout}
      onRaport={() => setFaza("raport_kamerier")}
      onMbyllFatura={r => {
        setSuksesTeDhenat({ totali: r.totali, tavolina: r.tavolina?.numri, perdoruesi: user?.emri, metoda: r.metoda });
        setFaza('sukses_fatura');
      }}
    />
  );

  if (faza === 'pos') return (
    <POSTouch
      tavolina={tavolinaZgjedhur}
      onKthehu={() => setFaza('tavolina')}
      onPorosiaSuksesshme={(totali, tavNr) => {
        setSuksesTeDhenat({ totali, tavolina: tavNr, perdoruesi: user?.emri });
        setFaza('sukses_porosi');
      }}
    />
  );

  if (faza === 'raport_kamerier') return (
    <RaportiKamarjerit
      onKthehu={() => setFaza('tavolina')}
      onLogout={doLogout}
      onRaport={() => setFaza("raport_kamerier")}
    />
  );

  if (faza === 'sukses_porosi') return (
    <Sukses totali={suksesTeDhenat?.totali} tavolina={suksesTeDhenat?.tavolina}
      perdoruesi={suksesTeDhenat?.perdoruesi} metoda="cash"
      onKthet={doLogout} />
  );

  if (faza === 'sukses_fatura') return (
    <Sukses totali={suksesTeDhenat?.totali} tavolina={suksesTeDhenat?.tavolina}
      perdoruesi={suksesTeDhenat?.perdoruesi} metoda={suksesTeDhenat?.metoda || 'cash'}
      onKthet={doLogout} />
  );

  return <PinLogin onSuccess={onLoginSukses} />;
}
