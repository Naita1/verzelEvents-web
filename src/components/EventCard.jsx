import { memo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
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
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const arrowPathRef = useRef(null);

  const { imageUrl, imgLoading, imgReady, marcarPronto, marcarErro } =
    usePosterEvento(evento);

  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const handleMouseEnter = () => {
        gsap.to(cardEl, {
          y: -6,
          scale: 1.015,
          duration: 0.35,
          ease: "power2.out",
        });
        if (glowRef.current) {
          gsap.to(glowRef.current, { opacity: 0.8, duration: 0.4 });
        }
      };

      const handleMouseLeave = () => {
        gsap.to(cardEl, {
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
        });
        if (glowRef.current) {
          gsap.to(glowRef.current, { opacity: 0, duration: 0.3 });
        }
      };

      cardEl.addEventListener("mouseenter", handleMouseEnter);
      cardEl.addEventListener("mouseleave", handleMouseLeave);
    }, cardRef);

    return () => ctx.revert();
  }, []);

  const precoFormatado = formatarPreco(
    evento?.preco || evento?.valorIngresso || evento?.valor
  );
  const dataFormatada = formatarData(evento?.dataHora || evento?.data);
  const localFormatado = evento?.local?.trim() || "Local a confirmar";
  const tituloEvento = evento?.titulo || "Evento sem título";

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={() => navigate(`/eventos/${evento.id}`)}
      aria-label={`${tituloEvento}. ${dataFormatada ? `Data: ${dataFormatada}.` : ""} Local: ${localFormatado}.${precoFormatado ? ` A partir de ${precoFormatado}.` : ""}`}
      style={{
        WebkitMaskImage:
          "radial-gradient(circle at 0% calc(100% - 100px), transparent 9px, black 9.5px), radial-gradient(circle at 100% calc(100% - 100px), transparent 9px, black 9.5px)",
        maskImage:
          "radial-gradient(circle at 0% calc(100% - 100px), transparent 9px, black 9.5px), radial-gradient(circle at 100% calc(100% - 100px), transparent 9px, black 9.5px)",
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
      }}
      className="group relative w-full text-left rounded-3xl overflow-hidden bg-[#140509]/85 hover:bg-[#19060c] border border-white/10 hover:border-brand/60 shadow-xl hover:shadow-[0_16px_36px_rgba(161,27,62,0.25)] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer flex flex-col justify-between transform-gpu"
    >
      <div
        ref={glowRef}
        className="absolute inset-0 bg-linear-to-t from-brand/20 via-brand/5 to-transparent opacity-0 pointer-events-none z-10"
      />

      <div className="relative aspect-2/3 w-full bg-[#0d0305] overflow-hidden select-none">
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
            className={`w-full h-full object-cover object-center transform-gpu transition-transform duration-700 ease-out group-hover:scale-108 ${
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

        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#140509] via-[#140509]/60 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span
            className={`${corBadgeDoEvento(
              evento?.tipo
            )} text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md backdrop-blur-md border border-white/20`}
          >
            {evento?.tipo || "Evento"}
          </span>

          {dataFormatada && (
            <span className="bg-bg/85 backdrop-blur-md border border-white/15 text-white/90 text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-full shadow-sm">
              {dataFormatada}
            </span>
          )}
        </div>

        {precoFormatado && (
          <div className="absolute bottom-3 right-3 bg-bg/90 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold px-3 py-1 rounded-full shadow-xl z-10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 text-[10px] font-normal">A partir de</span>
            <span className="font-bold">{precoFormatado}</span>
          </div>
        )}
      </div>

      <div className="relative px-4 w-full flex items-center justify-center my-0 pointer-events-none select-none z-10">
        <svg className="w-full h-1 text-white/15 overflow-visible" aria-hidden="true">
          <line
            x1="0"
            y1="0"
            x2="100%"
            y2="0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
        </svg>
      </div>

      <div className="p-4 pt-3 flex flex-col justify-between flex-1 gap-3 relative z-10">
        <div>
          <h3 className="font-display text-sm md:text-base text-white uppercase tracking-wide leading-snug line-clamp-2 group-hover:text-brand-light transition-colors duration-200">
            {tituloEvento}
          </h3>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-sans text-white/70 gap-2">
          <div className="flex items-center min-w-0 truncate">
            <svg className="w-3.5 h-3.5 text-brand shrink-0 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate text-white/75 group-hover:text-white/90 transition-colors" title={localFormatado}>
              {localFormatado}
            </span>
          </div>

          <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white/5 group-hover:bg-brand text-white/40 group-hover:text-white transition-all duration-300">
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path ref={arrowPathRef} d="M9 18l6-6-6-6" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

export default memo(EventCard);