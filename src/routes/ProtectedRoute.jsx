import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, rolesPermitidas }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="relative min-h-screen bg-bg flex items-center justify-center font-sans overflow-hidden">
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="w-12 h-12 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-sans text-[11px] font-bold text-white/70 uppercase tracking-[0.25em]">
              Autenticando Sessão
            </span>
            <span className="font-sans text-[10px] text-white/30 tracking-wider">
              Aguarde a validação das credenciais...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (rolesPermitidas && !rolesPermitidas.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}