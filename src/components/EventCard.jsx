import { useNavigate } from "react-router-dom";
import { imagemDoEvento, corBadgeDoEvento } from "../utils/eventVisuals";

export default function EventCard({ evento }) {
  const navigate = useNavigate();

  const data = new Date(evento.dataHora);
  const dataFormatada = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  const horaFormatada = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button
      onClick={() => navigate(`/eventos/${evento.id}`)}
      className="group text-left bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-brand/50 transition-colors"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={imagemDoEvento(evento.tipo)}
          alt={evento.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span
          className={`absolute top-3 left-3 ${corBadgeDoEvento(
            evento.tipo
          )} text-white text-xs font-sans font-semibold px-2 py-1 rounded-md uppercase tracking-wide`}
        >
          {evento.tipo}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-display text-2xl tracking-wide text-white leading-tight">
          {evento.titulo}
        </h3>
        <p className="font-sans text-white/50 text-sm mt-1">
          {evento.local}
        </p>

        <div className="flex items-center justify-between mt-4">
          <span className="font-sans text-white/70 text-sm">
            {dataFormatada} · {horaFormatada}
          </span>
          <span className="font-display text-xl text-brand">
            R$ {evento.preco.toFixed(2)}
          </span>
        </div>
      </div>
    </button>
  );
}