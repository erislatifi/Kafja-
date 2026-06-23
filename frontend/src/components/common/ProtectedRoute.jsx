// ============================================================
// PROTECTED ROUTE - Mbron rrugen, kerkon kycje dhe (opsionalisht) rol specifik
// ============================================================
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, rolet }) {
  const { user, duke_u_ngarkuar } = useAuth();

  if (duke_u_ngarkuar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-proit-black">
        <div className="text-proit-lime text-lg font-medium">Duke u ngarkuar...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (rolet && !rolet.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-proit-black">
        <div className="card text-center max-w-md">
          <p className="text-red-400 text-lg font-semibold mb-2">Qasje e Ndaluar</p>
          <p className="text-proit-muted">Nuk keni leje per te hyre ne kete faqe.</p>
        </div>
      </div>
    );
  }

  return children;
}
