import { useState, useMemo, useDeferredValue } from "react";
import { useEvents } from "../features/events/hooks/useEvents";
import Hero from "../components/Hero";
import FeaturedShowcase from "../components/FeaturedShowcase";
import EventCard from "../components/EventCard";
import backgroundImg from "../assets/background.jpg";

export default function Home() {
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const { data: eventos = [], isLoading: loading, error } = useEvents();
  const erro = error?.message;

  const tipos = useMemo(() => {
    const unicos = new Set(eventos.map((e) => e.tipo));
    return ["TODOS", ...unicos];
  }, [eventos]);

  const buscaDeferida = useDeferredValue(busca);

  const eventosFiltrados = useMemo(() => {
    const buscaLower = buscaDeferida.toLowerCase();
    return eventos.filter((evento) => {
      const combinaBusca =
        evento.titulo.toLowerCase().includes(buscaLower) ||
        evento.local.toLowerCase().includes(buscaLower);
      const combinaTipo = tipoFiltro === "TODOS" || evento.tipo === tipoFiltro;
      return combinaBusca && combinaTipo;
    });
  }, [eventos, buscaDeferida, tipoFiltro]);

  function limparFiltros() {
    setBusca("");
    setTipoFiltro("TODOS");
  }

  return (
    <div className="min-h-screen bg-bg font-sans selection:bg-brand selection:text-white">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={backgroundImg}
          alt="Background Eventos"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#140509]/90 via-[#0b0306]/92 to-bg" />
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="pointer-events-none absolute -top-40 right-0 w-140 h-140 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 pt-28 pb-16 space-y-12">
        <FeaturedShowcase eventos={eventos} loading={loading} />

        <Hero
          busca={busca}
          setBusca={setBusca}
          tipos={tipos}
          tipoFiltro={tipoFiltro}
          setTipoFiltro={setTipoFiltro}
        />
      </div>

      <div className="relative z-10 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-sans text-[11px] font-bold text-brand uppercase tracking-[0.22em] block mb-2">
                Catálogo completo
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide uppercase">
                TODOS OS <span className="text-brand">EVENTOS</span>
              </h2>
            </div>
            {!loading && !erro && (
              <span className="font-sans text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 whitespace-nowrap mb-1 shadow-xs">
                {eventosFiltrados.length} {eventosFiltrados.length === 1 ? "evento encontrado" : "eventos encontrados"}
              </span>
            )}
          </div>

          {erro && (
            <div className="bg-[#140509]/90 border border-red-500/30 rounded-3xl p-8 max-w-lg mx-auto text-center shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="font-display text-xl text-white uppercase tracking-wide mb-1">
                Não foi possível carregar os eventos
              </h3>
              <p className="font-sans text-xs text-white/60 mb-4">{erro}</p>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-[#140509]/80 border border-white/10 p-4 aspect-2/3 animate-pulse flex flex-col justify-between"
                >
                  <div className="w-16 h-5 rounded-full bg-white/10" />
                  <div className="space-y-2">
                    <div className="w-3/4 h-4 rounded bg-white/10" />
                    <div className="w-1/2 h-3 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !erro && eventosFiltrados.length === 0 && (
            <div className="bg-[#140509]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 max-w-md mx-auto text-center shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <svg className="w-7 h-7 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3 className="font-display text-xl text-white uppercase tracking-wide mb-1">
                Nenhum evento encontrado
              </h3>
              <p className="font-sans text-xs text-white/55 mb-6 leading-relaxed">
                Não encontramos resultados para a sua busca ou filtro selecionado. Que tal tentar outros termos?
              </p>
              <button
                type="button"
                onClick={limparFiltros}
                className="font-sans text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full bg-linear-to-r from-brand via-[#bd224b] to-brand text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand/30 cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {!loading && !erro && eventosFiltrados.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {eventosFiltrados.map((evento, index) => (
                <div
                  key={evento.id}
                  className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                  style={{
                    animationDelay: `${Math.min(index * 40, 240)}ms`,
                    animationDuration: "300ms",
                  }}
                >
                  <EventCard evento={evento} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}