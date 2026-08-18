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

  const linksDoRole = user?.role ? LINKS_POR_ROLE[user.role] || [] : [];
  
  const primeiroNome = user?.nome ? user.nome.trim().split(" ")[0] : "";

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-linear-to-b from-black/80 to-transparent pt-6 pb-4 px-8 md:px-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <Link to="/" className="flex flex-col text-white tracking-widest font-sans leading-none">
          <span className="text-xs md:text-sm font-medium opacity-90">THE STAGE</span>
          <span className="text-xs md:text-sm font-medium pl-6 opacity-90">IS YOURS</span>
        </Link>

        <div className="flex items-center gap-8 text-white font-sans text-xs md:text-sm tracking-wide">
          
          <Link
            to="/"
            className={`group/link relative transition-colors duration-200 ${
              location.pathname === "/" ? "text-white font-semibold" : "text-white/70 hover:text-white"
            }`}
          >
            Eventos
            <span
              className={`absolute left-0 -bottom-1 h-px bg-brand transition-all duration-300 ${
                location.pathname === "/" ? "w-full" : "w-0 group-hover/link:w-full"
              }`}
            />
          </Link>

          {linksDoRole.map((link) => {
            const isAtivo = location.pathname.startsWith(link.to);
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