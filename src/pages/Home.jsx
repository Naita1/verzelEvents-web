import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
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

  const eventosFiltrados = useMemo(() => {
    return eventos.filter((evento) => {
      const combinaBusca =
        evento.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        evento.local.toLowerCase().includes(busca.toLowerCase());
      const combinaTipo = tipoFiltro === "TODOS" || evento.tipo === tipoFiltro;
      return combinaBusca && combinaTipo;
    });
  }, [eventos, busca, tipoFiltro]);

  return (
    <div className="min-h-screen bg-bg">
      <Hero
        busca={busca}
        setBusca={setBusca}
        tipos={tipos}
        tipoFiltro={tipoFiltro}
        setTipoFiltro={setTipoFiltro}
        imagemFundo={backgroundImg}
      />

      <FeaturedShowcase eventos={eventosFiltrados} loading={loading} />

      <div className="py-16 md:py-20 mt-4">
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
              <motion.div
                key={evento.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
              >
                <EventCard evento={evento} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}