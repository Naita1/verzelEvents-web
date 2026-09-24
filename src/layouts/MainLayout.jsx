import { Outlet, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans selection:bg-brand selection:text-white relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-full focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white text-xs font-bold uppercase tracking-wider"
      >
        Pular para o conteúdo principal
      </a>

      <Navbar />

      <main id="main-content" className="flex-1 relative">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 bg-[#0a0205]/90 backdrop-blur-xl py-8 px-6 md:px-12 lg:px-16 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/50">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-brand via-[#b51f47] to-[#590d20] border border-white/20 flex items-center justify-center shadow-xs">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                <path d="M13 5v2" />
                <path d="M13 17v2" />
                <path d="M13 11v2" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold tracking-[0.2em] text-white/90 text-[11px]">THE STAGE</span>
              <span className="font-semibold tracking-[0.2em] text-brand text-[9px]">IS YOURS</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-white/60">
            <Link to="/" className="hover:text-white transition-colors">
              Eventos
            </Link>
            <Link to="/meus-ingressos" className="hover:text-white transition-colors">
              Meus Ingressos
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px]">Plataforma Operacional</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-white/5 text-center text-[10px] text-white/40">
          <p>
            &copy; {new Date().getFullYear()} The Stage Is Yours — Plataforma de entretenimento e bilhetagem digital.
          </p>
        </div>
      </footer>
    </div>
  );
}