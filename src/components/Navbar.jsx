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

  useEffect(() => {
    if (menuAberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  function handleLogout() {
    setMenuAberto(false);
    logout();
    navigate("/login");
  }

  const linksDoRole = user?.role ? LINKS_POR_ROLE[user.role] || [] : [];
  const primeiroNome = user?.nome ? user.nome.trim().split(" ")[0] : "";
  const labelPerfil = user?.role ? LABELS_ROLE[user.role] || "" : "";
  const inicialUsuario = user?.nome ? user.nome.trim().charAt(0).toUpperCase() : "";

  const currentPath =
    location.pathname.endsWith("/") && location.pathname !== "/"
      ? location.pathname.slice(0, -1)
      : location.pathname;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? "bg-[#0b0306]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/60 py-3 px-6 md:px-12"
          : "bg-linear-to-b from-black/95 via-black/50 to-transparent pt-5 pb-4 px-6 md:px-12"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link
          to="/"
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-xl py-1"
          aria-label="The Stage Is Yours - Página Inicial"
        >
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand via-[#b51f47] to-[#590d20] border border-white/20 flex items-center justify-center shadow-lg shadow-brand/30 group-hover:shadow-brand/50 group-hover:scale-105 transition-all duration-300">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2" />
              <path d="M13 17v2" />
              <path d="M13 11v2" />
            </svg>
          </div>
          <div className="flex flex-col font-sans leading-none select-none">
            <span className="text-xs md:text-sm font-bold tracking-[0.22em] text-white/95">THE STAGE</span>
            <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-brand">IS YOURS</span>
          </div>
        </Link>

        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-1.5 text-white font-sans text-xs md:text-sm">
          <Link
            to="/"
            aria-current={currentPath === "/" ? "page" : undefined}
            className={`relative px-4 py-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              currentPath === "/"
                ? "bg-white/12 text-white font-semibold shadow-inner"
                : "text-white/75 hover:text-white hover:bg-white/5"
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
                className={`relative px-4 py-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isAtivo
                    ? "bg-white/12 text-white font-semibold shadow-inner"
                    : "text-white/75 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {user ? (
            <div className="flex items-center gap-3 pl-4 ml-2 border-l border-white/15">
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full pl-1.5 pr-3 py-1">
                <span className="w-7 h-7 rounded-full bg-linear-to-br from-brand to-[#700d23] text-white text-xs font-bold flex items-center justify-center border border-white/20 shadow-sm">
                  {inicialUsuario}
                </span>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-white text-xs font-semibold">{primeiroNome}</span>
                  {labelPerfil && (
                    <span className="text-[9px] uppercase tracking-wider text-brand font-semibold">
                      {labelPerfil}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Encerrar sessão"
                title="Encerrar sessão"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="pl-3 ml-2 border-l border-white/15">
              <Link
                to="/login"
                className="px-5 py-2 rounded-full bg-linear-to-r from-brand to-[#bd224b] hover:brightness-110 active:scale-95 text-white font-semibold text-xs tracking-wider uppercase transition-all duration-200 shadow-md shadow-brand/30 border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Entrar
              </Link>
            </div>
          )}
        </nav>

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

      {menuAberto && (
        <>
          <div
            onClick={() => setMenuAberto(false)}
            className="md:hidden fixed inset-0 top-16.25 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
            aria-hidden="true"
          />

          <div
            id="mobile-menu"
            className="md:hidden fixed inset-x-0 top-full bg-[#120408]/98 backdrop-blur-2xl border-b border-white/15 px-6 py-6 shadow-2xl flex flex-col gap-3 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
          >
            <Link
              to="/"
              aria-current={currentPath === "/" ? "page" : undefined}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                currentPath === "/"
                  ? "bg-brand/20 text-white font-semibold border border-brand/40"
                  : "text-white/80 hover:text-white hover:bg-white/5"
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
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    isAtivo
                      ? "bg-brand/20 text-white font-semibold border border-brand/40"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-4 mt-2 border-t border-white/10">
              {user ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center border border-white/20">
                      {inicialUsuario}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-white text-xs font-semibold">{user.nome}</span>
                      {labelPerfil && (
                        <span className="text-[10px] uppercase tracking-wider text-brand font-semibold">
                          {labelPerfil}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="py-1.5 px-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold transition-colors"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand/30 transition-all"
                >
                  Entrar na Conta
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}