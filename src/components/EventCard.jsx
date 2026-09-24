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
      className="group relative w-full text-left rounded-3xl overflow-hidden bg-[#140509]/80 hover:bg-[#1a070d] border border-white/10 hover:border-brand/50 shadow-xl hover:shadow-2xl hover:shadow-brand/20 hover:-translate-y-1.5 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer flex flex-col justify-between transform-gpu"
    >
      <div className="absolute inset-0 bg-linear-to-t from-brand/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      <div className="relative aspect-2/3 w-full bg-[#0d0305] overflow-hidden">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/40 p-4 bg-linear-to-br from-zinc-900 to-[#140509]">
            <span className="w-11 h-11 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center shadow-inner">
              <span className="text-base font-bold text-brand">
                {tituloEvento.charAt(0).toUpperCase()}
              </span>
            </span>
            <span className="font-sans text-[10px] text-center uppercase tracking-widest text-white/50">
              Sem imagem
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />

        <span
          className={`absolute top-3 left-3 ${corBadgeDoEvento(
            evento?.tipo
          )} text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-md backdrop-blur-md border border-white/15 z-10`}
        >
          {evento?.tipo || "Evento"}
        </span>

        {precoFormatado && (
          <span className="absolute bottom-3 right-3 bg-[#0b0306]/85 backdrop-blur-md border border-white/15 text-emerald-400 text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg z-10">
            <span className="text-white/50 text-[10px] mr-1 font-normal">A partir de</span>
            {precoFormatado}
          </span>
        )}
      </div>

      <div className="p-4.5 flex flex-col justify-between flex-1 gap-3 relative z-10">
        <div>
          {dataFormatada && (
            <span className="text-[10px] font-bold text-brand tracking-widest uppercase block mb-1.5">
              {dataFormatada}
            </span>
          )}
          <h3 className="font-display text-sm md:text-base text-white uppercase tracking-wide leading-snug line-clamp-2 group-hover:text-brand-light transition-colors">
            {tituloEvento}
          </h3>
        </div>

        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-sans text-white/70 gap-2">
          <div className="flex items-center min-w-0 truncate">
            <svg className="w-3.5 h-3.5 text-brand shrink-0 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate text-white/75 group-hover:text-white/90 transition-colors" title={localFormatado}>
              {localFormatado}
            </span>
          </div>

          <span className="shrink-0 text-white/40 group-hover:text-brand group-hover:translate-x-0.5 transition-all">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

export default memo(EventCard);