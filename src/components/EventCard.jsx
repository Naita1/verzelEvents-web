import { useNavigate } from "react-router-dom";
import { imagemDoEvento, corBadgeDoEvento } from "../utils/eventVisuals";
import { usePosterEvento } from "../utils/usePosterEvento";

export default function EventCard({ evento }) {
  const navigate = useNavigate();
  const { imageUrl, imgLoading, imgReady, marcarPronto } = usePosterEvento(evento);

  const data = new Date(evento.dataHora);
  const dataFormatada = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  const horaFormatada = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const imagemExibida = imageUrl || imagemDoEvento(evento.tipo);

  return (
    <button
      onClick={() => navigate(`/eventos/${evento.id}`)}
      className="group h-full flex flex-col text-left bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-brand/50 transition-colors"
    >
      <div className="relative aspect-3/2 shrink-0 overflow-hidden bg-zinc-900">
        {imgLoading && (
          <div className="absolute inset-0 animate-pulse bg-linear-to-br from-zinc-800 to-zinc-900" />
        )}

        {!imgLoading && (
          <img
            src={imagemExibida}
            alt={evento.titulo}
            onLoad={marcarPronto}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
              imgReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        <span
          className={`absolute top-3 left-3 ${corBadgeDoEvento(
            evento.tipo
          )} text-white text-xs font-sans font-semibold px-2 py-1 rounded-md uppercase tracking-wide`}
        >
          {evento.tipo}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-2xl tracking-wide text-white leading-tight line-clamp-2">
          {evento.titulo}
        </h3>
        <p className="font-sans text-white/50 text-sm mt-1 truncate">
          {evento.local}
        </p>

        <div className="flex items-center justify-between gap-2 mt-auto pt-4">
          <span className="font-sans text-white/70 text-sm whitespace-nowrap">
            {dataFormatada} · {horaFormatada}
          </span>
          <span className="font-display text-xl text-brand whitespace-nowrap">
            R$ {evento.preco.toFixed(2)}
          </span>
        </div>
      </div>
    </button>
  );
}