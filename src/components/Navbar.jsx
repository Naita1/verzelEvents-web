import { useState, useEffect } from "react";
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

const LABELS_ROLE = {
  CLIENTE: "Cliente",
  ORGANIZADOR: "Organizador",
  PORTARIA: "Portaria",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setMenuAberto(false);
  }

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleLogout() {
    setMenuAberto(false);
    logout();
    navigate("/login");
  }

  const linksDoRole = user?.role ? LINKS_POR_ROLE[user.role] || [] : [];
  const primeiroNome = user?.nome ? user.nome.trim().split(" ")[0] : "";
  const labelPerfil = user?.role ? LABELS_ROLE[user.role] || "" : "";

  const currentPath =
    location.pathname.endsWith("/") && location.pathname !== "/"
      ? location.pathname.slice(0, -1)
      : location.pathname;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? "bg-[#0b0305]/85 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40 py-3.5 px-6 md:px-16"
          : "bg-linear-to-b from-black/90 via-black/40 to-transparent pt-6 pb-4 px-6 md:px-16"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex flex-col text-white tracking-widest font-sans leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
          aria-label="The Stage Is Yours - Página Inicial"
        >
          <span className="text-xs md:text-sm font-semibold tracking-[0.2em] opacity-95">THE STAGE</span>
          <span className="text-xs md:text-sm font-semibold tracking-[0.2em] pl-6 text-brand">IS YOURS</span>
        </Link>

        {/* Navegação Desktop */}
        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-8 text-white font-sans text-xs md:text-sm tracking-wide">
          <Link
            to="/"
            aria-current={currentPath === "/" ? "page" : undefined}
            className={`group/link relative py-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm ${
              currentPath === "/" ? "text-white font-semibold" : "text-white/75 hover:text-white"
            }`}
          >
            Eventos
            <span
              className={`absolute left-0 bottom-0 h-0.5 bg-brand transition-all duration-300 ${
                currentPath === "/" ? "w-full" : "w-0 group-hover/link:w-full"
              }`}
            />
          </Link>

          {linksDoRole.map((link) => {
            const linkPath = link.to.endsWith("/") && link.to !== "/" ? link.to.slice(0, -1) : link.to;
            const isAtivo = currentPath === linkPath;

            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isAtivo ? "page" : undefined}
                className={`group/link relative py-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm ${
                  isAtivo ? "text-white font-semibold" : "text-white/75 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`absolute left-0 bottom-0 h-0.5 bg-brand transition-all duration-300 ${
                    isAtivo ? "w-full" : "w-0 group-hover/link:w-full"
                  }`}
                />
              </Link>
            );
          })}

          {user ? (
            <div className="flex items-center gap-6 pl-4 border-l border-white/10">
              <div className="flex flex-col items-start leading-tight">
                <span className="text-white text-xs font-semibold">{primeiroNome}</span>
                {labelPerfil && (
                  <span className="text-[10px] uppercase tracking-wider text-brand font-medium">
                    {labelPerfil}
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="group/link relative py-1 text-white/70 hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm"
                aria-label="Encerrar sessão"
              >
                Sair
                <span className="absolute left-0 bottom-0 w-0 group-hover/link:w-full h-0.5 bg-brand transition-all duration-300" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="group/link relative py-1 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wider uppercase transition-all duration-300 border border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Entrar
            </Link>
          )}
        </nav>

        {/* Botão Hambúrguer Mobile */}
        <button
          type="button"
          onClick={() => setMenuAberto((v) => !v)}
          aria-expanded={menuAberto}
          aria-controls="mobile-menu"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuAberto ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Drawer / Menu Mobile */}
      {menuAberto && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-x-0 top-full bg-[#0e0407]/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 shadow-2xl flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]"
        >
          <Link
            to="/"
            aria-current={currentPath === "/" ? "page" : undefined}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              currentPath === "/" ? "bg-white/10 text-white font-semibold" : "text-white/70 hover:text-white"
            }`}
          >
            Eventos
          </Link>

          {linksDoRole.map((link) => {
            const linkPath = link.to.endsWith("/") && link.to !== "/" ? link.to.slice(0, -1) : link.to;
            const isAtivo = currentPath === linkPath;

            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isAtivo ? "page" : undefined}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isAtivo ? "bg-white/10 text-white font-semibold" : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 mt-1 border-t border-white/10 flex items-center justify-between">
            {user ? (
              <>
                <div className="flex flex-col">
                  <span className="text-white text-xs font-semibold">{user.nome}</span>
                  {labelPerfil && (
                    <span className="text-[10px] uppercase tracking-wider text-brand">
                      {labelPerfil}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="py-1.5 px-4 rounded-full bg-white/10 text-white/80 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="w-full text-center py-2.5 rounded-full bg-brand hover:bg-brand-hover text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}