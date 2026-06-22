// ============================================================
// APP.JSX - Routing Kryesor (Kafe Nlagje - Powered by PRO IT)
// ============================================================
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';

function MeLayout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MeLayout><Dashboard /></MeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <MeLayout><POS /></MeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/porosite"
        element={
          <ProtectedRoute>
            <MeLayout><Orders /></MeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/produktet"
        element={
          <ProtectedRoute rolet={['ADMIN', 'MENAXHER']}>
            <MeLayout><Products /></MeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stoku"
        element={
          <ProtectedRoute rolet={['ADMIN', 'MENAXHER']}>
            <MeLayout><Stock /></MeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/raportet"
        element={
          <ProtectedRoute rolet={['ADMIN', 'MENAXHER']}>
            <MeLayout><Reports /></MeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/perdoruesit"
        element={
          <ProtectedRoute rolet={['ADMIN']}>
            <MeLayout><Users /></MeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cilesimet"
        element={
          <ProtectedRoute rolet={['ADMIN', 'MENAXHER']}>
            <MeLayout><Settings /></MeLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<div className="text-white p-10">Faqja nuk u gjet.</div>} />
    </Routes>
  );
}
