import { useEffect, useState, useMemo, useDeferredValue } from "react";
import { listarEventos } from "../services/eventService";
import Hero from "../components/Hero";
import FeaturedShowcase from "../components/FeaturedShowcase";
import EventCard from "../components/EventCard";
import backgroundImg from "../assets/background.jpg";

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    listarEventos()
      .then(setEventos)
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, []);

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

return (
  <div className="min-h-screen bg-bg">
    {/* Removido o 'overflow-hidden' daqui */}
    <div className="relative w-full">
      {/* 'overflow-hidden' adicionado apenas na camada do background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={backgroundImg}
          alt="Background Eventos"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#1a050b]/85 via-[#0f0407]/90 to-bg" />
        <div className="absolute inset-0 bg-black/40" />
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
    </div>
      <div className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-sans text-[11px] font-semibold text-brand uppercase tracking-[0.2em] block mb-2">
                Catálogo completo
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide">
                TODOS OS <span className="text-brand">EVENTOS</span>
              </h2>
            </div>
            {!loading && !erro && (
              <span className="font-sans text-xs text-white/40 whitespace-nowrap mb-1">
                {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {erro && <p className="font-sans text-red-400">{erro}</p>}
          {!loading && !erro && eventosFiltrados.length === 0 && (
            <p className="font-sans text-white/50">Nenhum evento encontrado.</p>
          )}

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
        </div>
      </div>
    </div>
  );
}