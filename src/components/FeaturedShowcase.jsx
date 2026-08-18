import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePosterEvento } from "../utils/usePosterEvento";

const slideVariants = {
  initial: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
  }),
};

const AUTOPLAY_MS = 7000;

function formatarLocal(local) {
  if (!local || local.trim().length <= 2 || local.toLowerCase() === "local") {
    return "Local a confirmar";
  }
  return local;
}

function formatarPreco(valor) {
  if (valor === undefined || valor === null || valor === "") return null;
  const num = Number(valor);
  if (isNaN(num)) return null;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export default function FeaturedShowcase({ eventos, loading }) {
  const [indice, setIndice] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const temEventos = !loading && eventos && eventos.length > 0;
  const currentEvent = temEventos ? eventos[indice % eventos.length] : null;

  const { imageUrl, imgLoading, imgReady, marcarPronto, marcarErro } =
    usePosterEvento(currentEvent);

  const proximo = useCallback(() => {
    setDirection(1);
    setIndice((i) => (i + 1) % eventos.length);
  }, [eventos?.length]);

  function anterior() {
    setDirection(-1);
    setIndice((i) => (i - 1 + eventos.length) % eventos.length);
  }

  function irPara(novoIndice) {
    setDirection(novoIndice > indice ? 1 : -1);
    setIndice(novoIndice);
  }

  useEffect(() => {
    if (!temEventos || eventos.length <= 1 || isPaused) return;
    const timer = setInterval(proximo, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [temEventos, eventos?.length, isPaused, proximo]);

  let dataFormatada = "";
  let horaFormatada = "";
  if (currentEvent?.dataHora) {
    const data = new Date(currentEvent.dataHora);
    dataFormatada = data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
    horaFormatada = data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleKeyDown(e) {
    if (!temEventos || eventos.length <= 1) return;
    if (e.key === "ArrowRight") proximo();
    if (e.key === "ArrowLeft") anterior();
  }

  const precoFormatado = formatarPreco(currentEvent?.preco);

  return (
    <div className="relative max-w-5xl mx-auto px-6 z-20 overflow-visible">
      <div
        role="region"
        aria-label="Destaques em cartaz"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className="relative w-full bg-[#2d0a14]/85 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/60 min-h-95 p-6 sm:p-8 md:p-10 md:px-14 outline-none focus-visible:ring-2 focus-visible:ring-brand/50 card-ticket-mask"
      >
        {temEventos && eventos.length > 1 && (
          <>
            <button
              onClick={anterior}
              aria-label="Evento anterior"
              className="absolute -left-5 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#cbd5e1] hover:bg-white text-zinc-900 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xl hover:scale-105"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>

            <button
              onClick={proximo}
              aria-label="Próximo evento"
              className="absolute -right-5 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#cbd5e1] hover:bg-white text-zinc-900 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xl hover:scale-105"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </>
        )}

        {!temEventos && (
          <div className="flex flex-col md:flex-row items-center gap-8 min-h-80 animate-pulse">
            <div className="flex-1 w-full space-y-4 py-1">
              <div className="h-3 w-20 bg-white/10 rounded-full" />
              <div className="h-9 md:h-11 w-3/4 bg-white/10 rounded-lg" />
              <div className="h-3.5 w-1/2 bg-white/10 rounded-full" />
              <div className="h-12 w-full bg-white/10 rounded-lg" />
              <div className="h-10 w-36 bg-white/10 rounded-full mt-6" />
            </div>
            <div className="shrink-0">
              <div className="w-37.5 sm:w-45 md:w-52.5 aspect-2/3 rounded-2xl bg-white/10 ticket-mask" />
            </div>
          </div>
        )}

        {temEventos && (
          <div className="w-full overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentEvent.id || indice}
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 lg:gap-12 min-h-80 transform-gpu"
              >
                <div className="flex-1 flex flex-col justify-center my-auto py-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-sans text-[11px] font-bold text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {currentEvent.tipo || "Evento"}
                    </span>
                    {precoFormatado && (
                      <span className="font-sans text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        {precoFormatado}
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-wide leading-[1.05] mb-2 line-clamp-2">
                    {currentEvent.titulo || "Evento sem título"}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs md:text-sm text-white/70 mb-3">
                    <span className="flex items-center gap-1.5 font-medium text-white/90">
                      📍 {formatarLocal(currentEvent.local)}
                    </span>
                    {dataFormatada && (
                      <>
                        <span className="text-brand/70">•</span>
                        <span>
                          {dataFormatada} às {horaFormatada}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="font-sans text-xs md:text-sm text-white/60 line-clamp-2 leading-relaxed mb-6">
                    {currentEvent.descricao ||
                      "Garanta seu ingresso antecipado para este evento exclusivo. Vagas limitadas!"}
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate(`/eventos/${currentEvent.id}`)}
                      className="font-sans font-semibold text-xs uppercase tracking-wider bg-[#e2e8f0] text-[#1e293b] hover:bg-[#581c25] hover:text-white rounded-full px-8 py-3 transition-colors duration-300 ease-in-out active:scale-95 shadow-md hover:shadow-lg hover:shadow-[#581c25]/30"
                    >
                      Comprar
                    </button>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-center my-auto">
                  <div className="relative w-36 sm:w-44 md:w-52 aspect-2/3 overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl group ticket-mask">
                    {imgLoading && (
                      <div className="absolute inset-0 animate-pulse bg-linear-to-br from-zinc-800 to-zinc-900" />
                    )}

                    {!imgLoading && imageUrl && (
                      <img
                        src={imageUrl}
                        alt={currentEvent?.titulo || "Pôster do evento"}
                        onLoad={marcarPronto}
                        onError={marcarErro}
                        className={`w-full h-full object-cover object-center transform-gpu transition-all duration-500 ease-out group-hover:scale-105 ${
                          imgReady ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    )}

                    {!imgLoading && !imageUrl && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500 p-4">
                        <span className="font-sans text-xs text-center leading-snug">
                          Pôster indisponível
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {temEventos && eventos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
            {eventos.map((_, i) => (
              <button
                key={i}
                onClick={() => irPara(i)}
                aria-label={`Ir para destaque ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === indice
                    ? "w-6 bg-brand"
                    : "w-1.5 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}