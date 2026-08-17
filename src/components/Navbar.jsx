import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS_POR_ROLE = {
  CLIENTE: [{ to: "/meus-ingressos", label: "Meus Ingressos" }],
  ORGANIZADOR: [{ to: "/organizador", label: "Meus Eventos" }],
  PORTARIA: [{ to: "/portaria", label: "Validar Ingresso" }],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linksDoRole = user ? LINKS_POR_ROLE[user.role] || [] : [];

  return (
    <nav className="bg-surface/80 backdrop-blur-sm border-b border-white/10 px-6 md:px-16 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="font-display text-2xl tracking-wide text-white">
        EVENT<span className="text-brand">.</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link
          to="/"
          className={`font-sans text-sm transition-colors ${
            location.pathname === "/"
              ? "text-white"
              : "text-white/50 hover:text-white"
          }`}
        >
          Eventos
        </Link>

        {linksDoRole.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`font-sans text-sm transition-colors ${
              location.pathname.startsWith(link.to)
                ? "text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}

        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <span className="font-sans text-sm text-white/50">
              {user.nome}
            </span>
            <button
              onClick={handleLogout}
              className="font-sans text-sm text-white/70 hover:text-brand transition-colors"
            >
              Sair
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="font-sans text-sm font-semibold bg-brand hover:bg-brand-hover text-white rounded-lg px-4 py-2 transition-colors"
          >
            Entrar
          </Link>
        )}
      </div>
    </nav>
  );
}