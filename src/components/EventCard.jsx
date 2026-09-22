import { memo } from "react";
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

function formatarData(dataIso) {
  if (!dataIso) return null;
  try {
    const data = new Date(dataIso);
    if (isNaN(data.getTime())) return null;
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function EventCard({ evento }) {
  const navigate = useNavigate();
  const { imageUrl, imgLoading, imgReady, marcarPronto, marcarErro } =
    usePosterEvento(evento);

  const precoFormatado = formatarPreco(
    evento?.preco || evento?.valorIngresso || evento?.valor
  );
  const dataFormatada = formatarData(evento?.dataHora || evento?.data);
  const localFormatado = evento?.local?.trim() || "Local a confirmar";
  const tituloEvento = evento?.titulo || "Evento sem título";

  return (
    <button
      type="button"
      onClick={() => navigate(`/eventos/${evento.id}`)}
      aria-label={`${tituloEvento}. ${dataFormatada ? `Data: ${dataFormatada}.` : ""} Local: ${localFormatado}.${precoFormatado ? ` A partir de ${precoFormatado}.` : ""}`}
      className="group relative w-full text-left rounded-2xl overflow-hidden bg-[#1c080e]/90 hover:bg-[#250b13] border border-white/10 hover:border-brand/40 shadow-lg hover:shadow-2xl hover:shadow-brand/10 hover:-translate-y-1.5 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer flex flex-col justify-between"
    >
      {/* Brilho sutil no hover */}
      <div className="absolute inset-0 bg-linear-to-t from-brand/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Pôster do Evento */}
      <div className="relative aspect-2/3 w-full bg-[#18080c] overflow-hidden">
        {imgLoading && (
          <div className="absolute inset-0 animate-pulse bg-linear-to-br from-zinc-800 to-zinc-900" />
        )}

        {!imgLoading && imageUrl && (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
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
                {tituloEvento.charAt(0).toUpperCase()}
              </span>
            </span>
            <span className="font-sans text-[10px] text-center uppercase tracking-widest">
              Sem imagem
            </span>
          </div>
        )}

        {/* Badge Categoria/Tipo */}
        <span
          className={`absolute top-3 left-3 ${corBadgeDoEvento(
            evento?.tipo
          )} text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm border border-white/10`}
        >
          {evento?.tipo || "Evento"}
        </span>

        {/* Badge Preço */}
        {precoFormatado && (
          <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md border border-white/10 text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md">
            {precoFormatado}
          </span>
        )}
      </div>

      {/* Metadados do Evento */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-2.5">
        <div>
          {dataFormatada && (
            <span className="text-[10px] font-semibold text-brand tracking-wider uppercase block mb-1">
              {dataFormatada}
            </span>
          )}
          <h3 className="font-display text-sm md:text-base text-white uppercase tracking-wide leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {tituloEvento}
          </h3>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center text-[11px] text-white/70 font-sans truncate">
          <span className="mr-1.5 opacity-80" aria-hidden="true">📍</span>
          <span className="truncate" title={localFormatado}>
            {localFormatado}
          </span>
        </div>
      </div>
    </button>
  );
}

export default memo(EventCard);