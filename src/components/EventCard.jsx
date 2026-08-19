import { useNavigate } from "react-router-dom";
import { usePosterEvento } from "../utils/usePosterEvento";
import { corBadgeDoEvento } from "../utils/eventVisuals";

function formatarPreco(valor) {
  const num = Number(valor);
  if (isNaN(num) || num <= 0) return null;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export default function EventCard({ evento }) {
  const navigate = useNavigate();
  const { imageUrl, imgLoading, imgReady, marcarPronto, marcarErro } =
    usePosterEvento(evento);

  const precoFormatado = formatarPreco(
    evento?.preco || evento?.valorIngresso || evento?.valor
  );

  return (
    <button
      type="button"
      onClick={() => navigate(`/eventos/${evento.id}`)}
      className="group w-full text-left rounded-2xl overflow-hidden bg-[#2a0e16]/90 border border-white/10 shadow-lg hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 ease-out"
    >
      <div className="relative aspect-2/3 w-full bg-[#18080c] overflow-hidden">
        {imgLoading && (
          <div className="absolute inset-0 animate-pulse bg-linear-to-br from-zinc-800 to-zinc-900" />
        )}

        {!imgLoading && imageUrl && (
          <img
            src={imageUrl}
            alt={evento?.titulo || "Evento"}
            onLoad={marcarPronto}
            onError={marcarErro}
            className={`w-full h-full object-cover object-center transform-gpu transition-all duration-500 ease-out group-hover:scale-105 ${
              imgReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {!imgLoading && !imageUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/40 p-4">
            <span className="w-10 h-10 rounded-full bg-[#a11b3e]/20 border border-[#a11b3e] flex items-center justify-center">
              <span className="text-sm font-bold text-[#a11b3e]">
                {evento?.titulo ? evento.titulo.charAt(0).toUpperCase() : "E"}
              </span>
            </span>
            <span className="font-sans text-[10px] text-center uppercase tracking-widest">
              Sem imagem
            </span>
          </div>
        )}

        <span
          className={`absolute top-3 left-3 ${corBadgeDoEvento(
            evento?.tipo
          )} text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm`}
        >
          {evento?.tipo || "Evento"}
        </span>

        {precoFormatado && (
          <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {precoFormatado}
          </span>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="font-display text-sm text-white uppercase tracking-wide leading-snug line-clamp-2 mb-1">
          {evento?.titulo || "Evento sem título"}
        </h3>
        <p className="font-sans text-[11px] text-white/50 truncate">
          📍 {evento?.local || "Local a confirmar"}
        </p>
      </div>
    </button>
  );
}