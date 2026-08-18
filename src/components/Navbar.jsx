import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS_POR_ROLE = {
  CLIENTE: [{ to: "/meus-ingressos", label: "Meus Ingressos" }],
  ORGANIZADOR: [
    { to: "/organizador", label: "Meus Eventos" },
    { to: "/organizador/staff/novo", label: "Nova Equipe" },
  ],
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

  const linksDoRole = user?.role ? LINKS_POR_ROLE[user.role] || [] : [];
  const primeiroNome = user?.nome ? user.nome.trim().split(" ")[0] : "";

  // Normaliza o caminho atual removendo a barra final para evitar divergências ex: "/organizador/" vs "/organizador"
  const currentPath = location.pathname.endsWith("/") && location.pathname !== "/"
    ? location.pathname.slice(0, -1)
    : location.pathname;

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-linear-to-b from-black/80 to-transparent pt-6 pb-4 px-8 md:px-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <Link to="/" className="flex flex-col text-white tracking-widest font-sans leading-none">
          <span className="text-xs md:text-sm font-medium opacity-90">THE STAGE</span>
          <span className="text-xs md:text-sm font-medium pl-6 opacity-90">IS YOURS</span>
        </Link>

        <div className="flex items-center gap-8 text-white font-sans text-xs md:text-sm tracking-wide">
          
          {/* Link público 'Eventos' */}
          <Link
            to="/"
            className={`group/link relative transition-colors duration-200 ${
              currentPath === "/" ? "text-white font-semibold" : "text-white/70 hover:text-white"
            }`}
          >
            Eventos
            <span
              className={`absolute left-0 -bottom-1 h-px bg-brand transition-all duration-300 ${
                currentPath === "/" ? "w-full" : "w-0 group-hover/link:w-full"
              }`}
            />
          </Link>

          {/* Links do perfil (ORGANIZADOR, PORTARIA, etc.) */}
          {linksDoRole.map((link) => {
            const linkPath = link.to.endsWith("/") && link.to !== "/" ? link.to.slice(0, -1) : link.to;
            const isAtivo = currentPath === linkPath;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`group/link relative transition-colors duration-200 ${
                  isAtivo ? "text-white font-semibold" : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`absolute left-0 -bottom-1 h-px bg-brand transition-all duration-300 ${
                    isAtivo ? "w-full" : "w-0 group-hover/link:w-full"
                  }`}
                />
              </Link>
            );
          })}

          {user ? (
            <div className="flex items-center gap-8">
              <span className="opacity-90 font-medium">{primeiroNome}</span>
              
              <button
                onClick={handleLogout}
                className="group/link relative text-white/70 hover:text-white transition-colors duration-200"
              >
                Sair
                <span className="absolute left-0 -bottom-1 w-0 group-hover/link:w-full h-px bg-brand transition-all duration-300" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="group/link relative text-white/70 hover:text-white transition-colors duration-200"
            >
              Entrar
              <span className="absolute left-0 -bottom-1 w-0 group-hover/link:w-full h-px bg-brand transition-all duration-300" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}