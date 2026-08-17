import { useEffect, useState, useMemo } from "react";
import { listarEventos } from "../services/eventService";
import EventCard from "../components/EventCard";

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
    <div className="min-h-screen bg-bg px-6 md:px-16 py-12">
      <span className="font-sans text-white/40 text-sm tracking-widest uppercase">
        Plataforma de Eventos
      </span>
      <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide mt-2">
        O QUE VOCÊ QUER <span className="text-brand">VIVER</span> HOJE?
      </h1>

      <div className="flex flex-col md:flex-row gap-3 mt-8">
        <input
          type="text"
          placeholder="Buscar por evento ou local..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 bg-surface border border-white/10 rounded-lg px-4 py-2 text-white font-sans outline-none focus:border-brand transition-colors"
        />
        <div className="flex gap-2 overflow-x-auto">
          {tipos.map((tipo) => (
            <button
              key={tipo}
              onClick={() => setTipoFiltro(tipo)}
              className={`font-sans text-sm px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                tipoFiltro === tipo
                  ? "bg-brand text-white"
                  : "bg-surface text-white/60 border border-white/10 hover:border-white/30"
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="font-sans text-white/50 mt-12">Carregando eventos...</p>
      )}
      {erro && (
        <p className="font-sans text-red-400 mt-12">{erro}</p>
      )}
      {!loading && !erro && eventosFiltrados.length === 0 && (
        <p className="font-sans text-white/50 mt-12">
          Nenhum evento encontrado.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {eventosFiltrados.map((evento) => (
          <EventCard key={evento.id} evento={evento} />
        ))}
      </div>
    </div>
  );
}